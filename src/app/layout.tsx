// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers' // Import the provider
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InterviewSense',
  description: 'AI-powered interview preparation',
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