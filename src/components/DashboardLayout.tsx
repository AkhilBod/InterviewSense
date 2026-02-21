"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        await signOut({ callbackUrl: '/' });
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelSubscription = async () => {
    // Get the Stripe customer portal URL
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      alert('Failed to access billing portal. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1e] text-white">
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
                {/* Icon */}
                {item.icon === 'behavioral' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="12" r="6" fill="currentColor" opacity=".7"/>
                    <path d="M8 34c0-6.627 5.373-10 12-10s12 3.373 12 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".7"/>
                  </svg>
                )}
                {item.icon === 'technical' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="7" width="32" height="26" rx="5" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/>
                    <path d="M16 23l-4 3 4 3M24 23l4 3-4 3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
                  </svg>
                )}
                {item.icon === 'resume' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="3" width="24" height="34" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/>
                    <path d="M25 30l2.2 2.2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
                  </svg>
                )}
                {item.icon === 'cover' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="8" width="32" height="24" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/>
                    <path d="M4 12l16 11 16-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".7"/>
                  </svg>
                )}
                {item.icon === 'portfolio' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="12" width="32" height="22" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/>
                    <path d="M14 12v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".7"/>
                  </svg>
                )}
                {item.icon === 'system' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="15" width="10" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/>
                    <rect x="27" y="5" width="10" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="2" opacity=".7"/>
                    <line x1="13" y1="20" x2="27" y2="10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity=".7"/>
                  </svg>
                )}
                {item.icon === 'roadmap' && (
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 34 C10 26 14 22 20 20 C26 18 30 14 32 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".7"/>
                    <circle cx="20" cy="20" r="2" fill="currentColor" opacity=".7"/>
                  </svg>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#6b7280]">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#111827] border-[#1f2937] text-white" align="end" side="top">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-[#1a1f2e] focus:bg-[#1a1f2e] text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Log out
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1f2937]" />
              <DropdownMenuItem
                onClick={handleCancelSubscription}
                className="cursor-pointer hover:bg-[#1a1f2e] focus:bg-[#1a1f2e] text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Cancel subscription
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1f2937]" />
              <DropdownMenuItem
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="cursor-pointer hover:bg-red-900/20 focus:bg-red-900/20 text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {isDeleting ? 'Deleting...' : 'Delete account'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1f2937]" />
              <DropdownMenuItem
                onClick={() => router.push('/contact')}
                className="cursor-pointer hover:bg-[#1a1f2e] focus:bg-[#1a1f2e] text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Contact Support
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area with left margin for sidebar */}
      <div className="ml-[220px] flex-1">
        {children}
      </div>
    </div>
  );
}
