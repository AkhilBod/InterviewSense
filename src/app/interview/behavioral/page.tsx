'use client';

import { Suspense, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';

// Behavioral question presets — soft-skill categories, 10 questions each

const MAX_QUESTIONS = 10;

const BEHAVIORAL_CATEGORIES: { name: string; questions: string[] }[] = [
  {
    name: 'Leadership',
    questions: [
      'Tell me about a time you led a team through a challenging project.',
      'Describe a situation where you influenced a decision without formal authority.',
      'Give an example of how you motivated a team when morale was low.',
      'Tell me about a time you had to make an unpopular decision as a leader.',
      'Describe a situation where you delegated work effectively and why it mattered.',
      'Tell me about a time you mentored or coached someone to grow in their role.',
      'Describe a moment when you had to hold your team accountable for results.',
      'Give an example of when you led a cross-functional initiative. How did you align people?',
      'Tell me about a time you stepped up to lead when no one else did.',
      'Describe a situation where your leadership directly impacted the outcome of a project.',
    ],
  },
  {
    name: 'Teamwork',
    questions: [
      'Tell me about a time you collaborated closely with a team to hit a tough deadline.',
      'Describe a situation where a team member was underperforming. How did you handle it?',
      "Give an example of a time you put the team's needs ahead of your own.",
      'Tell me about a time you had to onboard or mentor a new team member.',
      'Describe a project where you had to rely heavily on others. How did you build trust?',
      'Tell me about a time you helped resolve a conflict within your team.',
      'Describe a situation where you had to work with someone whose style was very different from yours.',
      'Give an example of a time you celebrated a team win. What did you do?',
      'Tell me about a time when teamwork was essential and how you contributed to it.',
      'Describe a situation where you proactively supported a struggling teammate.',
    ],
  },
  {
    name: 'Communication',
    questions: [
      'Tell me about a time you had to communicate a complex idea to a non-technical audience.',
      'Describe a situation where miscommunication caused a problem. What did you do?',
      'Give an example of how you adapted your communication style for different stakeholders.',
      'Tell me about a time you delivered difficult feedback. How did you approach it?',
      'Describe a situation where you successfully persuaded someone to change their mind.',
      'Tell me about a time you had to present to senior leadership. How did you prepare?',
      'Describe a moment when active listening helped you resolve a situation.',
      'Give an example of a time you wrote something that had a significant positive impact.',
      'Tell me about a time you had to communicate during a crisis or under pressure.',
      'Describe a situation where clear communication prevented a major mistake.',
    ],
  },
  {
    name: 'Problem Solving',
    questions: [
      'Tell me about a time you solved a problem that no one else could figure out.',
      'Describe a situation where you had to solve a problem with very limited resources.',
      'Give an example of when you broke a large, complex problem into manageable pieces.',
      'Tell me about a time you used data to make a critical decision.',
      'Describe a situation where your first solution failed and what you did next.',
      'Tell me about a time you had to think outside the box to solve a business problem.',
      'Describe a moment when you identified the root cause of a recurring issue.',
      'Give an example of a time you had to solve a problem under significant time pressure.',
      'Tell me about a time you had to balance multiple competing solutions. How did you choose?',
      'Describe a situation where you prevented a problem before it escalated.',
    ],
  },
  {
    name: 'Adaptability',
    questions: [
      'Tell me about a time you had to quickly adapt to a major change at work.',
      'Describe a situation where you had to learn a new skill rapidly to complete a project.',
      'Give an example of when project requirements changed mid-way. How did you adjust?',
      'Tell me about a time you had to work outside your comfort zone.',
      'Describe a moment when your ability to adapt directly saved a project.',
      'Tell me about a time you embraced a new process or technology others resisted.',
      'Describe a situation where you had to pivot strategy based on new information.',
      'Give an example of how you handled working in an ambiguous, fast-changing environment.',
      'Tell me about a time you thrived in an unstructured or startup-like environment.',
      'Describe a situation where you helped your team adapt to a significant organizational change.',
    ],
  },
  {
    name: 'Initiative',
    questions: [
      'Tell me about a time you identified a process improvement and implemented it.',
      'Describe a situation where you saw an opportunity others missed and acted on it.',
      'Give an example of a time you volunteered for a challenging or high-visibility assignment.',
      'Tell me about something you built or started without being asked.',
      "Describe a time you took ownership of a problem that wasn't technically yours to solve.",
      'Tell me about a time you went beyond your job description to create value.',
      'Describe a situation where your proactive action prevented a serious issue.',
      'Give an example of a new idea you proposed that was adopted by your team or company.',
      'Tell me about a time you took initiative to improve team culture or morale.',
      'Describe a moment when you pushed forward on a project when others hesitated.',
    ],
  },
  {
    name: 'Conflict Resolution',
    questions: [
      'Tell me about a time you had a significant disagreement with a colleague. How was it resolved?',
      'Describe a situation where you had to navigate conflict between two team members.',
      'Give an example of a time you had to work with a difficult manager or stakeholder.',
      'Tell me about a time you had to compromise to move a project forward.',
      'Describe a situation where you turned a tense disagreement into a productive outcome.',
      'Tell me about a time you pushed back on a decision you thought was wrong.',
      'Describe a moment where managing conflict helped preserve an important relationship.',
      'Give an example of when you had to de-escalate a situation under high stakes.',
      'Tell me about a time you handled a disagreement with a client or external partner.',
      'Describe a situation where a conflict ultimately led to a better outcome for the team.',
    ],
  },
  {
    name: 'Failure & Learning',
    questions: [
      'Tell me about a time you failed at something important. What did you learn?',
      "Describe a project that didn't go as planned. What would you do differently?",
      'Give an example of a mistake that had significant consequences and how you handled it.',
      'Tell me about a time you received critical feedback that was hard to hear.',
      'Describe a moment where failure ultimately led to a better approach.',
      'Tell me about a time you had to admit you were wrong in front of others.',
      'Describe a situation where you helped your team learn from a collective failure.',
      'Give an example of how a past failure shaped the way you work today.',
      'Tell me about a time you underestimated the difficulty of a task. What happened?',
      'Describe a situation where you had to rebuild trust after a mistake.',
    ],
  },
  {
    name: 'Achievement',
    questions: [
      'Tell me about your greatest professional achievement and what made it significant.',
      'Describe a time you set an ambitious goal and successfully achieved it.',
      'Give an example of a project you are most proud of and why.',
      'Tell me about a time you exceeded expectations on an important deliverable.',
      'Describe a situation where you delivered results despite significant obstacles.',
      'Tell me about a time you were recognized for exceptional work. What did you do?',
      'Describe an achievement where the outcome had a measurable impact on the business.',
      'Give an example of a time you improved a key metric or outcome significantly.',
      'Tell me about the most technically challenging thing you have ever accomplished.',
      'Describe a situation where you achieved something others said was not possible.',
    ],
  },
  {
    name: 'Pressure & Stress',
    questions: [
      'Tell me about a time you had to meet multiple competing deadlines simultaneously.',
      'Describe the most stressful work situation you have faced and how you managed it.',
      'Give an example of a time you stayed calm and effective under extreme pressure.',
      'Tell me about a time a project was in crisis. How did you respond?',
      'Describe a situation where you had to deliver high-quality work on a very tight timeline.',
      'Tell me about a time when the stakes were very high and what you did to perform well.',
      'Describe a moment where stress could have derailed you but did not. What helped?',
      'Give an example of a time you helped your team stay focused during a high-pressure period.',
      'Tell me about a time you had to prioritize ruthlessly when everything felt urgent.',
      'Describe a situation where you managed your own well-being while still delivering results.',
    ],
  },
];

function BehavioralInterviewPage() {
  const { status } = useSession();
  const router = useRouter();

  // Presets state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Custom state
  const [customText, setCustomText] = useState('');

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
        <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const toggleQuestion = (q: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(q)) return prev.filter(x => x !== q);
      if (prev.length + textLineCount >= MAX_QUESTIONS) return prev;
      return [...prev, q];
    });
  };

  const selectAllInCategory = (questions: string[]) => {
    const allSelected = questions.every(q => selectedQuestions.includes(q));
    if (allSelected) {
      setSelectedQuestions(prev => prev.filter(q => !questions.includes(q)));
    } else {
      const slotsLeft = MAX_QUESTIONS - textLineCount - selectedQuestions.length;
      const toAdd = questions.filter(q => !selectedQuestions.includes(q)).slice(0, Math.max(0, slotsLeft));
      setSelectedQuestions(prev => [...new Set([...prev, ...toAdd])]);
    }
  };

  const textLineCount = customText
    .split('\n')
    .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
    .filter(l => l.length > 5).length;

  const customTotalCount = selectedQuestions.length + textLineCount;

  const canStart = customTotalCount > 0;

  const handleStart = () => {
    const textLines = customText
      .split('\n')
      .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(l => l.length > 5)
      .slice(0, Math.max(0, MAX_QUESTIONS - selectedQuestions.length));

    const questions = [...selectedQuestions, ...textLines];
    if (questions.length === 0) return;

    localStorage.setItem('behavioralCustomSession', JSON.stringify(questions));
    localStorage.setItem('interviewType', 'Behavioral');
    router.push('/interview');
  };

  const activeCategoryData = selectedCategory
    ? BEHAVIORAL_CATEGORIES.find(c => c.name === selectedCategory)
    : null;

  const atMax = customTotalCount >= MAX_QUESTIONS;

  const labelStyle: React.CSSProperties = {
    display: 'block', fontFamily: "'Inter', sans-serif",
    fontSize: '0.68rem', fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#8892b0', marginBottom: 7,
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <main style={{ flex: 1, overflowY: 'auto', background: '#0a0e1a', minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80vw', height: 340, background: 'radial-gradient(ellipse at bottom center, rgba(37,99,235,0.13) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', padding: '64px 24px 80px' }}>

            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#dde2f0', margin: 0, lineHeight: 1.15 }}>
              Behavioral Interview
            </h1>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.88rem', color: '#5a6380', marginTop: 8, marginBottom: 36 }}>
              Choose questions from preset categories or write your own.
            </p>

            {/* Section A: Quick Presets */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ ...labelStyle, marginBottom: 0 }}>Quick Presets</p>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: customTotalCount >= MAX_QUESTIONS ? '#f87171' : '#4a5370' }}>
                  {customTotalCount}/{MAX_QUESTIONS} max
                </span>
              </div>

              {/* Category grid — 2 columns, even */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: selectedCategory ? 16 : 0 }}>
                {BEHAVIORAL_CATEGORIES.map(cat => {
                  const catSelected = selectedCategory === cat.name;
                  const catCount = cat.questions.filter(q => selectedQuestions.includes(q)).length;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(catSelected ? null : cat.name)}
                      style={{
                        padding: '9px 14px',
                        borderRadius: 8,
                        border: `1px solid ${catSelected ? 'rgba(59,130,246,0.55)' : 'rgba(255,255,255,0.08)'}`,
                        background: catSelected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: catSelected ? '#93c5fd' : '#8892b0',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => {
                        if (!catSelected) {
                          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)';
                          e.currentTarget.style.color = '#dde2f0';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!catSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.color = '#8892b0';
                        }
                      }}
                    >
                      <span>{cat.name}</span>
                      {catCount > 0 && (
                        <span style={{
                          background: '#2563eb', color: '#fff',
                          borderRadius: 10, fontSize: '0.6rem', fontWeight: 700,
                          padding: '1px 6px', lineHeight: 1.6, flexShrink: 0,
                        }}>
                          {catCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Expanded category questions */}
              {selectedCategory && activeCategoryData && (
                <div style={{
                  marginTop: 4,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: '14px 14px 10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 600, color: '#dde2f0' }}>
                      {selectedCategory}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {(() => {
                        const allSelected = activeCategoryData.questions.every(q => selectedQuestions.includes(q));
                        return (
                          <button
                            type="button"
                            onClick={() => selectAllInCategory(activeCategoryData.questions)}
                            style={{
                              background: 'none', border: 'none',
                              fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
                              color: allSelected ? '#f87171' : '#3b82f6',
                              cursor: 'pointer', padding: 0,
                            }}
                          >
                            {allSelected ? 'Deselect all' : 'Select all'}
                          </button>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        style={{ background: 'none', border: 'none', color: '#4a5370', cursor: 'pointer', padding: 0, fontSize: '0.72rem', fontFamily: "'Inter', sans-serif" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {activeCategoryData.questions.map(q => {
                      const sel = selectedQuestions.includes(q);
                      const disabled = atMax && !sel;
                      return (
                        <button
                          key={q}
                          type="button"
                          onClick={() => toggleQuestion(q)}
                          style={{
                            display: 'block', width: '100%',
                            padding: '10px 14px', borderRadius: 8, textAlign: 'left',
                            borderLeft: `3px solid ${sel ? '#3b82f6' : 'transparent'}`,
                            border: `1px solid ${sel ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                            borderLeftColor: sel ? '#3b82f6' : 'transparent',
                            background: sel ? 'rgba(59,130,246,0.08)' : 'transparent',
                            cursor: disabled ? 'default' : 'pointer',
                            opacity: disabled ? 0.35 : 1,
                            transition: 'all 0.12s',
                          }}
                        >
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: sel ? '#93c5fd' : '#8892b0', lineHeight: 1.5 }}>
                            {q}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: '#3a4258', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                or type your own
              </span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Section B: Free-form textarea */}
            <div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#4a5370', marginBottom: 10, marginTop: 0 }}>
                Enter one question per line, or use a numbered list. Each line becomes a separate question.
              </p>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder={`e.g.\nTell me about yourself.\nDescribe a time you resolved a conflict at work.\nWhat is your greatest weakness?`}
                rows={6}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: '14px 16px',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.88rem',
                  color: '#dde2f0', outline: 'none', resize: 'vertical', lineHeight: 1.7,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {customText.trim().length > 5 && (
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: '#34d399', marginTop: 6 }}>
                  {textLineCount} question{textLineCount !== 1 ? 's' : ''} from text
                </p>
              )}
            </div>

            {/* Selected presets summary */}
            {selectedQuestions.length > 0 && (
              <div style={{
                marginTop: 16, padding: '10px 14px', borderRadius: 8,
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: '#34d399' }}>
                  {selectedQuestions.length} preset question{selectedQuestions.length > 1 ? 's' : ''} selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQuestions([])}
                  style={{ background: 'none', border: 'none', color: '#4a5370', cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', padding: 0 }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={handleStart}
              disabled={!canStart}
              style={{
                width: '100%', marginTop: 36, padding: 14,
                background: '#2563eb', color: '#fff', border: 'none',
                borderRadius: 10, fontFamily: "'Inter', sans-serif",
                fontSize: '0.88rem', fontWeight: 500,
                cursor: canStart ? 'pointer' : 'not-allowed',
                boxShadow: canStart ? '0 4px 20px rgba(37,99,235,0.3)' : 'none',
                opacity: canStart ? 1 : 0.4, transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { if (canStart) { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.opacity = canStart ? '1' : '0.4'; e.currentTarget.style.transform = 'none'; }}
            >
              {customTotalCount > 0
                ? `Start with ${customTotalCount} Question${customTotalCount > 1 ? 's' : ''}`
                : 'Add Questions to Start'}
            </button>

          </div>
        </main>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function BehavioralInterviewPageWithSuspense() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e1a' }}>
        <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <BehavioralInterviewPage />
    </Suspense>
  );
}
