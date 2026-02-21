'use client';

import type React from 'react'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle, Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import Image from 'next/image'
import { FcGoogle } from 'react-icons/fc'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function SignupPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [creatorCode, setCreatorCode] = useState('')

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

  // Handle email signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setVerificationSent(false)

    // Validate form
    if (!fullName.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    
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
    setError(null)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('Error signing in with Google')
    }
  }

  const handleResendVerification = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another verification email`)
      return
    }

    setIsLoading(true)
    setError(null)
    
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
      <div className="flex flex-col min-h-screen text-white relative bg-[#000818]">
        {/* Navbar */}
        <nav className="w-full z-50 relative py-4">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-4">
              <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={50} height={50} className="object-contain" />
              <span className="font-bold text-2xl text-white hidden sm:block">InterviewSense</span>
            </Link>
          </div>
        </nav>

        <div className="flex-1 py-12 flex items-center justify-center relative z-20 px-4">
          <div className="w-full max-w-md">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl p-8 sm:p-10">
              {/* Check Email Header */}
              <div className="text-center mb-8">
                <div className="mx-auto bg-blue-500/10 p-4 rounded-full w-fit mb-4">
                  <Mail className="h-12 w-12 text-blue-500" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Check your email</h1>
                <p className="text-zinc-400 text-sm">
                  A verification link has been sent to {email}
                </p>
              </div>

              {/* Success message */}
              {success && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/20 border border-green-800/50 text-green-200 mb-6">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/50 text-red-200 mb-6">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="p-4 rounded-lg bg-zinc-800/70 border border-zinc-700 mb-6">
                <p className="text-sm text-zinc-300">
                  If you don't see the email in your inbox, please check your spam folder.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg h-12"
                  disabled={isLoading || cooldown > 0}
                >
                  {isLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                </Button>

                <Button
                  onClick={() => setVerificationSent(false)}
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg h-12"
                >
                  Go back to sign up
                </Button>

                <Link href="/login" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12">
                    Continue to login
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-zinc-400 text-center mt-6">
                Need help?{' '}
                <Link href="/contact" className="text-blue-400 hover:text-blue-300">
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 relative z-20">
          <div className="container mx-auto px-4">
            <div className="text-center text-zinc-600 text-sm">
              © {new Date().getFullYear()} InterviewSense. Interview practice that works.
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0c0c10' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bg: #0c0c10;
          --surface: #13131a;
          --input-bg: #1a1a24;
          --border: #252533;
          --text: #eeeef5;
          --muted: #6b6b88;
          --accent: #3B82F6;
          --accent-2: #60A5FA;
          --accent-glow: rgba(59,130,246,0.2);
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeUp {
          animation: fadeUp 0.5s ease;
        }

        .aurora-bg {
          position: absolute;
          inset: 0;
          background: #0c0c10;
        }

        .aurora-bg::before {
          content: '';
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          height: 80%;
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.5) 40%, rgba(96, 165, 250, 0.2) 70%, transparent 100%);
          filter: blur(80px);
        }

        .aurora-bg::after {
          content: '';
          position: absolute;
          top: 0;
          left: 20%;
          width: 60%;
          height: 50%;
          background: radial-gradient(ellipse at top, rgba(96, 165, 250, 0.4) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%);
          filter: blur(60px);
        }

        .grain-texture {
          position: absolute;
          inset: 0;
          opacity: 0.35;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E");
        }
      `}</style>

      {/* Left Side - Aurora Background with Branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        <div className="aurora-bg" />

        {/* Content - Bottom Aligned */}
        <div className="relative z-10 flex flex-col justify-end pb-24 px-12 w-full">
          <div className="text-center max-w-lg mx-auto">
            {/* Logo + Brand Name */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <Image
                src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png"
                alt="InterviewSense"
                width={52}
                height={52}
                className="object-contain"
              />
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 600, color: 'white' }}>
                InterviewSense
              </span>
            </div>

            {/* H1 */}
            <h1 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '36px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.25,
              marginBottom: '16px'
            }}>
              Get Started with InterviewSense
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '40px',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              Complete these easy steps to start acing your interviews.
            </p>

            {/* Steps */}
            <div className="space-y-3 w-full">
              {/* Step 1 - Active */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'black',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700
                }}>1</div>
                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'black'
                }}>Create your account</span>
              </div>

              {/* Step 2 - Inactive */}
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700
                }}>2</div>
                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)'
                }}>Set up your profile</span>
              </div>

              {/* Step 3 - Inactive */}
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700
                }}>3</div>
                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.6)'
                }}>Choose your practice plan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-[48%] flex flex-col animate-fadeUp" style={{ background: '#0c0c10', padding: '40px 44px' }}>
        {/* Mobile Logo */}
        <div className="lg:hidden flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={36} height={36} className="object-contain" />
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 600, color: 'white' }}>
              InterviewSense
            </span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '6px'
              }}>Sign Up Account</h2>
              <p style={{
                fontSize: '13px',
                color: 'var(--muted)',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                Enter your details to start practicing smarter.
              </p>
            </div>

            {/* Creator Code */}
            {creatorCode && (
              <div style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: 'var(--text)',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                Using creator code: <strong>{creatorCode}</strong>
              </div>
            )}

            {/* Success/Error */}
            {success && (
              <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#3B82F6', fontFamily: 'DM Sans, sans-serif' }}>
                {success}
              </div>
            )}
            {error && (
              <div style={{ background: 'rgba(255,99,99,0.1)', border: '1px solid rgba(255,99,99,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: '#ff6363', fontFamily: 'DM Sans, sans-serif' }}>
                {error}
              </div>
            )}

            {/* OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              style={{
                width: '100%',
                height: '42px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '9px',
                color: 'var(--text)',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--input-bg)'
                e.currentTarget.style.borderColor = '#3a3a50'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <FcGoogle className="h-5 w-5" />
              Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>Or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Name Fields Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#aaaac0',
                    fontWeight: 500,
                    marginBottom: '5px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>First Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Alex"
                    value={fullName.split(' ')[0] || ''}
                    onChange={(e) => {
                      const lastName = fullName.split(' ').slice(1).join(' ')
                      setFullName(e.target.value + (lastName ? ' ' + lastName : ''))
                    }}
                    required
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: 'var(--text)',
                      fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif',
                      width: '100%',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#aaaac0',
                    fontWeight: 500,
                    marginBottom: '5px',
                    fontFamily: 'DM Sans, sans-serif'
                  }}>Last Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Rivera"
                    value={fullName.split(' ').slice(1).join(' ')}
                    onChange={(e) => {
                      const firstName = fullName.split(' ')[0] || ''
                      setFullName(firstName + (e.target.value ? ' ' + e.target.value : ''))
                    }}
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: 'var(--text)',
                      fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif',
                      width: '100%',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#aaaac0',
                  fontWeight: 500,
                  marginBottom: '5px',
                  fontFamily: 'DM Sans, sans-serif'
                }}>Email</label>
                <Input
                  type="email"
                  placeholder="e.g. alex@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    fontFamily: 'DM Sans, sans-serif',
                    width: '100%',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#aaaac0',
                  fontWeight: 500,
                  marginBottom: '5px',
                  fontFamily: 'DM Sans, sans-serif'
                }}>Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      paddingRight: '40px',
                      color: 'var(--text)',
                      fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif',
                      width: '100%',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted)' }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', fontFamily: 'DM Sans, sans-serif' }}>
                  Must be at least 8 characters.
                </p>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '44px',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  border: 'none',
                  borderRadius: '9px',
                  color: 'white',
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.1)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.35)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center mt-5" style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--accent)' }} className="hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0c0c10' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div>
          <p className="mt-4" style={{ color: '#6b6b88', fontFamily: 'DM Sans, sans-serif' }}>Loading...</p>
        </div>
      </div>
    }>
      <SignupPage />
    </Suspense>
  );
}