'use client'

import type React from 'react'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, ArrowLeft, Mail, AlertCircle, ArrowRight, LogOut, User, XCircle, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FcGoogle } from 'react-icons/fc'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserAccountDropdown } from '@/components/UserAccountDropdown'

function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loginMethod, setLoginMethod] = useState<'email' | 'google'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Handle cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [cooldown])

  // Handle error and success from URL parameters
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const autoLogin = searchParams.get('autoLogin');
    const userEmail = searchParams.get('email');

    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError('Invalid email or password')
          break
        case 'EmailSignin':
          setError('Error sending verification email')
          break
        case 'OAuthSignin':
          setError('Error signing in with Google')
          break
        case 'OAuthCallback':
          setError('Error completing Google sign in')
          break
        case 'OAuthCreateAccount':
          setError('Error creating account with Google')
          break
        case 'EmailCreateAccount':
          setError('Error creating account with email')
          break
        case 'Callback':
          setError('Error during authentication')
          break
        case 'OAuthAccountNotLinked':
          setError('Email already in use with different sign in method')
          break
        case 'EmailSignin':
          setError('Check your email for the sign in link')
          break
        case 'SessionRequired':
          setError('Please sign in to access this page')
          break
        case 'missing-token':
          setError('Verification link is invalid')
          break
        case 'invalid-token':
          setError('Verification link is invalid or has expired')
          break
        case 'expired-token':
          setError('Verification link has expired. Please request a new one')
          break
        case 'user-not-found':
          setError('User account not found')
          break
        case 'verification-failed':
          setError('Failed to verify your email. Please try again or request a new verification link')
          break
        default:
          setError('An error occurred during sign in')
      }
    }

    if (successParam === 'email-verified') {
      setSuccess('Your email has been verified successfully.');
      if (autoLogin === 'true' && userEmail) {
        setEmail(userEmail);
        // It's generally not recommended to auto-submit forms programmatically
        // for security and UX reasons. Consider prompting the user to click login.
        // However, if auto-login is a strict requirement:
        // Ensure password field is also populated if needed or handle appropriately.
      }
    }
    // Clear error and success messages from URL to prevent them from reappearing on refresh
    // router.replace('/login', undefined); // Be cautious with this, might interfere with other logic
  }, [searchParams, router]); // Added router to dependency array

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false); // Ensure loading state is reset
      return;
    }
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Check onboarding status
      try {
        const response = await fetch('/api/user/onboarding/status')
        const data = await response.json()
        
        if (!data.onboardingCompleted) {
          router.push('/dashboard')
          return
        }
        
        router.push('/dashboard')
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        router.push('/dashboard')
      }
    } catch (error) {
      setError('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      // For Google sign-in, we'll check onboarding status in the dashboard page
      // since we use redirect flow
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('Error signing in with Google')
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another verification email`)
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email')
      }
      
      setSuccess('A new verification link has been sent to your email')
      setCooldown(60) // Start 60 second cooldown
    } catch (error) {
      console.error('Resend verification error:', error)
      setError(error instanceof Error ? error.message : 'Failed to resend verification email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-white">InterviewSense</span>
          </Link>
          <nav className="flex items-center gap-4">
            {session ? (
              <UserAccountDropdown />
            ) : (
              <Link href="/signup">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">Sign up</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1 pt-20 py-12 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container px-4 max-w-md relative z-10">
          <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="space-y-2 pt-8">
              <CardTitle className="text-2xl text-center text-white">Log in to your account</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Welcome back! Please log in to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6">
              {/* Success message */}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-green-900/30 border border-green-800 text-green-200">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex flex-col gap-2 p-3 rounded-md bg-red-900/30 border border-red-800 text-red-200">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                  {error.includes('verification') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isLoading || cooldown > 0}
                      className="mt-2 text-sm border-red-800 text-red-200 hover:bg-red-900/50 hover:text-red-100"
                    >
                      {isLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                    </Button>
                  )}
                </div>
              )}
            
              {/* Radio Group for login method */}
              <RadioGroup
                value={loginMethod}
                onValueChange={(value) =>
                  setLoginMethod(value as 'email' | 'google')
                }
                className="grid grid-cols-2 gap-3"
              >
                {/* Email Option */}
                <div>
                  <RadioGroupItem value="email" id="email-login" className="peer sr-only" />
                  <Label htmlFor="email-login" className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-3 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 cursor-pointer transition-colors">
                    <Mail className="mb-2 h-5 w-5 text-blue-500" />
                    <span className="text-xs text-zinc-300">Password</span>
                  </Label>
                </div>

                {/* Google Option */}
                <div>
                  <RadioGroupItem value="google" id="google-login" className="peer sr-only" />
                  <Label htmlFor="google-login" className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-3 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 cursor-pointer transition-colors">
                    <FcGoogle className="mb-2 h-5 w-5" />
                    <span className="text-xs text-zinc-300">Google</span>
                  </Label>
                </div>
              </RadioGroup>

              {/* Conditional Rendering based on login method */}
              {loginMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email-address" className="text-zinc-300">Email</Label>
                    <Input 
                      id="email-address" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="bg-zinc-800/70 border-zinc-700 text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-zinc-300">Password</Label>
                      <div className="text-right">
                        <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter your password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="bg-zinc-800/70 border-zinc-700 text-white" 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6 mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Log in'}
                  </Button>
                </form>
              )}

              {loginMethod === 'google' && (
                <div className="space-y-5">
                  <p className="text-sm text-zinc-400 text-center">
                    Continue signing in with your Google account
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full py-6"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <FcGoogle className="h-5 w-5" />
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col pb-8 px-6">
              <div className="text-sm text-zinc-400 text-center mt-4">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                  Sign up
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
              <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={28} height={28} className="object-contain" />
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

export default function LoginPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}