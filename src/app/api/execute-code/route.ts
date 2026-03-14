import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY!;

// Use latest stable versions
const LANG_IDS: Record<string, number> = {
  python:     71,  // Python 3.8.1
  javascript: 93,  // Node.js 18.15.0
  typescript: 94,  // TypeScript 5.0.3
  java:       91,  // JDK 17.0.6
  cpp:        54,  // GCC 9.2.0
  go:         95,  // Go 1.18.5
  rust:       73,  // Rust 1.40.0
  csharp:     51,  // Mono 6.6.0
};

interface LCProblem {
  frontendQuestionId: string;
  description: string;
  solution_code_python?: string | null;
}

let _cache: Map<number, LCProblem> | null = null;
function getProblemsMap(): Map<number, LCProblem> {
  if (_cache) return _cache;
  const raw = fs.readFileSync(path.join(process.cwd(), 'leetcode_problems.json'), 'utf-8');
  const problems = JSON.parse(raw) as LCProblem[];
  _cache = new Map(problems.map(p => [parseInt(p.frontendQuestionId), p]));
  return _cache;
}

interface TestCase { inputs: string[]; expected: string; isCustom?: boolean; }
interface FuncInfo {
  name: string;
  params: Array<{ name: string; pyType: string }>;
  returnType: string;
}

// ── Parsing ────────────────────────────────────────────────────────────────

