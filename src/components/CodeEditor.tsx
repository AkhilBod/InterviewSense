'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Play, Check, X, Code, FileText, Lightbulb, Clock } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from '@/components/ui/use-toast';

interface TestCase {
  input: string;
  expected: string;
  hidden?: boolean;
}

interface CodeEditorProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ question, value, onChange, className = '' }) => {
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string; expected: string; input: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const editorRef = useRef<any>(null);

  // Mock test cases for demo purposes
  const mockTestCases: TestCase[] = [
    { input: '[2,7,11,15], target = 9', expected: '[0,1]' },
    { input: '[3,2,4], target = 6', expected: '[1,2]' },
    { input: '[3,3], target = 6', expected: '[0,1]', hidden: true },
  ];

  // Language configurations
  const languageConfigs = {
    javascript: {
      label: 'JavaScript',
      defaultCode: `function twoSum(nums, target) {
    // Write your solution here
    
}`,
      extension: 'js'
    },
    python: {
      label: 'Python',
      defaultCode: `def two_sum(nums, target):
    # Write your solution here
    pass`,
      extension: 'py'
    },
    java: {
      label: 'Java',
      defaultCode: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
      extension: 'java'
    },
    cpp: {
      label: 'C++',
      defaultCode: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`,
      extension: 'cpp'
    }
  };

  // Initialize with default code when language changes
  useEffect(() => {
    if (!value || value.trim() === '') {
      onChange(languageConfigs[language as keyof typeof languageConfigs].defaultCode);
    }
  }, [language]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    setIsRunning(true);
    setShowResults(false);

    // Simulate code execution with delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock test results
    const results = mockTestCases.slice(0, 2).map((testCase, index) => ({
      passed: Math.random() > 0.3, // 70% pass rate for demo
      output: testCase.expected,
      expected: testCase.expected,
      input: testCase.input
    }));

    setTestResults(results);
    setExecutionTime(Math.floor(Math.random() * 100) + 50);
    setShowResults(true);
    setIsRunning(false);

    const passedCount = results.filter(r => r.passed).length;
    toast({
      title: passedCount === results.length ? "All tests passed!" : "Some tests failed",
      description: `${passedCount}/${results.length} test cases passed`,
      variant: passedCount === results.length ? "default" : "destructive"
    });
  };

  const submitCode = () => {
    toast({
      title: "Code submitted!",
      description: "Your solution has been saved for review.",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 h-full ${className}`}>
      {/* Problem Description */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Problem Statement
            </CardTitle>
            <Badge className={getDifficultyColor('medium')}>
              Medium
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {question || "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order."}
              </div>
            </div>

            {/* Examples */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-400" />
                Examples
              </h4>
              {mockTestCases.slice(0, 2).map((testCase, index) => (
                <div key={index} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                  <div className="text-xs font-mono">
                    <div className="text-slate-400">Input:</div>
                    <div className="text-slate-200 mb-2">{testCase.input}</div>
                    <div className="text-slate-400">Output:</div>
                    <div className="text-slate-200">{testCase.expected}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-200">Constraints</h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• 2 ≤ nums.length ≤ 10⁴</li>
                <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                <li>• -10⁹ ≤ target ≤ 10⁹</li>
                <li>• Only one valid answer exists.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5 text-green-400" />
              Code Editor
            </CardTitle>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {Object.entries(languageConfigs).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-slate-200">
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Monaco Editor */}
          <div className="flex-1 border border-slate-700 rounded-md overflow-hidden">
            <Editor
              height="300px"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={value}
              onChange={(val) => onChange(val || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  onClick={runCode} 
                  disabled={isRunning || !value.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
                <Button 
                  onClick={submitCode}
                  disabled={!value.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Submit
                </Button>
              </div>
              {executionTime && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {executionTime}ms
                </div>
              )}
            </div>
          </div>

          {/* Test Results */}
          {showResults && (
            <div className="p-4 border-t border-slate-700 bg-slate-900/50">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">Test Results</h4>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-2 rounded text-xs border ${
                      result.passed 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      <span>Test Case {index + 1}</span>
                    </div>
                    <span>{result.passed ? 'Passed' : 'Failed'}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">
                    {testResults.filter(r => r.passed).length}/{testResults.length} test cases passed
                  </span>
                  <Progress 
                    value={(testResults.filter(r => r.passed).length / testResults.length) * 100} 
                    className="w-24 h-2"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeEditor;
