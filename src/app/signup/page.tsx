'use client' // Keep this directive

import type React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, ChevronLeft, Mail, CheckCircle2, ArrowRight } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FcGoogle } from 'react-icons/fc'
import { FaMicrosoft } from 'react-icons/fa'
import { signIn } from 'next-auth/react' // Import signIn
import { useRouter } from 'next/navigation' // Optional: for redirection after success

export default function SignupPage() {
  const [signupMethod, setSignupMethod] = useState<'email' | 'google' | 'microsoft'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState<'email' | 'google' | 'microsoft' | false>(false) // Make isLoading specific or boolean
  // const [step, setStep] = useState(1) // You might not need the 'step' logic for OAuth flows
  const router = useRouter() // Optional: for redirect

  // Keep your email signup logic
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading('email')
    // --- TODO: Replace setTimeout with your actual API call ---
    // Example:
    // try {
    //   const response = await fetch('/api/your-signup-endpoint', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password, fullName }),
    //   });
    //   if (!response.ok) throw new Error('Signup failed');
    //   // Handle success (e.g., show step 2 or redirect)
    //   // setStep(2); // Or redirect router.push('/verify-email');
    // } catch (error) {
    //   console.error("Signup error:", error);
    //   // Handle error (e.g., show error message)
    // } finally {
    //   setIsLoading(false);
    // }
    // --- End TODO ---

    // Placeholder logic:
    console.log('Simulating email signup for:', { fullName, email })
    setTimeout(() => {
      setIsLoading(false)
      // setStep(2); // Decide how to handle post-email signup (e.g., redirect to verification page)
      alert(`Email signup submitted for ${email}. Implement actual logic and verification.`);
    }, 1500)
  }

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsLoading('google')
    try {
      // This triggers the Google OAuth flow managed by NextAuth.js
      // It will redirect the user to Google, then back to your callback URL.
      // On success, NextAuth handles session creation.
      // You can specify a callbackUrl to redirect after successful sign-in
      await signIn('google', { callbackUrl: '/start' }) // Redirect to /start on success
      // signIn doesn't resolve here if redirect is successful, it navigates away.
      // Code here might run only if signIn fails immediately (e.g., config error).
    } catch (error) {
      console.error('Google Sign-In Error:', error)
      // Handle errors (e.g., show a notification to the user)
      alert('Failed to sign in with Google. Please try again.');
    } finally {
       // Setting loading to false might be tricky because of redirects.
       // Consider managing loading state based on session status or navigation events if needed.
       // setIsLoading(false); // This might not always execute if redirect happens
    }
  }

  // Handle Microsoft Sign In (Placeholder - requires setting up Microsoft provider in NextAuth)
  const handleMicrosoftSignIn = async () => {
      setIsLoading('microsoft');
      alert('Microsoft Sign-In not implemented yet. Set up Microsoft Provider in NextAuth config.');
      // Example: await signIn('azure-ad', { callbackUrl: '/start' }); // Use correct provider key
      setIsLoading(false);
  }


  // --- Render Logic ---
  // You might want to check session status here using useSession() from 'next-auth/react'
  // const { data: session, status } = useSession();
  // if (status === 'loading') return <p>Loading...</p>;
  // if (session) { router.push('/start'); return null; } // Redirect if already logged in

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header remains the same */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        {/* ... header content ... */}
      </header>

      <div className="flex-1 py-12 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container px-4 max-w-md relative z-10">
          {/* Back button remains the same */}
          <Button variant="ghost" size="sm" asChild className="gap-2 mb-8 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full">
             <Link href="/"><ChevronLeft className="h-4 w-4" /> Back to home</Link>
          </Button>

          {/* Remove the step logic for simplicity with OAuth, or adapt it */}
          {/* {step === 1 ? ( */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="space-y-2 pt-8">
                <CardTitle className="text-2xl text-center text-white">Create an account</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                  Sign up to InterviewSense to track your progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-6">
                {/* Radio Group remains the same */}
                 <RadioGroup
                  value={signupMethod}
                  onValueChange={(value) =>
                    setSignupMethod(value as 'email' | 'google' | 'microsoft')
                  }
                  className="grid grid-cols-3 gap-4"
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

                  {/* Microsoft Option */}
                  <div>
                    <RadioGroupItem value="microsoft" id="microsoft-signup" className="peer sr-only" />
                     <Label htmlFor="microsoft-signup" className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-4 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 cursor-pointer transition-colors">
                      <FaMicrosoft className="mb-2 h-6 w-6 text-blue-500" />
                       <span className="text-sm text-zinc-300">Microsoft</span>
                     </Label>
                   </div>
                </RadioGroup>

                {/* Conditional Rendering */}
                {signupMethod === 'email' ? (
                  <form onSubmit={handleEmailSignup} className="space-y-5">
                     {/* Email form inputs remain the same */}
                     <div className="space-y-2">
                       <Label htmlFor="full-name" className="text-zinc-300">Full Name</Label>
                       <Input id="full-name" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-zinc-800/70 border-zinc-700 text-white" />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="email-address" className="text-zinc-300">Email</Label>
                       <Input id="email-address" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-zinc-800/70 border-zinc-700 text-white" />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="new-password" className="text-zinc-300">Password</Label>
                       <Input id="new-password" type="password" placeholder="Create a secure password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-zinc-800/70 border-zinc-700 text-white" />
                       <p className="text-xs text-zinc-500">Password must be at least 8 characters long</p>
                     </div>
                     <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6 mt-2" disabled={isLoading === 'email'}>
                       {isLoading === 'email' ? 'Creating your account...' : 'Create account'}
                       {isLoading !== 'email' && <ArrowRight className="ml-2 h-4 w-4" />}
                     </Button>
                  </form>
                ) : ( // Google or Microsoft Selected
                  <div className="space-y-5">
                    <p className="text-sm text-zinc-400 text-center">
                      Continue signing up with your {signupMethod === 'google' ? 'Google' : 'Microsoft'} account
                    </p>
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full py-6"
                      // Use specific handlers for each provider
                      onClick={signupMethod === 'google' ? handleGoogleSignIn : handleMicrosoftSignIn}
                      disabled={isLoading === 'google' || isLoading === 'microsoft'}
                    >
                      {signupMethod === 'google' ? (
                        <>
                          <FcGoogle className="h-5 w-5" />
                          {isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
                        </>
                      ) : ( // Microsoft
                        <>
                          <FaMicrosoft className="h-5 w-5 text-blue-500" />
                          {isLoading === 'microsoft' ? 'Connecting...' : 'Continue with Microsoft'}
                        </>
                      )}
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

      {/* Footer remains the same */}
      <footer className="py-8 border-t border-zinc-800 mt-auto bg-zinc-950">
        {/* ... footer content ... */}
      </footer>
    </div>
  )
}