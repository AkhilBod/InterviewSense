// app/verify-request/page.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, ChevronLeft, Mail } from 'lucide-react'

export default function VerifyRequestPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <span className="font-semibold text-white">InterviewSense</span>
          </Link>
          <nav>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">Log in</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1 py-12 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container px-4 max-w-md relative z-10">
          {/* Back button */}
          <Button variant="ghost" size="sm" asChild className="gap-2 mb-8 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full">
             <Link href="/"><ChevronLeft className="h-4 w-4" /> Back to home</Link>
          </Button>

          <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="space-y-2 pt-8">
              <div className="flex justify-center mb-4">
                <Mail className="h-12 w-12 text-blue-500" />
              </div>
              <CardTitle className="text-2xl text-center text-white">Check your email</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                A sign-in link has been sent to your email address. Please check your inbox and click the link to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <div className="p-4 rounded-lg bg-zinc-700/30 border border-zinc-700">
                <p className="text-sm text-zinc-300">
                  If you don't see the email in your inbox, please check your spam folder. The email comes from <span className="text-blue-400">noreply@interviewsense.com</span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col pb-8 px-6">
              <div className="text-sm text-zinc-400 text-center mt-4">
                Didn't receive an email?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  Try again
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800 mt-auto bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-white">InterviewSense</span>
            </div>
            <div className="text-sm text-zinc-500">
              © {new Date().getFullYear()} InterviewSense. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}