function parseTestCases(html: string): TestCase[] {
  const cases: TestCase[] = [];
  const preRe = /<pre>([\s\S]*?)<\/pre>/gi;
  let m;
  while ((m = preRe.exec(html)) !== null) {
    const text = m[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let inp = '', out = '';
    for (const l of lines) {
      if (/^Input:/i.test(l))  inp = l.replace(/^Input:\s*/i, '');
      if (/^Output:/i.test(l)) out = l.replace(/^Output:\s*/i, '');
    }
    if (inp && out) cases.push({ inputs: splitInputValues(inp), expected: out });
  }
  return cases.slice(0, 3);
}

function splitInputValues(inputLine: string): string[] {
  const vals: string[] = [];
  const parts = inputLine.split(/,\s*(?=[a-zA-Z_]\w*\s*=)/);
  for (const p of parts) {
    const eq = p.indexOf('=');
    if (eq !== -1) vals.push(p.slice(eq + 1).trim());
  }
  return vals.length ? vals : [inputLine];
}

// Bracket-aware split for custom inputs like "[1,2,3], 6"
function bracketSplit(input: string): string[] {
  const parts: string[] = [];
  let depth = 0, cur = '';
  for (const ch of input) {
    if ('[({'.includes(ch)) depth++;
    else if ('])}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function parseCustomInput(input: string): string[] {
  const trimmed = input.trim();
  // LeetCode raw format: one param per line
  const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) return lines;
  // "param = val, param = val" format
  if (/[a-zA-Z_]\w*\s*=/.test(trimmed)) return splitInputValues(trimmed);
  // bare "val, val" format
  return bracketSplit(trimmed);
}

function parseFuncInfo(pyCode: string): FuncInfo | null {
  const m = pyCode.match(/def\s+(\w+)\s*\(\s*self\s*,?\s*([^)]*)\)\s*(?:->\s*(.+?))?\s*:/);
  if (!m) return null;
  const params: Array<{ name: string; pyType: string }> = [];
  if (m[2].trim()) {
    for (const part of m[2].split(',')) {
      const t = part.trim();
      if (!t) continue;
      const [pn, pt] = t.includes(':') ? t.split(':').map(s => s.trim()) : [t, 'any'];
      params.push({ name: pn, pyType: pt });
    }
  }
  return { name: m[1], params, returnType: (m[3] || 'None').trim() };
}

// Detect if problem uses trees/linked lists (we can't auto-test those)
function usesComplexTypes(funcInfo: FuncInfo): boolean {
  const complex = /TreeNode|ListNode|Node|Optional\[TreeNode\]|Optional\[ListNode\]/;
  return complex.test(funcInfo.returnType) || funcInfo.params.some(p => complex.test(p.pyType));
}

// ── Type mappings ──────────────────────────────────────────────────────────

function pyToJava(t: string): string {
  const m: Record<string,string> = {
    'int':'int','float':'double','str':'String','bool':'boolean','None':'void','void':'void',
    'List[int]':'int[]','List[str]':'String[]','List[float]':'double[]','List[bool]':'boolean[]',
    'List[List[int]]':'int[][]','List[List[str]]':'String[][]',
  };
  return m[t] || 'Object';
}

function pyToCpp(t: string): string {
  const m: Record<string,string> = {
    'int':'int','float':'double','str':'string','bool':'bool','None':'void','void':'void',
    'List[int]':'vector<int>','List[str]':'vector<string>','List[float]':'vector<double>',
    'List[List[int]]':'vector<vector<int>>','List[List[str]]':'vector<vector<string>>',
  };
  return m[t] || 'auto';
}

function pyToGo(t: string): string {
  const m: Record<string,string> = {
    'int':'int','float':'float64','str':'string','bool':'bool',
    'List[int]':'[]int','List[str]':'[]string','List[float]':'[]float64',
    'List[List[int]]':'[][]int','List[List[str]]':'[][]string',
  };
  return m[t] || 'interface{}';
}

function pyToRust(t: string): string {
  const m: Record<string,string> = {
    'int':'i32','float':'f64','str':'String','bool':'bool',
    'List[int]':'Vec<i32>','List[str]':'Vec<String>','List[float]':'Vec<f64>',
    'List[List[int]]':'Vec<Vec<i32>>',
  };
  return m[t] || 'i32';
}

function pyToCsharp(t: string): string {
  const m: Record<string,string> = {
    'int':'int','float':'double','str':'string','bool':'bool','None':'void','void':'void',
    'List[int]':'int[]','List[str]':'string[]','List[float]':'double[]',
    'List[List[int]]':'int[][]','List[List[str]]':'string[][]',
  };
  return m[t] || 'object';
}

// ── Input value → language literal ────────────────────────────────────────

function toLiteral(val: string, pyType: string, lang: 'java'|'cpp'|'go'|'rust'|'csharp'): string {
  const s = val.trim();
  switch (pyType) {
    case 'int':   return s;
    case 'float': return s.includes('.') ? s : s + '.0';
    case 'bool':  return s.toLowerCase() === 'true' ? 'true' : 'false';
    case 'str':   return s; // already has quotes
    case 'List[int]': {
      const inner = s.replace(/^\[|\]$/g, '').trim();
      if (lang === 'java')   return `new int[]{${inner}}`;
      if (lang === 'cpp')    return `vector<int>{${inner}}`;
      if (lang === 'go')     return `[]int{${inner}}`;
      if (lang === 'rust')   return `vec![${inner}]`;
      if (lang === 'csharp') return `new int[]{${inner}}`;
      break;
    }
    case 'List[str]': {
      const inner = s.replace(/^\[|\]$/g, '').trim();
      if (lang === 'java')   return `new String[]{${inner}}`;
      if (lang === 'cpp')    return `vector<string>{${inner}}`;
      if (lang === 'go')     return `[]string{${inner}}`;
      if (lang === 'rust')   return `vec![${inner.split(',').map(x => x.trim() + '.to_string()').join(', ')}]`;
      if (lang === 'csharp') return `new string[]{${inner}}`;
      break;
    }
    case 'List[List[int]]': {
      try {
        const parsed = JSON.parse(s) as number[][];
        const rows = parsed.map(r => r.join(','));
        if (lang === 'java')   return `new int[][]{${rows.map(r => `{${r}}`).join(',')}}`;
        if (lang === 'cpp')    return `vector<vector<int>>{${rows.map(r => `{${r}}`).join(',')}}`;
        if (lang === 'go')     return `[][]int{${rows.map(r => `{${r}}`).join(',')}}`;
        if (lang === 'rust')   return `vec![${rows.map(r => `vec![${r}]`).join(', ')}]`;
        if (lang === 'csharp') return `new int[][]{${rows.map(r => `new int[]{${r}}`).join(',')}}`;
      } catch { /* fall through */ }
      break;
    }
    case 'List[float]': {
      const inner = s.replace(/^\[|\]$/g, '').trim();
      if (lang === 'java')   return `new double[]{${inner}}`;
      if (lang === 'cpp')    return `vector<double>{${inner}}`;
      if (lang === 'go')     return `[]float64{${inner}}`;
      if (lang === 'rust')   return `vec![${inner}f64]`;
      if (lang === 'csharp') return `new double[]{${inner}}`;
      break;
    }
  }
  return s;
}

// ── Result comparison & serialization ────────────────────────────────────

interface CmpHelper { compare: string; serialize: string; helpers: string; }

function javaCmp(vn: string, expected: string, pyType: string): CmpHelper {
  const ex = expected.trim();
  switch (pyType) {
    case 'int': case 'float': case 'bool':
      return { compare: `${vn} == ${ex}`, serialize: `String.valueOf(${vn})`, helpers: '' };
    case 'str':
      return { compare: `${JSON.stringify(ex)}.equals(${vn})`, serialize: vn, helpers: '' };
    case 'List[int]': {
      const inner = ex.replace(/^\[|\]$/g, '').trim();
      const exp = inner ? `new int[]{${inner}}` : 'new int[]{}';
      return {
        compare: `_arrEq(${vn}, ${exp})`,
        serialize: `java.util.Arrays.toString(${vn}).replace(", ",",")`,
        helpers: `static boolean _arrEq(int[] a, int[] b){if(a==null||b==null)return a==b;int[]s=a.clone(),t=b.clone();java.util.Arrays.sort(s);java.util.Arrays.sort(t);return java.util.Arrays.equals(s,t)||java.util.Arrays.equals(a,b);}`,
      };
    }
    case 'List[str]': {
      const inner = ex.replace(/^\[|\]$/g, '').trim();
      const exp = inner ? `new String[]{${inner}}` : 'new String[]{}';
      return {
        compare: `java.util.Arrays.equals(${vn}, ${exp})`,
        serialize: `java.util.Arrays.toString(${vn}).replace(", ",",")`,
        helpers: '',
      };
    }
    case 'List[List[int]]': {
      try {
        const parsed = JSON.parse(ex) as number[][];
        const exp = `new int[][]{${parsed.map(r=>`{${r.join(',')}}`).join(',')}}`;
        return {
          compare: `java.util.Arrays.deepEquals(${vn}, ${exp})`,
          serialize: `java.util.Arrays.deepToString(${vn}).replace(", ",",")`,
          helpers: '',
        };
      } catch { break; }
    }
  }
  return { compare: `String.valueOf(${vn}).equals(${JSON.stringify(ex)})`, serialize: `String.valueOf(${vn})`, helpers: '' };
}

function cppCmp(vn: string, expected: string, pyType: string): CmpHelper {
  const ex = expected.trim();
  switch (pyType) {
    case 'int': case 'float':
      return { compare: `${vn}==${ex}`, serialize: `to_string(${vn})`, helpers: '' };
    case 'bool':
      return { compare: `${vn}==${ex.toLowerCase()}`, serialize: `(${vn}?"true":"false")`, helpers: '' };
    case 'str':
      return { compare: `${vn}==${ex}`, serialize: vn, helpers: '' };
    case 'List[int]': {
      const inner = ex.replace(/^\[|\]$/g, '').trim();
      const exp = inner ? `vector<int>{${inner}}` : 'vector<int>{}';
      return {
        compare: `_veq(${vn},${exp})`,
        serialize: `_vs(${vn})`,
        helpers: `bool _veq(vector<int>a,vector<int>b){sort(a.begin(),a.end());sort(b.begin(),b.end());return a==b;}
string _vs(const vector<int>&v){string s="[";for(int i=0;i<(int)v.size();i++){if(i)s+=",";s+=to_string(v[i]);}return s+"]";}`,
      };
    }
    case 'List[str]': {
      const inner = ex.replace(/^\[|\]$/g, '').trim();
      const exp = inner ? `vector<string>{${inner}}` : 'vector<string>{}';
      return {
        compare: `${vn}==${exp}`,
        serialize: `_vss(${vn})`,
        helpers: `string _vss(const vector<string>&v){string s="[";for(int i=0;i<(int)v.size();i++){if(i)s+=",";s+="\\""+v[i]+"\\"";} return s+"]";}`,
      };
    }
    case 'List[List[int]]': {
      try {
        const parsed = JSON.parse(ex) as number[][];
        const exp = `vector<vector<int>>{${parsed.map(r=>`{${r.join(',')}}`).join(',')}}`;
        return {
          compare: `${vn}==${exp}`,
          serialize: `_vvs(${vn})`,
          helpers: `string _vvs(const vector<vector<int>>&v){string s="[";for(int i=0;i<(int)v.size();i++){if(i)s+=",";s+="[";for(int j=0;j<(int)v[i].size();j++){if(j)s+=",";s+=to_string(v[i][j]);}s+="]";}return s+"]";}`,
        };
      } catch { break; }
    }
  }
  return { compare: `to_string(${vn})==${JSON.stringify(ex)}`, serialize: `to_string(${vn})`, helpers: '' };
}

// ── Harness builders ──────────────────────────────────────────────────────

function buildPythonHarness(code: string, funcName: string, cases: TestCase[]): string {
  const casesJson = JSON.stringify(cases).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `import json

${code}

def _p(s):
    try:
        import ast; return ast.literal_eval(s.strip())
    except: return s.strip()

def _eq(a, b):
    if isinstance(a, list) and isinstance(b, list):
        if a == b: return True
        try: return sorted(str(x) for x in a) == sorted(str(x) for x in b)
        except: pass
    return str(a) == str(b)

_sol = Solution()
_cases = json.loads('${casesJson}')
_passed = 0; _results = []
for _tc in _cases:
    try:
        _ins = [_p(v) for v in _tc['inputs']]
        _res = _sol.${funcName}(*_ins)
        _out = json.dumps(_res)
        if _tc.get('isCustom'):
            _results.append({'passed': None, 'output': _out, 'expected': None, 'isCustom': True})
        else:
            _exp = _p(_tc['expected'])
            _ok = _eq(_res, _exp)
            if _ok: _passed += 1
            _results.append({'passed': _ok, 'output': _out, 'expected': _tc['expected']})
    except Exception as _e:
        _results.append({'passed': False, 'output': 'Error: ' + str(_e), 'expected': _tc.get('expected', ''), 'isCustom': _tc.get('isCustom', False)})
print(json.dumps({'passed': _passed, 'total': len(_cases), 'results': _results}))`;
}

function buildJsHarness(code: string, funcName: string, cases: TestCase[]): string {
  return `${code}
const _cases = ${JSON.stringify(cases)};
function _p(s){try{return JSON.parse(s);}catch(e){return s;}}
function _eq(a,b){
  if(Array.isArray(a)&&Array.isArray(b)){
    if(JSON.stringify(a)===JSON.stringify(b))return true;
    return JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
  }
  return String(a)===String(b);
}
let _passed=0,_results=[];
for(const _tc of _cases){
  try{
    const _ins=_tc.inputs.map(_p);
    const _res=${funcName}(..._ins);
    const _out=JSON.stringify(_res);
    if(_tc.isCustom){
      _results.push({passed:null,output:_out,expected:null,isCustom:true});
    } else {
      const _exp=_p(_tc.expected);
      const _ok=_eq(_res,_exp);
      if(_ok)_passed++;
      _results.push({passed:_ok,output:_out,expected:_tc.expected});
    }
  }catch(_e){
    _results.push({passed:false,output:'Error: '+_e.message,expected:_tc.expected,isCustom:_tc.isCustom||false});
  }
}
console.log(JSON.stringify({passed:_passed,total:_cases.length,results:_results}));`;
}

function buildJavaHarness(code: string, fi: FuncInfo, cases: TestCase[]): string {
  const retJava = pyToJava(fi.returnType);
  let helpers = new Set<string>();
  let testBody = '';

  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const paramDecls = fi.params.map((p, j) => {
      const jType = pyToJava(p.pyType);
      const lit = toLiteral(tc.inputs[j] ?? '0', p.pyType, 'java');
      return `        ${jType} _p${i}_${j}=${lit};`;
    }).join('\n');
    const args = fi.params.map((_, j) => `_p${i}_${j}`).join(',');
    if (tc.isCustom) {
      const { serialize, helpers: h } = javaCmp(`_r${i}`, '', fi.returnType);
      if (h) helpers.add(h);
      testBody += `${paramDecls}
        ${retJava} _r${i}=sol.${fi.name}(${args});
        _sb.append(",{\\"passed\\":null,\\"output\\":\\""+${serialize}+"\\",\\"expected\\":null,\\"isCustom\\":true}");
`;
    } else {
      const { compare, serialize, helpers: h } = javaCmp(`_r${i}`, tc.expected, fi.returnType);
      if (h) helpers.add(h);
      testBody += `${paramDecls}
        ${retJava} _r${i}=sol.${fi.name}(${args});
        boolean _ok${i}=${compare};
        if(_ok${i})_passed++;
        _sb.append(",{\\"passed\\":"+_ok${i}+",\\"output\\":\\""+${serialize}+"\\""+",\\"expected\\":${JSON.stringify(tc.expected)}}");
`;
    }
  }

  return `import java.util.*;
${code}
public class Main{
    ${[...helpers].join('\n    ')}
    public static void main(String[] args){
        Solution sol=new Solution();
        int _passed=0;
        StringBuilder _sb=new StringBuilder();
${testBody}
        int _total=${cases.length};
        System.out.println("{\\"passed\\":"+_passed+",\\"total\\":"+_total+",\\"results\\":["+(_sb.length()>0?_sb.substring(1):"")+"]}" );
    }
}`;
}

