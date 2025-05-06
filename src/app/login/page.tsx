'use client'

import type React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, ChevronLeft, Mail, AlertCircle, ArrowRight } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FcGoogle } from 'react-icons/fc'
import { FaMicrosoft } from 'react-icons/fa'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'google' | 'microsoft' | 'magic-link'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState<'email' | 'google' | 'microsoft' | 'magic-link' | false>(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check for error from NextAuth
  const errorParam = searchParams?.get('error')
  
  // Set error message based on NextAuth error
  useState(() => {
    if (errorParam === 'CredentialsSignin') {
      setError('Invalid email or password')
    } else if (errorParam) {
      setError('An error occurred. Please try again.')
    }
  })

  // Handle email login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }
    
    setIsLoading('email')
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
      
      if (!result?.ok) {
        throw new Error(result?.error || 'Failed to sign in')
      }
      
      router.push('/start')
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Failed to sign in. Please check your credentials.')
      setIsLoading(false)
    }
  }

  // Handle magic link email
  const handleMagicLinkEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setIsLoading('magic-link')
    
    try {
      const result = await signIn('email', {
        email,
        redirect: false,
      })
      
      if (result?.ok) {
        router.push('/verify-request')
      } else {
        throw new Error('Failed to send magic link')
      }
    } catch (error) {
      console.error('Magic link error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send magic link. Please try again.')
      setIsLoading(false)
    }
  }

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading('google')
    setError('')
    
    try {
      await signIn('google', { callbackUrl: '/start' })
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      setError('Failed to sign in with Google. Please try again.')
      setIsLoading(false)
    }
  }

  // Handle Microsoft Sign In
  const handleMicrosoftSignIn = async () => {
    setIsLoading('microsoft')
    setError('')
    
    try {
      await signIn('azure-ad', { callbackUrl: '/start' })
    } catch (error) {
      console.error('Microsoft Sign-In Error:', error)
      setError('Failed to sign in with Microsoft. Please try again.')
      setIsLoading(false)
    }
  }

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
            <Link href="/signup">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">Sign up</Button>
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
              <CardTitle className="text-2xl text-center text-white">Log in to your account</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Welcome back! Please log in to continue
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
            
              {/* Radio Group for login method */}
              <RadioGroup
                value={loginMethod}
                onValueChange={(value) =>
                  setLoginMethod(value as 'email' | 'google' | 'microsoft' | 'magic-link')
                }
                className="grid grid-cols-4 gap-3"
              >
                {/* Email Option */}
                <div>
                  <RadioGroupItem value="email" id="email-login" className="peer sr-only" />
                  <Label htmlFor="email-login" className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-3 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 cursor-pointer transition-colors">
                    <Mail className="mb-2 h-5 w-5 text-blue-500" />
                    <span className="text-xs text-zinc-300">Password</span>
                  </Label>
                </div>

                {/* Magic Link Option */}
                <div>
                  <RadioGroupItem value="magic-link" id="magic-link-login" className="peer sr-only" />
                  <Label htmlFor="magic-link-login" className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-3 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 cursor-pointer transition-colors">
                    <Mail className="mb-2 h-5 w-5 text-green-500" />
                    <span className="text-xs text-zinc-300">Magic Link</span>
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

                {/* Microsoft Option */}
                <div>
                  <RadioGroupItem value="microsoft" id="microsoft-login" className="peer sr-only" />
                  <Label htmlFor="microsoft-login" className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-3 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 cursor-pointer transition-colors">
                    <FaMicrosoft className="mb-2 h-5 w-5 text-blue-500" />
                    <span className="text-xs text-zinc-300">Microsoft</span>
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
                      <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                        Forgot password?
                      </Link>
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
                    disabled={isLoading === 'email'}
                  >
                    {isLoading === 'email' ? 'Logging in...' : 'Log in'}
                    {isLoading !== 'email' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              )}

              {loginMethod === 'magic-link' && (
                <form onSubmit={handleMagicLinkEmail} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email" className="text-zinc-300">Email</Label>
                    <Input 
                      id="magic-email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="bg-zinc-800/70 border-zinc-700 text-white" 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-500 text-white rounded-full py-6 mt-2"
                    disabled={isLoading === 'magic-link'}
                  >
                    {isLoading === 'magic-link' ? 'Sending link...' : 'Send magic link'}
                    {isLoading !== 'magic-link' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  <p className="text-xs text-zinc-500 text-center">We'll email you a magic link for password-free sign in</p>
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
                    disabled={isLoading === 'google'}
                  >
                    <FcGoogle className="h-5 w-5" />
                    {isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
                  </Button>
                </div>
              )}

              {loginMethod === 'microsoft' && (
                <div className="space-y-5">
                  <p className="text-sm text-zinc-400 text-center">
                    Continue signing in with your Microsoft account
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full py-6"
                    onClick={handleMicrosoftSignIn}
                    disabled={isLoading === 'microsoft'}
                  >
                    <FaMicrosoft className="h-5 w-5 text-blue-500" />
                    {isLoading === 'microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
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