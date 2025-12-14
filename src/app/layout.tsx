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
  title: 'InterviewSense - CS Internship Interview Preparation | LeetCode Practice & AI Feedback',
  description: 'Land CS internships at top tech companies with AI-powered interview prep. Practice LeetCode problems, master behavioral questions, and get instant feedback. Free for all computer science students.',
  keywords: [
    'CS internship interview prep',
    'computer science internship',
    'coding interview practice',
    'LeetCode practice',
    'tech internship behavioral questions',
    'software engineering internship',
    'AI interview feedback',
    'FAANG internship prep',
    'Google internship interview',
    'Meta internship questions',
    'Amazon internship coding',
    'Microsoft internship prep',
    'technical interview practice',
    'CS student interview help',
    'programming interview questions',
    'algorithm interview prep',
    'data structures practice',
    'system design for interns'
  ],
  authors: [{ name: 'InterviewSense Team' }],
  creator: 'InterviewSense',
  publisher: 'InterviewSense',
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
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
    url: 'https://www.interviewsense.org',
    siteName: 'InterviewSense - CS Internship Interview Prep',
    title: 'InterviewSense - CS Internship Interview Preparation | LeetCode Practice & AI Feedback',
    description: 'Land CS internships at top tech companies with AI-powered interview prep. Practice LeetCode problems, master behavioral questions, and get instant feedback. Free for all computer science students.',
    images: [
      {
        url: 'https://www.interviewsense.org/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InterviewSense - CS Internship Interview Preparation Platform',
        type: 'image/png',
      },
      {
        url: 'https://www.interviewsense.org/og-image-square.png',
        width: 1200,
        height: 1200,
        alt: 'InterviewSense - CS Interview Prep',
        type: 'image/png',
      }
    ],
  },
  
  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    site: '@interviewsense',
    creator: '@interviewsense',
    title: 'InterviewSense - CS Internship Interview Preparation',
    description: 'Land CS internships at top tech companies with AI-powered interview prep. Practice LeetCode problems, master behavioral questions, and get instant feedback.',
    images: ['https://www.interviewsense.org/og-image.png'],
  },
  
  // Additional meta tags
  alternates: {
    canonical: 'https://www.interviewsense.org',
  },
  
  // App-specific meta
  applicationName: 'InterviewSense',
  referrer: 'origin-when-cross-origin',
  category: 'Technology',
  other: {
    'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
  },
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