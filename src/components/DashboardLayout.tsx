"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings form state
  const [settingsTab, setSettingsTab] = useState<'profile' | 'account'>('profile');
  const [settingsRole, setSettingsRole] = useState('');
  const [settingsCompany, setSettingsCompany] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [resumeFilename, setResumeFilename] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  // Load current profile values when settings opens
  useEffect(() => {
    if (showSettings) {
      fetch('/api/onboarding/status')
        .then(r => r.json())
        .then(data => {
          setSettingsRole(data.targetRole || '');
          setSettingsCompany(data.targetCompany || '');
          setResumeFilename(data.resumeFilename || '');
          setResumeUrl(data.resumeUrl || '');
        })
        .catch(() => {});
      setSettingsTab('profile');
      setProfileSaved(false);
      setResumeUploaded(false);
    }
  }, [showSettings]);

  const navItems = [
    { href: '/start?type=behavioral', label: 'Behavioral', icon: 'behavioral', matchPath: '/start' },
    { href: '/dashboard/technical', label: 'Technical', icon: 'technical', matchPath: '/dashboard/technical' },
    { href: '/resume-checker', label: 'Resume', icon: 'resume', matchPath: '/resume-checker' },
    { href: '/cover-letter', label: 'Cover Letter', icon: 'cover', matchPath: '/cover-letter' },
    { href: '/portfolio-review', label: 'Portfolio', icon: 'portfolio', matchPath: '/portfolio-review' },
    { href: '/system-design', label: 'System Design', icon: 'system', matchPath: '/system-design' },
    { href: '/career-roadmap', label: 'Roadmap', icon: 'roadmap', matchPath: '/career-roadmap' },
  ];

  const isActive = (matchPath: string) => {
    if (matchPath === '/start') {
      return pathname?.startsWith('/start') || pathname?.startsWith('/interview');
    }
    return pathname?.startsWith(matchPath);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', { method: 'DELETE' });
      if (response.ok) {
        await signOut({ callbackUrl: '/' });
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch {
      alert('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Failed to access billing portal. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      // Upload resume first if one is staged
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        const response = await fetch('/api/onboarding/upload-resume', { method: 'POST', body: formData });
        const data = await response.json();
        if (response.ok) {
          setResumeFilename(data.filename || resumeFile.name);
          setResumeUrl(data.url || '');
          setResumeFile(null);
          setResumeUploaded(true);
          setTimeout(() => setResumeUploaded(false), 2500);
        } else {
          alert(data.error || 'Failed to upload resume. Please try again.');
          setSavingProfile(false);
          return;
        }
      }
      // Save role + company
      await fetch('/api/onboarding/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: settingsRole, targetCompany: settingsCompany }),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const settingsInputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '12px 14px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.88rem',
    color: '#dde2f0',
    outline: 'none',
  };

  const settingsLabelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#8892b0',
    marginBottom: 7,
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1e] text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');`}</style>
      {/* Settings — full-area overlay matching behavioral style */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: '#0a0e1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '52px 24px',
        }}>
          {/* Ambient glow identical to behavioral */}
          <div style={{
            position: 'fixed',
            bottom: -160, left: '50%',
            transform: 'translateX(-50%)',
            width: 900, height: 380,
            background: 'radial-gradient(ellipse at center, rgba(37,99,235,0.45) 0%, rgba(99,102,241,0.22) 40%, transparent 75%)',
            pointerEvents: 'none',
            filter: 'blur(8px)',
          }} />

          <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontWeight: 400,
                fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                color: '#dde2f0',
                margin: 0,
              }}>
                Settings
              </h1>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none', border: 'none',
                  color: '#ffffff', cursor: 'pointer',
                  fontSize: '1.1rem', lineHeight: 1,
                  padding: '4px 2px', marginTop: 6,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                ✕
              </button>
            </div>

            {/* Tab row */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 36, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {(['profile', 'account'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '8px 18px 10px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: settingsTab === tab ? '#dde2f0' : '#4a5370',
                    borderBottom: settingsTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                    marginBottom: -1,
                    transition: 'color 0.15s',
                    textTransform: 'capitalize',
                    letterSpacing: 0,
                  }}
                >
                  {tab === 'profile' ? 'Profile' : 'Account'}
                </button>
              ))}
            </div>

            {/* ── Profile tab ── */}
            {settingsTab === 'profile' && (
              <div>
                {/* Resume */}
                <div style={{ marginBottom: 20 }}>
                  <label style={settingsLabelStyle}>Resume</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById('settings-resume-input')?.click()}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: resumeFile ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.04)',
                        border: resumeFile ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, padding: '12px 14px',
                        fontFamily: "'Inter', sans-serif", fontSize: '0.88rem',
                        color: resumeFile ? '#93c5fd' : '#5a6380',
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                      </svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {resumeFile ? resumeFile.name : (resumeFilename ? `Current: ${resumeFilename}` : 'Upload resume (PDF)')}
                      </span>
                    </button>
                    <input id="settings-resume-input" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) setResumeFile(f); }} />
                  </div>
                  {resumeUploaded && (
                    <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#34d399', fontFamily: "'Inter', sans-serif" }}>✓ Resume updated</p>
                  )}
                  {resumeUrl && !resumeFile && !resumeUploaded && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: 8, fontSize: '0.75rem', color: '#4a5370', fontFamily: "'Inter', sans-serif", textDecoration: 'none' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#93c5fd'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#4a5370'; }}
                    >
                      View current resume ↗
                    </a>
                  )}
                </div>

                {/* Target Role */}
                <div style={{ marginBottom: 20 }}>
                  <label style={settingsLabelStyle}>Target Role</label>
                  <input
                    type="text"
                    value={settingsRole}
                    onChange={e => setSettingsRole(e.target.value)}
                    placeholder="e.g., Software Engineer, Frontend Developer"
                    style={settingsInputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Target Company */}
                <div style={{ marginBottom: 32 }}>
                  <label style={settingsLabelStyle}>Target Company</label>
                  <input
                    type="text"
                    value={settingsCompany}
                    onChange={e => setSettingsCompany(e.target.value)}
                    placeholder="e.g., Google, Meta, Apple"
                    style={settingsInputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  style={{
                    width: '100%', padding: 14,
                    background: '#2563eb',
                    color: '#fff', border: 'none', borderRadius: 10,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.88rem', fontWeight: 500,
                    cursor: savingProfile ? 'not-allowed' : 'pointer',
                    opacity: savingProfile ? 0.7 : 1,
                    boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {profileSaved ? '✓ Saved' : (savingProfile ? 'Saving…' : 'Save Changes')}
                </button>
              </div>
            )}

            {/* ── Account tab ── */}
            {settingsTab === 'account' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {/* Cancel subscription */}
                <button
                  onClick={handleCancelSubscription}
                  style={{
                    width: '100%', padding: '16px 0',
                    background: 'none', border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    fontFamily: "'Inter', sans-serif",
                    cursor: 'pointer', textAlign: 'left',
                  }}
                  onMouseEnter={e => { (e.currentTarget.querySelector('.acct-title') as HTMLElement).style.color = '#dde2f0'; }}
                  onMouseLeave={e => { (e.currentTarget.querySelector('.acct-title') as HTMLElement).style.color = '#c4cce0'; }}
                >
                  <span className="acct-title" style={{ fontSize: '0.88rem', fontWeight: 500, color: '#c4cce0', marginBottom: 3, transition: 'color 0.15s' }}>
                    Cancel Subscription
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#4a5370', fontFamily: "'Inter', sans-serif" }}>
                    Manage your billing via Stripe portal
                  </span>
                </button>

                {/* Delete account */}
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  style={{
                    width: '100%', padding: '16px 0',
                    background: 'none', border: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    fontFamily: "'Inter', sans-serif",
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.5 : 1,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#f87171', marginBottom: 3 }}>
                    {isDeleting ? 'Deleting…' : 'Delete Account'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#4a5370', fontFamily: "'Inter', sans-serif" }}>
                    Permanently remove your account and data
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed Left Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-[#0f1117] border-r border-[#1f2937] flex flex-col z-50">
        {/* Logo */}
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={32} height={32} className="object-contain" />
            <span className="font-bold text-base text-white">InterviewSense</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const active = isActive(item.matchPath);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 mb-1 rounded-lg transition-all duration-150 ${
                  active
                    ? 'bg-[#1a1f2e] text-white border-l-[3px] border-[#3b82f6] -ml-[3px] pl-[17px]'
                    : 'text-[#6b7280] hover:text-[#d1d5db]'
                }`}
              >
                {item.icon === 'behavioral' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="12" r="6" fill="currentColor" opacity=".7"/><path d="M8 34c0-6.627 5.373-10 12-10s12 3.373 12 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".7"/></svg>
                )}
                {item.icon === 'technical' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><rect x="4" y="7" width="32" height="26" rx="5" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/><path d="M16 23l-4 3 4 3M24 23l4 3-4 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/></svg>
                )}
                {item.icon === 'resume' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><rect x="8" y="3" width="24" height="34" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/><path d="M25 30l2.2 2.2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/></svg>
                )}
                {item.icon === 'cover' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><rect x="4" y="8" width="32" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/><path d="M4 12l16 11 16-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/></svg>
                )}
                {item.icon === 'portfolio' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><rect x="4" y="12" width="32" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/><path d="M14 12v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".7"/></svg>
                )}
                {item.icon === 'system' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><rect x="3" y="15" width="10" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/><rect x="27" y="5" width="10" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/><line x1="13" y1="20" x2="27" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".7"/></svg>
                )}
                {item.icon === 'roadmap' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><path d="M8 34 C10 26 14 22 20 20 C26 18 30 14 32 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".7"/><circle cx="20" cy="20" r="2" fill="currentColor" opacity=".7"/></svg>
                )}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile */}
        <div className="border-t border-[#1f2937] p-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full">
              <div className="flex items-center gap-3 px-2 hover:bg-[#1a1f2e] rounded-lg transition-colors duration-150 py-2 cursor-pointer">
                {session?.user?.image ? (
                  <Image src={session.user.image} alt="Profile" width={32} height={32} className="rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-sm font-semibold">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#6b7280]">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 bg-[#0f1117] border border-[#1f2937] text-white rounded-xl shadow-xl" align="end" side="top" sideOffset={8}>
              {/* User info header */}
              <div className="px-3 py-2.5 border-b border-[#1f2937]">
                <div className="text-xs font-medium text-white truncate">{session?.user?.name || 'User'}</div>
                <div className="text-xs text-[#4b5563] truncate mt-0.5">{session?.user?.email || ''}</div>
              </div>

              <div className="py-1">
                {/* Settings */}
                <DropdownMenuItem
                  onClick={() => setShowSettings(true)}
                  className="cursor-pointer hover:bg-[#1a1f2e] focus:bg-[#1a1f2e] text-[#c4cce0] hover:text-white focus:text-white rounded-lg mx-1 my-0.5 px-3 py-2.5"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mr-2.5 flex-shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Settings
                </DropdownMenuItem>

                {/* Contact Support */}
                <DropdownMenuItem
                  onClick={() => router.push('/contact')}
                  className="cursor-pointer hover:bg-[#1a1f2e] focus:bg-[#1a1f2e] text-[#c4cce0] hover:text-white focus:text-white rounded-lg mx-1 my-0.5 px-3 py-2.5"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mr-2.5 flex-shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  Contact Support
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-[#1f2937]" />

              <div className="py-1">
                {/* Log out */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-[#1a1f2e] focus:bg-[#1a1f2e] text-[#6b7280] hover:text-[#c4cce0] focus:text-[#c4cce0] rounded-lg mx-1 my-0.5 px-3 py-2.5"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="mr-2.5 flex-shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                  </svg>
                  Log out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-[220px] flex-1">
        {children}
      </div>
    </div>
  );
}
