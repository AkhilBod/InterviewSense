"use client";

import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';
import { WordAnalysisData } from '@/types/resume';

interface ResumeWordAnalysisProps {
  analysis: WordAnalysisData;
  fileName: string;
  jobTitle: string;
  company?: string;
}

export default function ResumeWordAnalysis({ analysis, fileName, jobTitle, company }: ResumeWordAnalysisProps) {
  const [copiedItems, setCopiedItems] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(index));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const filteredImprovements = filter === 'all'
    ? analysis.wordImprovements
    : analysis.wordImprovements.filter(i => i.severity === filter);

  const categoryLabels: Record<string, string> = {
    quantify_impact: 'Add Metrics',
    communication: 'Clarify Language',
    length_depth: 'Adjust Length',
    drive: 'Show Initiative',
    analytical: 'Add Analysis',
    general: 'General',
  };

  const severityConfigs = {
    red:    { border: '#ef4444', accent: '#ef4444', dim: 'rgba(239,68,68,0.08)',  Icon: AlertCircle,   label: 'Critical'  },
    yellow: { border: '#eab308', accent: '#eab308', dim: 'rgba(234,179,8,0.08)',  Icon: AlertTriangle, label: 'Important' },
    green:  { border: '#22c55e', accent: '#22c55e', dim: 'rgba(34,197,94,0.08)', Icon: Lightbulb,     label: 'Minor'     },
  };

  const tabs = [
    { key: 'all',    label: 'All',       count: analysis.wordImprovements.length },
    { key: 'red',    label: 'Critical',  count: analysis.severityBreakdown?.red    || 0 },
    { key: 'yellow', label: 'Important', count: analysis.severityBreakdown?.yellow || 0 },
    { key: 'green',  label: 'Minor',     count: analysis.severityBreakdown?.green  || 0 },
  ];

  return (
    <div style={{ background: 'transparent', minHeight: '100%', padding: '24px', fontFamily: 'Inter, -apple-system, sans-serif', color: '#e5e7eb' }}>
      <style>{`
        .word-analysis-comparison {
          display: grid;
          grid-template-columns: 1fr 28px 1fr;
          gap: 10px;
          align-items: start;
          margin-bottom: 12px;
        }
        .word-analysis-arrow { display: flex; justify-content: center; padding-top: 24px; }
        @media (max-width: 600px) {
          .word-analysis-comparison {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .word-analysis-arrow { display: none; }
        }
      `}</style>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff', margin: 0, marginBottom: '4px' }}>
            Word-Level Analysis
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Line-by-line suggestions to strengthen your resume
          </p>
        </div>

        {/* Severity breakdown row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { count: analysis.severityBreakdown?.red    || 0, color: '#ef4444', label: 'Critical'  },
            { count: analysis.severityBreakdown?.yellow || 0, color: '#eab308', label: 'Important' },
            { count: analysis.severityBreakdown?.green  || 0, color: '#22c55e', label: 'Minor'     },
          ].map((s) => (
            <div key={s.label} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '10px', padding: '16px', textAlign: 'center' as const }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: s.color, fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category tags */}
        {analysis.categoryBreakdown && (
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '12px' }}>By Category</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
              {Object.entries(analysis.categoryBreakdown)
                .filter(([, v]) => (v as number) > 0)
                .map(([cat, count]) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#0a0f1e', border: '1px solid #1f2937', borderRadius: '5px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>{count as number}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{categoryLabels[cat] || cat}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '1px solid #1f2937', overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: filter === tab.key ? '2px solid #3b82f6' : '2px solid transparent',
                color: filter === tab.key ? '#3b82f6' : '#6b7280',
                fontSize: '13px',
                fontWeight: filter === tab.key ? 600 : 400,
                cursor: 'pointer',
                marginBottom: '-1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tab.label}
              <span style={{
                fontSize: '11px',
                background: filter === tab.key ? '#1d4ed8' : '#1f2937',
                color: filter === tab.key ? '#93c5fd' : '#6b7280',
                padding: '1px 6px',
                borderRadius: '4px',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Issues list */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
          {filteredImprovements.map((item, index) => {
            const cfg = severityConfigs[item.severity as keyof typeof severityConfigs] || severityConfigs.green;
            const { Icon } = cfg;
            return (
              <div
                key={index}
                style={{
                  background: '#111827',
                  border: '1px solid #1f2937',
                  borderLeft: '3px solid ' + cfg.border,
                  borderRadius: '8px',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid #1f2937' }}>
                  <Icon size={13} color={cfg.accent} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.accent, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{cfg.label}</span>
                  <span style={{ fontSize: '11px', color: '#4b5563' }}>{categoryLabels[item.category] || item.category}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#374151' }}>#{index + 1}</span>
                </div>
                {/* Body */}
                <div style={{ padding: '14px' }}>
                  <div className="word-analysis-comparison">
                    {/* Original */}
                    <div style={{ background: '#0a0f1e', borderRadius: '6px', padding: '10px 12px', border: '1px solid #1f2937' }}>
                      <div style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '5px' }}>Original</div>
                      <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.5, margin: 0, textDecoration: 'line-through', textDecorationColor: cfg.accent }}>{item.original}</p>
                    </div>
                    {/* Arrow */}
                    <div className="word-analysis-arrow">
                      <ArrowRight size={14} color="#374151" />
                    </div>
                    {/* Improved */}
                    <div style={{ background: cfg.dim, borderRadius: '6px', padding: '10px 12px', border: '1px solid ' + cfg.border + '40' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{ fontSize: '10px', color: cfg.accent, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>Suggested Fix</div>
                        <button
                          onClick={() => copyToClipboard(item.improved, index)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6b7280', padding: '2px 4px', borderRadius: '4px' }}
                        >
                          {copiedItems.has(index)
                            ? <><Check size={11} color="#22c55e" /><span style={{ color: '#22c55e' }}>Copied</span></>
                            : <><Copy size={11} />Copy</>}
                        </button>
                      </div>
                      <p style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: 1.5, margin: 0 }}>{item.improved}</p>
                    </div>
                  </div>
                  {/* Explanation */}
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.6, borderTop: '1px solid #1f2937', paddingTop: '10px' }}>
                    {item.explanation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredImprovements.length === 0 && (
          <div style={{ textAlign: 'center' as const, padding: '48px 24px', background: '#111827', borderRadius: '8px', border: '1px solid #1f2937' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>No {filter !== 'all' ? filter : ''} issues found.</p>
          </div>
        )}

        {/* Footer note */}
        <div style={{ marginTop: '28px', padding: '14px 18px', background: '#111827', borderRadius: '8px', border: '1px solid #1f2937', borderLeft: '3px solid #3b82f6' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.6, margin: 0 }}>
            Fix <span style={{ color: '#ef4444', fontWeight: 600 }}>critical</span> issues first, then <span style={{ color: '#eab308', fontWeight: 600 }}>important</span> ones. Click copy on any suggestion to paste directly into your resume.
          </p>
        </div>

      </div>
    </div>
  );
}