function buildCppHarness(code: string, fi: FuncInfo, cases: TestCase[]): string {
  const retCpp = pyToCpp(fi.returnType);
  let helpers = new Set<string>();
  let testBody = '';

  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const paramDecls = fi.params.map((p, j) => {
      const cType = pyToCpp(p.pyType);
      const lit = toLiteral(tc.inputs[j] ?? '0', p.pyType, 'cpp');
      return `    ${cType} _p${i}_${j}=${lit};`;
    }).join('\n');
    const args = fi.params.map((_, j) => `_p${i}_${j}`).join(',');
    if (tc.isCustom) {
      const { serialize, helpers: h } = cppCmp(`_r${i}`, '', fi.returnType);
      if (h) helpers.add(h);
      testBody += `${paramDecls}
    ${retCpp} _r${i}=sol.${fi.name}(${args});
    _res+=",{\\"passed\\":null,\\"output\\":\\""+${serialize}+"\\",\\"expected\\":null,\\"isCustom\\":true}";
`;
    } else {
      const { compare, serialize, helpers: h } = cppCmp(`_r${i}`, tc.expected, fi.returnType);
      if (h) helpers.add(h);
      testBody += `${paramDecls}
    ${retCpp} _r${i}=sol.${fi.name}(${args});
    bool _ok${i}=${compare};
    if(_ok${i})_passed++;
    string _e${i}=${JSON.stringify(tc.expected)};
    _res+=",{\\"passed\\":"+(_ok${i}?"true":"false")+",\\"output\\":\\""+${serialize}+"\\""+",\\"expected\\":\\""+_e${i}+"\\"}";
`;
    }
  }

  return `#include<bits/stdc++.h>
using namespace std;
${[...helpers].join('\n')}
${code}
int main(){
    Solution sol;
    int _passed=0;
    string _res="";
${testBody}
    int _total=${cases.length};
    cout<<"{\\"passed\\":" <<_passed<<",\\"total\\":" <<_total<<",\\"results\\":[" <<(_res.size()>0?_res.substr(1):"")<< "]}"<<endl;
    return 0;
}`;
}

