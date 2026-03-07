"use client";

import Link from "next/link";

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
  body {
    background: #0a0a0f;
  }
`;

const POSTS = [
  {
    slug: "interviewsense-vs-2",
    title: "InterviewSense vs InterviewSense 2.0 — What Changed",
    excerpt:
      "A side-by-side look at the old and new landing page, dashboard, and all the new features that shipped with the 2.0 rewrite.",
    date: "March 6, 2026",
    readTime: "4 min read",
    tag: "Product Update",
  },
];

export default function BlogIndexPage() {
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
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px)",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontSize: "clamp(2rem, 6vw, 2.8rem)",
            color: "#e2e8f0",
            marginBottom: 8,
          }}
        >
          Blog
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.8rem, 2.5vw, 0.9rem)",
            color: "#64748b",
            marginBottom: 48,
          }}
        >
          Product updates, tips &amp; deep dives.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "clamp(20px, 4vw, 28px)",
                  transition: "border-color 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(59,130,246,0.25)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(255,255,255,0.06)")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 14,
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
                    {post.tag}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.75rem",
                      color: "#475569",
                    }}
                  >
                    {post.date} · {post.readTime}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: "clamp(1.15rem, 4vw, 1.4rem)",
                    fontWeight: 400,
                    color: "#e2e8f0",
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}
                >
                  {post.title}
                </h2>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(0.8rem, 2.5vw, 0.88rem)",
                    color: "#94a3b8",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {post.excerpt}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
