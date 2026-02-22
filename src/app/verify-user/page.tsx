'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react'

export default function VerifyUserPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Redirect if already verified or not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signup')
      return
    }
    if (status === 'authenticated' && session?.user?.emailVerified) {
      router.push('/questionnaire')
      return
    }
  }, [status, session, router])

  // Cooldown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleResendEmail = async () => {
    setResendLoading(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email }),
      })

      if (response.ok) {
        setResendSuccess(true)
        setResendCooldown(60)
        setTimeout(() => setResendSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to resend email:', error)
    } finally {
      setResendLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="border border-zinc-800 rounded-lg p-8 bg-zinc-900/50 backdrop-blur">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-blue-500/5 animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Verify your email
          </h1>
          <p className="text-zinc-400 text-center mb-6">
            We've sent a verification link to<br />
            <span className="text-zinc-300 font-medium">{session?.user?.email}</span>
          </p>

          {/* Instructions */}
          <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-zinc-300">
              Click the link in the email to verify your account and continue to the interview prep questionnaire.
            </p>
          </div>

          {/* Success Message */}
          {resendSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 flex items-gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-300">
                Verification email sent successfully!
              </p>
            </div>
          )}

          {/* Resend Button */}
          <button
            onClick={handleResendEmail}
            disabled={resendCooldown > 0 || resendLoading}
            className={`w-full py-2.5 rounded-lg font-medium transition-all mb-4 ${
              resendCooldown > 0 || resendLoading
                ? 'bg-zinc-700/30 text-zinc-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend email'}
          </button>

          {/* Helper text */}
          <p className="text-xs text-zinc-500 text-center">
            Check your spam folder if you don't see the email
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500 mt-8">
          Once verified, you'll continue to set up your interview prep profile
        </p>
      </div>
    </div>
  )
}