function buildGoHarness(code: string, fi: FuncInfo, cases: TestCase[]): string {
  let testBody = '';

  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const paramDecls = fi.params.map((p, j) => {
      const gType = pyToGo(p.pyType);
      const lit = toLiteral(tc.inputs[j] ?? '0', p.pyType, 'go');
      return `    _p${i}_${j} := ${gType}(${lit})`;
    }).join('\n');

    // For Go, use fmt.Sprintf for comparison via string representation
    const args = fi.params.map((_, j) => `_p${i}_${j}`).join(', ');
    testBody += `${paramDecls}
    _r${i} := ${fi.name}(${args})
    _exp${i} := ${JSON.stringify(tc.expected)}
    _out${i}, _ := json.Marshal(_r${i})
    _expParsed${i}, _ := json.Marshal(_r${i}) // placeholder
    _ = _expParsed${i}
    _ok${i} := strings.Replace(string(_out${i}), " ", "", -1) == strings.Replace(_exp${i}, " ", "", -1)
    if !_ok${i} {
        // try sorted for slices
        switch _rv${i} := interface{}(_r${i}).(type) {
        case []int:
            sort.Ints(_rv${i})
            _so${i}, _ := json.Marshal(_rv${i})
            _expSlice${i} := []int{}
            json.Unmarshal([]byte(_exp${i}), &_expSlice${i})
            sort.Ints(_expSlice${i})
            _se${i}, _ := json.Marshal(_expSlice${i})
            _ok${i} = string(_so${i}) == string(_se${i})
        }
    }
    if _ok${i} { _passed++ }
    _results = append(_results, map[string]interface{}{"passed": _ok${i}, "output": string(_out${i}), "expected": _exp${i}})
`;
  }

  return `package main
import (
    "encoding/json"
    "fmt"
    "sort"
    "strings"
)
${code}
func main() {
    _passed := 0
    _results := []map[string]interface{}{}
${testBody}
    _out, _ := json.Marshal(map[string]interface{}{"passed": _passed, "total": ${cases.length}, "results": _results})
    fmt.Println(string(_out))
}`;
}

