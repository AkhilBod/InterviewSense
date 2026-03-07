"use client";

import Link from "next/link";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
  body {
    background: #0a0a0f;
  }
`;

/* ── helpers ─────────────────────────────────────────────── */
const prose: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "clamp(0.875rem, 2vw, 0.95rem)",
  color: "#cbd5e1",
  lineHeight: 1.8,
  margin: 0,
};

const h2Style: React.CSSProperties = {
  fontFamily: "'Instrument Serif', serif",
  fontWeight: 400,
  fontSize: "clamp(1.25rem, 4vw, 1.55rem)",
  color: "#e2e8f0",
  marginTop: 48,
  marginBottom: 14,
};

const h3Style: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: "clamp(0.95rem, 3vw, 1.05rem)",
  color: "#e2e8f0",
  marginTop: 32,
  marginBottom: 10,
};

const captionStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.75rem",
  color: "#475569",
  textAlign: "center",
  marginTop: 10,
};

const imgWrap: React.CSSProperties = {
  borderRadius: 14,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.06)",
  marginTop: 24,
  marginBottom: 4,
  background: "rgba(255,255,255,0.02)",
  position: "relative",
  width: "100%",
  aspectRatio: "16/9",
};

const bulletItem: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 12,
};

const dot = (color: string): React.CSSProperties => ({
  width: 6,
  height: 6,
  borderRadius: "50%",
  background: color,
  marginTop: 9,
  flexShrink: 0,
});

/* ── Page ────────────────────────────────────────────────── */
export default function BlogPost() {
  return (
    <>
      <style>{pageStyles}</style>
      
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link 
            href="/"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)',
              color: '#e2e8f0',
              textDecoration: 'none',
              fontWeight: 400,
            }}
          >
            InterviewSense
          </Link>
          <Link
            href="/dashboard"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
              color: '#94a3b8',
              textDecoration: 'none',
              padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
              e.currentTarget.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div
        style={{
          minHeight: "100vh",
          padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px) 80px",
          maxWidth: 720,
          margin: "0 auto",
        }}
      >
        {/* Back */}
        <Link
          href="/blog"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.75rem, 2.5vw, 0.8rem)",
            color: "#3b82f6",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 36,
          }}
        >
          ← All posts
        </Link>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "rgba(59,130,246,0.12)",
              color: "#3b82f6",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 6,
            }}
          >
            Product Update
          </span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.75rem",
              color: "#475569",
            }}
          >
            March 6, 2026 · 4 min read
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
            color: "#e2e8f0",
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          InterviewSense vs InterviewSense 2.0 - What Changed
        </h1>
        <p
          style={{
            ...prose,
            color: "#64748b",
            marginBottom: 40,
          }}
        >
          A side-by-side look at the old and new landing page, dashboard, and
          every major feature we shipped with the 2.0 rewrite.
        </p>

        {/* Intro */}
        <p style={{ ...prose, marginBottom: 20 }}>
          When we launched InterviewSense a year ago, the goal was simple:
          give students and job-seekers a way to practice interview questions
          with AI feedback. It worked, but it was rough around the edges - a
          barebones UI, limited question types, and generic tips that felt
          impersonal.
        </p>
        <p style={{ ...prose, marginBottom: 20 }}>
          Today we're shipping <strong style={{ color: "#e2e8f0" }}>InterviewSense 2.0</strong>.
          Complete rewrite from the ground up. What changed and why.
        </p>

        {/* Landing Page */}
        <h2 style={h2Style}>Landing Page - Before &amp; After</h2>
        <p style={{ ...prose, marginBottom: 8 }}>
          The original landing page was functional but uninspired - a single
          hero, a feature list, and a sign-up button. The 2.0 landing page
          communicates value instantly with animated UI previews, real
          testimonials, and a clear product walkthrough that scrolls visitors
          through each feature.
        </p>

        {/* OLD landing */}
        <div style={imgWrap}>
          <img
            src="https://i.ibb.co/SwC3cxf5/image.png"
            alt="InterviewSense 1.0 landing page"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <p style={captionStyle}>InterviewSense 1.0 - The original landing page</p>

        {/* NEW landing */}
        <div style={imgWrap}>
          <img
            src="https://i.ibb.co/ns78jVvP/image.png"
            alt="InterviewSense 2.0 landing page"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <p style={captionStyle}>InterviewSense 2.0 - Redesigned from scratch</p>

        {/* Dashboard */}
        <h2 style={h2Style}>Dashboard - Before &amp; After</h2>
        <p style={{ ...prose, marginBottom: 8 }}>
          The old dashboard was a list of past sessions. In 2.0, we added a
          daily streak tracker, saved question bank, quick-launch shortcuts,
          and stat cards that show your progress when you log in.
        </p>

        {/* OLD dash */}
        <div style={imgWrap}>
          <img
            src="https://i.ibb.co/s907JFkw/image.png"
            alt="InterviewSense 1.0 dashboard"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <p style={captionStyle}>1.0 Dashboard - basic session list</p>

        {/* NEW dash */}
        <div style={imgWrap}>
          <img
            src="https://i.ibb.co/YTKfTyRt/image.png"
            alt="InterviewSense 2.0 dashboard"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <p style={captionStyle}>2.0 Dashboard - streaks, stats, saved questions</p>

        {/* New Features */}
        <h2 style={h2Style}>Everything New in 2.0</h2>
        <p style={{ ...prose, marginBottom: 20 }}>
          2.0 brings a ton of new features. Here are the major additions:
        </p>

        <h3 style={h3Style}>Technical Assessment (LeetCode-style)</h3>
        <p style={{ ...prose, marginBottom: 16 }}>
          A full coding environment with an integrated Monaco editor,
          AI-generated or hand-picked LeetCode problems, voice-to-text
          explanation recording, and detailed scoring across correctness,
          time-complexity, code quality, and communication. You can now
          practice exactly like a real technical screen.
        </p>

        <h3 style={h3Style}>Resume Checker</h3>
        <p style={{ ...prose, marginBottom: 16 }}>
          Upload your resume (PDF, DOCX, or plain text) and get an instant
          score with breakdowns for Impact, Style, and Skills. The word-level
          analysis highlights weak phrases directly on your resume, colour-coded
          by severity, with rewrite suggestions you can copy in one click.
        </p>

        <h3 style={h3Style}>Cover Letter Generator</h3>
        <p style={{ ...prose, marginBottom: 16 }}>
          Paste a job description and your resume, and the AI writes a tailored
          cover letter. Fine-tune tone, length, and emphasis, then export as
          PDF. It matches phrasing to the job posting automatically.
        </p>

        <h3 style={h3Style}>Portfolio Review</h3>
        <p style={{ ...prose, marginBottom: 16 }}>
          Drop a link to your portfolio and receive structured feedback on
          design, content hierarchy, project presentation, and recruiter
          readability. Scores are broken into Visual Design, Content Quality,
          Technical Depth, and User Experience.
        </p>

        <h3 style={h3Style}>System Design Interview</h3>
        <p style={{ ...prose, marginBottom: 16 }}>
          A multi-phase simulation that walks you through requirements
          gathering, high-level architecture, detailed design, and trade-offs - just
          like a real 45-minute system design round. Includes a built-in
          whiteboard canvas for diagramming and voice recording for verbal
          explanations.
        </p>

        <h3 style={h3Style}>Career Roadmap</h3>
        <p style={{ ...prose, marginBottom: 16 }}>
          Answer a few questions about your background and target role, and the
          AI generates a personalised 90-day learning roadmap: skills to learn,
          projects to build, certifications to earn, and weekly milestones to
          hit.
        </p>

        <h3 style={h3Style}>Voice Recording &amp; Transcription</h3>
        <p style={{ ...prose, marginBottom: 16 }}>
          Every interview-style module now supports real-time microphone
          recording with Whisper-powered transcription. You get filler-word
          counts, pace analysis, and sentiment scoring - the same metrics a real
          interviewer notices.
        </p>

        {/* Design Philosophy */}
        <h2 style={h2Style}>Design Philosophy</h2>
        <p style={{ ...prose, marginBottom: 20 }}>
          The visual language of 2.0 is intentionally minimal: dark
          backgrounds, generous whitespace, and a tight three-font stack
          (Instrument Serif for headings, Inter for body, JetBrains Mono for
          data). Colour is used sparingly - blues for primary actions, greens
          for strengths, yellows for caution, reds for critical items. Every
          card, score, and bar chart follows the same palette across every page.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 14,
            marginTop: 20,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Background", hex: "#0a0a0f" },
            { label: "Primary", hex: "#2563eb" },
            { label: "Success", hex: "#22c55e" },
            { label: "Warning", hex: "#eab308" },
            { label: "Critical", hex: "#ef4444" },
          ].map((c) => (
            <div
              key={c.hex}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: c.hex,
                  margin: "0 auto 10px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                }}
              >
                {c.hex}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.72rem",
                  color: "#475569",
                  marginTop: 2,
                }}
              >
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <h2 style={h2Style}>Up Next</h2>
        <p style={{ ...prose, marginBottom: 20 }}>
          We're working on peer mock-interviews, company-specific question
          banks, multi-language code execution, and an analytics dashboard that
          tracks improvement over weeks and months.
        </p>
        <p style={{ ...prose, marginBottom: 28 }}>
          If you've been using InterviewSense, thanks. Your feedback shaped
          this update. If you're new, now is a good time to start.
        </p>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "clamp(10px, 2.5vw, 12px) clamp(18px, 4vw, 24px)",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
              fontWeight: 500,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
              flex: "1 1 auto",
              minWidth: "fit-content",
            }}
          >
            Try It Now →
          </Link>
          <Link
            href="/blog"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "clamp(10px, 2.5vw, 12px) clamp(18px, 4vw, 24px)",
              background: "transparent",
              color: "#94a3b8",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
              fontWeight: 500,
              textDecoration: "none",
              flex: "1 1 auto",
              minWidth: "fit-content",
            }}
          >
            All Posts
          </Link>
        </div>
      </div>
    </>
  );
}
