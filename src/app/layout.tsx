// src/app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers' // Import the provider
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#3b82f6',
}

export const metadata: Metadata = {
  title: 'InterviewSense - AI-Powered Interview Preparation',
  description: 'Master your interviews with AI-powered practice sessions. Get personalized feedback on behavioral questions, technical assessments, and improve your interview skills.',
  keywords: [
    'interview preparation',
    'AI interview practice',
    'behavioral interview',
    'technical assessment',
    'job interview',
    'career development',
    'interview coaching',
    'mock interview'
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
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.svg', type: 'image/svg+XML' }
    ],
    apple: { url: '/apple-icon.svg', type: 'image/svg+xml' }
  },
  manifest: '/manifest.json',
  
  // Open Graph tags
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://interviewsense.org',
    siteName: 'InterviewSense',
    title: 'InterviewSense - AI-Powered Interview Preparation',
    description: 'Master your interviews with AI-powered practice sessions. Get personalized feedback on behavioral questions, technical assessments, and improve your interview skills.',
    images: [
      {
        url: 'https://interviewsense.org/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'InterviewSense - AI-Powered Interview Preparation Platform',
        type: 'image/png',
      },
      {
        url: 'https://interviewsense.org/og-image-square.png', // Square version for some platforms
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
    site: '@interviewsense', // Add your Twitter handle
    creator: '@interviewsense', // Add your Twitter handle
    title: 'InterviewSense - AI-Powered Interview Preparation',
    description: 'Master your interviews with AI-powered practice sessions. Get personalized feedback on behavioral questions, technical assessments, and improve your interview skills.',
    images: ['https://interviewsense.org/og-image.png'], // Same as OG image
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
        <Toaster />
      </body>
    </html>
  )
}