function buildRustHarness(code: string, fi: FuncInfo, cases: TestCase[]): string {
  // Rust without serde: hardcode values as literals and compare with debug format
  let testBody = '';

  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const paramDecls = fi.params.map((p, j) => {
      const rType = pyToRust(p.pyType);
      const lit = toLiteral(tc.inputs[j] ?? '0', p.pyType, 'rust');
      return `    let _p${i}_${j}: ${rType} = ${lit};`;
    }).join('\n');
    const args = fi.params.map((_, j) => `_p${i}_${j}`).join(', ');
    const expStr = tc.expected.trim();
    testBody += `${paramDecls}
    let _r${i} = Solution::${fi.name}(${args});
    let _out${i} = format!("{:?}", _r${i}).replace(" ", "");
    let _exp${i} = "${expStr.replace(/"/g, '\\"')}".replace(" ", "");
    let _ok${i} = _out${i} == _exp${i} || {
        let mut _a = _r${i}.clone(); _a.sort(); let mut _b = _r${i}.clone(); _b.sort();
        format!("{:?}",_a).replace(" ","") == format!("{:?}",_b).replace(" ","")
    };
    if _ok${i} { _passed += 1; }
    _results.push(format!("{{\\\"passed\\\":{},\\\"output\\\":\\\"{}\\\",\\\"expected\\\":\\\"{}\\\"}}", _ok${i}, _out${i}, _exp${i}));
`;
  }

  return `${code}
fn main() {
    let mut _passed = 0i32;
    let mut _results: Vec<String> = Vec::new();
${testBody}
    let _total = ${cases.length};
    let _res_str = _results.join(",");
    println!("{{\\\"passed\\\":{},\\\"total\\\":{},\\\"results\\\":[{}]}}", _passed, _total, _res_str);
}`;
}

