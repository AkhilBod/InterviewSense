'use client';

import type React from 'react'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, AlertCircle, ArrowRight, LogOut, User, XCircle, CheckCircle2, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FcGoogle } from 'react-icons/fc'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserAccountDropdown } from '@/components/UserAccountDropdown'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function SignupPage() {
  const { data: session } = useSession()
  const [signupMethod, setSignupMethod] = useState<'email' | 'google'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState<'email' | 'google' | false>(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [creatorCode, setCreatorCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get creator code from URL parameters
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      setCreatorCode(codeFromUrl)
    }
  }, [searchParams])

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

  // Form validation
  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return false
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    return true
  }

  // Handle email signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setVerificationSent(false)
    
    // Validate form
    if (!validateForm()) return

    setIsLoading('email')
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          name: fullName,
          creatorCode: creatorCode || undefined
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account')
      }
      
      // Show success message and indicate verification email was sent
      setSuccess('Account created successfully!')
      setVerificationSent(true)
      
      // Only clear password and name, keep email for resend functionality
      setPassword('')
      setFullName('')
    } catch (error) {
      console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading('google')
    setError('')
    
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      setError('Failed to sign in with Google. Please try again.')
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another verification email`)
      return
    }

    setIsLoading('email')
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

  // If verification email has been sent, show verification instructions
  if (verificationSent) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
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
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="space-y-2 pt-8">
                <div className="mx-auto bg-blue-900/20 p-3 rounded-full border border-blue-800/50 mb-2">
                  <Mail className="h-8 w-8 text-blue-400" />
                </div>
                <CardTitle className="text-2xl text-center text-white">Check your email</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                  A verification link has been sent to {email}. Please check your inbox and click the link to verify your email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6">
                {/* Error message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-red-900/30 border border-red-800 text-red-200">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                
                {/* Success message */}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-green-900/30 border border-green-800 text-green-200">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    <p className="text-sm">{success}</p>
                  </div>
                )}

                <div className="p-4 rounded-lg bg-zinc-700/30 border border-zinc-700">
                  <p className="text-sm text-zinc-300">
                    If you don't see the email in your inbox, please check your spam folder. The email comes from <span className="text-blue-400">noreply@interviewsense.com</span>
                  </p>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Button 
                    onClick={handleResendVerification}
                    variant="outline" 
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full"
                    disabled={isLoading === 'email' || cooldown > 0}
                  >
                    {isLoading === 'email' ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                    {!isLoading && cooldown === 0 && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>

                  <Button 
                    onClick={() => setVerificationSent(false)}
                    variant="outline" 
                    className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full"
                  >
                    Go back to sign up
                  </Button>
                  
                  <Link href="/login">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full" 
                    >
                      Continue to login
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col pb-8 px-6">
                <div className="text-sm text-zinc-400 text-center mt-4">
                  Need help?{' '}
                  <Link href="/contact" className="text-blue-400 hover:text-blue-300">
                    Contact support
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
                <Image src="/logo.webp" alt="InterviewSense" width={28} height={28} className="object-contain" />
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-white">InterviewSense</span>
          </Link>
          <nav className="flex items-center gap-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                      <AvatarFallback className="bg-blue-500">
                        {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {session.user?.name && (
                        <p className="font-medium text-sm text-white">{session.user.name}</p>
                      )}
                      {session.user?.email && (
                        <p className="w-[200px] truncate text-sm text-zinc-400">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer">
                    <Link href="/">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 focus:text-red-400 focus:bg-red-950/50 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">Log in</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1 py-12 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container px-4 max-w-md relative z-10">
          <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="space-y-2 pt-8">
              <CardTitle className="text-2xl text-center text-white">Create an account</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Sign up to InterviewSense to track your progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6">
              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-red-900/30 border border-red-800 text-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              {/* Success message */}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-green-900/30 border border-green-800 text-green-200">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              {/* Creator Code Indicator */}
              {creatorCode && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-blue-900/30 border border-blue-800 text-blue-200">
                  <Image src="/logo.webp" alt="InterviewSense" width={20} height={20} className="object-contain flex-shrink-0" />
                  <p className="text-sm">
                    Using creator code: <span className="font-semibold">{creatorCode}</span>
                  </p>
                </div>
              )}
            
              {/* Radio Group for signup method */}
              <RadioGroup
                value={signupMethod}
                onValueChange={(value) =>
                  setSignupMethod(value as 'email' | 'google')
                }
                className="grid grid-cols-2 gap-4"
              >
                {/* Email Option */}
                <div>
                  <RadioGroupItem value="email" id="email-signup" className="peer sr-only" />
                  <Label htmlFor="email-signup" className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-4 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 cursor-pointer transition-colors">
                    <Mail className="mb-2 h-6 w-6 text-blue-500" />
                    <span className="text-sm text-zinc-300">Email</span>
                  </Label>
                </div>

                {/* Google Option */}
                <div>
                  <RadioGroupItem value="google" id="google-signup" className="peer sr-only" />
                  <Label htmlFor="google-signup" className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-4 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 cursor-pointer transition-colors">
                    <FcGoogle className="mb-2 h-6 w-6" />
                    <span className="text-sm text-zinc-300">Google</span>
                  </Label>
                </div>
              </RadioGroup>

              {/* Conditional Rendering based on signup method */}
              {signupMethod === 'email' ? (
                <form onSubmit={handleEmailSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-zinc-300">Full Name</Label>
                    <Input 
                      id="full-name" 
                      placeholder="Your Name" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      required 
                      className="bg-zinc-800/70 border-zinc-700 text-white" 
                    />
                  </div>
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
                    <Label htmlFor="new-password" className="text-zinc-300">Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      placeholder="Create a secure password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="bg-zinc-800/70 border-zinc-700 text-white" 
                    />
                    <p className="text-xs text-zinc-500">Password must be at least 8 characters long</p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6 mt-2" 
                    disabled={isLoading === 'email'}
                  >
                    {isLoading === 'email' ? 'Creating your account...' : 'Create account'}
                    {isLoading !== 'email' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              ) : ( // Google Selected
                <div className="space-y-5">
                  <p className="text-sm text-zinc-400 text-center">
                    Continue signing up with your Google account
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full py-6"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading === 'google'}
                  >
                    <FcGoogle className="h-5 w-5" />
                    {isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col pb-8 px-6">
              <div className="text-sm text-zinc-400 text-center mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  Log in
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
              <Image src="/logo.webp" alt="InterviewSense" width={28} height={28} className="object-contain" />
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

export default function SignupPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <SignupPage />
    </Suspense>
  );
}