// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers' // Import the provider
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#3b82f6',
}

export const metadata: Metadata = {
  title: 'InterviewSense - AI-Powered Interview Preparation',
  description: 'Master interviews with AI-powered practice. Get instant feedback on behavioral questions, coding challenges & improve your interview skills. Free forever.',
  keywords: [
    'interview preparation',
    'AI interview practice',
    'behavioral interview',
    'technical assessment',
    'job interview',
    'career development',
    'interview coaching',
    'mock interview',
    'coding interview',
    'STAR method',
    'interview feedback',
    'job search'
  ],
  authors: [{ name: 'InterviewSense Team' }],
  creator: 'InterviewSense',
  publisher: 'InterviewSense',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/app-icon.svg', sizes: 'any' },
      { url: '/favicon.svg', sizes: 'any' }
    ],
    apple: { url: '/apple-icon.svg', sizes: '180x180' }
  },
  manifest: '/manifest.json',
  
  // Open Graph tags
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://interviewsense.org',
    siteName: 'InterviewSense',
    title: 'InterviewSense - AI-Powered Interview Preparation',
    description: 'Master interviews with AI-powered practice. Get instant feedback on behavioral questions, coding challenges & improve your interview skills. Free forever.',
    images: [
      {
        url: 'https://interviewsense.org/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InterviewSense - AI-Powered Interview Preparation Platform',
        type: 'image/png',
      },
      {
        url: 'https://interviewsense.org/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'InterviewSense Logo',
        type: 'image/png',
      }
    ],
  },
  
  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    site: '@interviewsense',
    creator: '@interviewsense',
    title: 'InterviewSense - AI-Powered Interview Preparation',
    description: 'Master interviews with AI-powered practice. Get instant feedback on behavioral questions, coding challenges & improve your interview skills. Free forever.',
    images: ['https://interviewsense.org/og-image.png'],
  },
  
  // Additional meta tags
  alternates: {
    canonical: 'https://interviewsense.org',
  },
  
  // App-specific meta
  applicationName: 'InterviewSense',
  referrer: 'origin-when-cross-origin',
  category: 'Technology',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-white`}>
        <Providers> {/* Wrap your content with the SessionProvider */}
          {children}
        </Providers>
        <ServiceWorkerRegistration />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}