function buildCsharpHarness(code: string, fi: FuncInfo, cases: TestCase[]): string {
  let testBody = '';

  for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const paramDecls = fi.params.map((p, j) => {
      const csType = pyToCsharp(p.pyType);
      const lit = toLiteral(tc.inputs[j] ?? '0', p.pyType, 'csharp');
      return `        ${csType} _p${i}_${j}=${lit};`;
    }).join('\n');
    const args = fi.params.map((_, j) => `_p${i}_${j}`).join(',');
    testBody += `${paramDecls}
        var _r${i}=sol.${fi.name.charAt(0).toUpperCase() + fi.name.slice(1)}(${args});
        bool _ok${i}=_Eq(_r${i},${JSON.stringify(tc.expected)});
        if(_ok${i})_passed++;
        _sb.Append(",{\\\"passed\\\":"+_ok${i}.ToString().ToLower()+",\\\"output\\\":\\\""+_Str(_r${i})+"\\\",\\\"expected\\\":${tc.expected.replace(/"/g, '\\"')}}");
`;
  }

  return `using System;
using System.Linq;
using System.Text;
${code}
class Program{
    static bool _Eq(object a,string exp){
        if(a==null)return exp=="null";
        if(a is int[]ai){var e=exp.Trim('[',']').Split(',').Where(s=>s!="").Select(int.Parse).ToArray();return ai.OrderBy(x=>x).SequenceEqual(e.OrderBy(x=>x));}
        if(a is string[]sa){var e=exp.Trim('[',']').Split(',').Where(s=>s!="").ToArray();return sa.SequenceEqual(e);}
        return a.ToString()==exp;
    }
    static string _Str(object a){
        if(a==null)return "null";
        if(a is int[]ai)return "["+string.Join(",",ai)+"]";
        if(a is string[]sa)return "["+string.Join(",",sa)+"]";
        return a.ToString()!;
    }
    static void Main(){
        var sol=new Solution();
        int _passed=0;
        var _sb=new StringBuilder();
${testBody}
        int _total=${cases.length};
        Console.WriteLine("{\\\"passed\\\":"+_passed+",\\\"total\\\":"+_total+",\\\"results\\\":["+(_sb.Length>0?_sb.ToString().Substring(1):"")+"]}" );
    }
}`;
}

