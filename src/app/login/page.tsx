'use client'

import type React from 'react'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { FcGoogle } from 'react-icons/fc'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import StarryBackground from '@/components/StarryBackground'

function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Handle error and success from URL parameters
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');

    if (errorParam) {
      switch (errorParam) {
        case 'CredentialsSignin':
          setError('Invalid email or password')
          break
        case 'OAuthSignin':
        case 'OAuthCallback':
          setError('Error signing in. Please try again')
          break
        case 'OAuthAccountNotLinked':
          setError('Email already in use with different sign in method')
          break
        case 'SessionRequired':
          setError('Please sign in to access this page')
          break
        default:
          setError('An error occurred during sign in')
      }
    }

    if (successParam === 'email-verified') {
      setSuccess('Your email has been verified successfully.');
    }
  }, [searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
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

      router.push('/dashboard')
    } catch (error) {
      setError('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('Error signing in with Google')
    }
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
          background: radial-gradient(ellipse 80% 50% at 50% -20%,
            rgba(1, 87, 255, 0.15),
            transparent 50%),
          radial-gradient(ellipse 60% 80% at 100% 50%,
            rgba(46, 157, 255, 0.12),
            transparent 50%),
          #0c0c10;
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
              Welcome Back to InterviewSense
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '40px',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              Log in to continue your interview preparation journey.
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
                }}>Log in to your account</span>
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
                }}>Access your dashboard</span>
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
                }}>Resume your practice</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
              }}>Welcome Back</h2>
              <p style={{
                fontSize: '13px',
                color: 'var(--muted)',
                fontFamily: 'DM Sans, sans-serif'
              }}>
                Enter your credentials to access your account.
              </p>
            </div>

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
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                <div className="text-right mt-2">
                  <Link href="/forgot-password" style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }} className="hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#3B82F6',
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
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center mt-5" style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'DM Sans, sans-serif' }}>
              Don't have an account?{' '}
              <Link href="/signup" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: 'var(--accent)' }} className="hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0c0c10' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div>
          <p className="mt-4" style={{ color: '#6b6b88', fontFamily: 'DM Sans, sans-serif' }}>Loading...</p>
        </div>
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