// ── Judge0 API ────────────────────────────────────────────────────────────

async function submit(src: string, langId: number): Promise<string> {
  const res = await fetch(`https://${JUDGE0_HOST}/submissions?base64_encoded=true&wait=false`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': JUDGE0_HOST,
      'x-rapidapi-key': JUDGE0_KEY,
    },
    body: JSON.stringify({ source_code: Buffer.from(src).toString('base64'), language_id: langId }),
  });
  const d = await res.json();
  if (!d.token) throw new Error('No token from Judge0: ' + JSON.stringify(d));
  return d.token;
}

async function poll(token: string): Promise<any> {
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const res = await fetch(
      `https://${JUDGE0_HOST}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,status,compile_output`,
      { headers: { 'x-rapidapi-host': JUDGE0_HOST, 'x-rapidapi-key': JUDGE0_KEY } }
    );
    const d = await res.json();
    if (d.status?.id > 2) return d;
  }
  throw new Error('Execution timed out');
}

function decode(b64: string | null): string {
  return b64 ? Buffer.from(b64, 'base64').toString() : '';
}

// ── Handler ───────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, language, problemId, customInputs } = await req.json();
  if (!code || !language || !problemId) {
    return NextResponse.json({ error: 'Missing code, language, or problemId' }, { status: 400 });
  }

  const lang = language.toLowerCase();
  const langId = LANG_IDS[lang];
  if (!langId) {
    return NextResponse.json({ error: `Language "${language}" not supported` }, { status: 400 });
  }

  const problem = getProblemsMap().get(parseInt(problemId));
  if (!problem) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });

  const cases = parseTestCases(problem.description || '');
  if (cases.length === 0) {
    return NextResponse.json({ error: 'No example test cases found in problem description' }, { status: 400 });
  }

  // Append custom test cases (no expected value)
  const exampleCount = cases.length;
  if (Array.isArray(customInputs)) {
    for (const raw of customInputs) {
      if (raw?.trim()) {
        cases.push({ inputs: parseCustomInput(raw.trim()), expected: '', isCustom: true });
      }
    }
  }

  const pyCode = problem.solution_code_python || '';
  const fi = parseFuncInfo(pyCode);
  if (!fi) {
    return NextResponse.json({ error: 'Could not parse function signature for this problem' }, { status: 400 });
  }

  if (usesComplexTypes(fi)) {
    return NextResponse.json({
      error: 'Problems using TreeNode / ListNode structures cannot be auto-tested yet',
    }, { status: 400 });
  }

  let harness: string;
  try {
    if (lang === 'python')                     harness = buildPythonHarness(code, fi.name, cases);
    else if (lang === 'javascript' || lang === 'typescript') harness = buildJsHarness(code, fi.name, cases);
    else if (lang === 'java')                  harness = buildJavaHarness(code, fi, cases);
    else if (lang === 'cpp')                   harness = buildCppHarness(code, fi, cases);
    else if (lang === 'go')                    harness = buildGoHarness(code, fi, cases);
    else if (lang === 'rust')                  harness = buildRustHarness(code, fi, cases);
    else if (lang === 'csharp')                harness = buildCsharpHarness(code, fi, cases);
    else return NextResponse.json({ error: `Language ${language} harness not implemented` }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to build test harness: ' + (e instanceof Error ? e.message : e) }, { status: 500 });
  }

  try {
    const token = await submit(harness, langId);
    const result = await poll(token);

    if (result.status?.id === 6) {
      return NextResponse.json({ success: false, status: 'compile_error', error: decode(result.compile_output) || 'Compilation error' });
    }
    if (result.status?.id >= 5) {
      return NextResponse.json({
        success: false, status: 'runtime_error',
        error: result.status.description || 'Runtime error',
        stderr: decode(result.stderr) || decode(result.stdout),
      });
    }

    const stdout = decode(result.stdout).trim();
    if (!stdout) return NextResponse.json({ success: false, status: 'error', error: 'No output from execution' });

    try {
      const parsed = JSON.parse(stdout);
      const allResults = parsed.results ?? [];
      const exampleResults = allResults.slice(0, exampleCount);
      const customResults = allResults.slice(exampleCount);
      const examplePassed = exampleResults.filter((r: any) => r.passed).length;
      return NextResponse.json({
        success: true,
        passed: examplePassed,
        total: exampleCount,
        results: exampleResults,
        customResults,
        status: examplePassed === exampleCount ? 'accepted' : 'wrong_answer',
        paramNames: fi.params.map(p => p.name),
        testCaseInputs: cases.slice(0, exampleCount).map(c => c.inputs),
        customInputsList: cases.slice(exampleCount).map(c => c.inputs),
      });
    } catch {
      return NextResponse.json({ success: false, status: 'error', error: 'Unexpected output', raw: stdout });
    }
  } catch (err) {
    console.error('execute-code:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Execution failed' }, { status: 500 });
  }
}
