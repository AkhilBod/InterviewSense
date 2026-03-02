"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import RotatingText from "./RotatingText"
import CountUpOnView from './CountUpOnView'
import RevealOnView from './RevealOnView'
import StarryBackground from '@/components/StarryBackground'
import Aurora from '@/components/Aurora'
import Antigravity from '@/components/Antigravity'
import Grainient from '@/components/Grainient'
import TypewriterHeadline from '@/components/TypewriterHeadline'
import PreparationSection from '@/components/PreparationSection'
import WhySection from '@/components/WhySection'
// Optional: if using next-auth or similar
import { getSession } from "next-auth/react"
import { useSession } from "next-auth/react"

// Structured Data for SEO - CS Intern Focused
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "InterviewSense - CS Internship Interview Prep",
  "description": "AI-powered interview preparation platform specifically designed for computer science students seeking internships. Practice coding challenges, behavioral questions, and get instant feedback on technical interviews for top tech companies like Google, Meta, Microsoft, and Amazon.",
  "url": "https://www.interviewsense.org",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "25",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "InterviewSense"
  },
  "provider": {
    "@type": "Organization",
    "name": "InterviewSense",
    "url": "https://www.interviewsense.org"
  },
  "featureList": [
    "LeetCode coding practice for internships",
    "Behavioral interview questions for CS students",
    "AI-powered technical interview feedback",
    "CS internship resume analysis",
    "System design practice for interns",
    "Real-time coding interview simulation",
    "Tech company interview questions",
    "Software engineering internship prep"
  ],
          "screenshot": "https://www.interviewsense.org/og-image.png",
  "keywords": "CS internship interview prep, computer science interview practice, coding interview preparation, tech internship behavioral questions, software engineering interview, leetcode practice, FAANG internship prep"
}

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "InterviewSense",
  "url": "https://www.interviewsense.org",
  "logo": "https://www.interviewsense.org/logo.webp",
  "sameAs": [
    "https://twitter.com/interviewsense"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "email": "support@interviewsense.org"
  }
}

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does InterviewSense help CS students prepare for internship interviews?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "InterviewSense provides AI-powered practice for both technical and behavioral aspects of CS internship interviews. Practice LeetCode-style coding problems, get feedback on behavioral responses, and receive resume analysis tailored for tech internships at companies like Google, Meta, Microsoft, and Amazon."
      }
    },
    {
      "@type": "Question", 
      "name": "Can I practice coding interviews for specific companies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Our platform includes company-specific coding challenges and behavioral questions used by top tech companies. Practice with real interview questions from Google, Meta, Amazon, Microsoft, and 10k+ other tech companies offering CS internships."
      }
    },
    {
      "@type": "Question",
      "name": "Is InterviewSense suitable for computer science students with no prior internship experience?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely! InterviewSense is designed for CS students at all levels. Whether you're a freshman seeking your first internship or a senior preparing for full-time roles, our AI adapts to your experience level and provides personalized feedback to help you succeed."
      }
    },
    {
      "@type": "Question",
      "name": "What plans does InterviewSense offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "InterviewSense offers flexible subscription plans starting at $25/month or $199/year. All plans include access to unlimited coding practice, behavioral interview prep, resume analysis, and AI feedback with a 3-day free trial."
      }
    }
  ]
}

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [showLoading, setShowLoading] = useState(true)
  const [loadingFadeOut, setLoadingFadeOut] = useState(false)
  const [heroStarted, setHeroStarted] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState<string | null>(null)

  useEffect(() => {
    let progress = 0
    const interval = setInterval(() => {
      // 15% faster - increased increments
      const increment = progress < 70 ? Math.random() * 2.76 + 0.92 : Math.random() * 4.6 + 1.84
      progress = Math.min(progress + increment, 100)
      setLoadingProgress(Math.round(progress))
      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          setLoadingFadeOut(true)
          setHeroStarted(true)
          setTimeout(() => {
            setShowLoading(false)
          }, 800)
        }, 400)
      }
    }, 54)
    return () => clearInterval(interval)
  }, [])
  

  // No longer automatically redirect authenticated users
  // This allows the homepage to be viewed by all users

  const handleGetStartedClick = () => {
    // The button will still navigate to the appropriate page based on authentication status
    if (status === 'authenticated') {
      router.push('/dashboard')
    } else {
      // Check if there's a creator code in the URL (works for both client-side and server-side)
      let creatorCode = null
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search)
        creatorCode = searchParams.get('code')
      }

      if (creatorCode) {
        router.push(`/signup?code=${creatorCode}`)
      } else {
        router.push('/signup')
      }
    }
  }

  const handleSubscribe = async (priceId: string | undefined, planName: string) => {
    // Check if user is logged in
    if (status !== 'authenticated') {
      // Save the plan they selected to redirect after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedPlan', planName)
        sessionStorage.setItem('selectedPriceId', priceId || '')
      }
      router.push('/signup')
      return
    }

    if (!priceId) {
      alert('Price ID not configured. Please set environment variables.')
      return
    }

    setSubscriptionLoading(planName)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      const data = await res.json()

      if (data.error) {
        alert(data.error)
        setSubscriptionLoading(null)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
      setSubscriptionLoading(null)
    }
  }

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (mobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  // Rotating text handled by RotatingText component (framer-motion based)

  // Testimonials data + carousel state
  const testimonials = [
    {
      quote: "The voice analysis helped me cut filler words and present answers clearly. I improved fast and got interviews at top companies.",
      name: "Rishabh U.",
      title: "CS Student, Penn State",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&q=80&auto=format&fit=crop&crop=faces"
    },
    {
      quote: "Behavioral practice and STAR coaching made my answers structured and confident. Recruiters noticed the difference.",
      name: "Rangesh K.",
      title: "Software Engineer, NVIDIA",
      avatar: "https://images.unsplash.com/photo-1545996124-9b5d1b0d7e9b?w=256&q=80&auto=format&fit=crop&crop=faces"
    },
    {
      quote: "Always-on mock interviews + instant feedback saved me time. I practiced whenever I had time and landed offers.",
      name: "Marcus L.",
      title: "Software Developer, Oracle",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=256&q=80&auto=format&fit=crop&crop=faces"
    }
  ]
  const [tIndex, setTIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTIndex(i => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* DeSo-style Loading Screen */}
      {showLoading && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000818] transition-opacity duration-700 ${
            loadingFadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <StarryBackground />
          {/* Center phrase + loading bar below it */}
          <div className="flex flex-col items-center gap-5 sm:gap-8 px-4 py-8 relative z-10">
            {/* Percentage right above text */}
            <span className="text-white text-sm font-sans tracking-[0.3em]">
              {loadingProgress}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white text-center leading-tight font-playfair">
              It&apos;s Time to Reimagine<br />
              the Way You Interview
            </h1>
            {/* Loading bar - positioned where gold accent line was */}
            <div className="w-[280px] sm:w-[340px] md:w-[400px] h-[3px] bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Meta tags to prevent redirect detection */}
      <meta name="robots" content="index,follow,noarchive" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <link rel="canonical" href="https://www.interviewsense.org" />
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      
      {/* Structured Data for SEO */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }} 
      />
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} 
      />
      
      <div className="flex flex-col min-h-screen text-white relative" style={{ background: '#000000' }}>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes wave1 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.5); }
        }

        @keyframes wave2 {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.6); }
        }

        .spin-circle {
          animation: spin 20s linear infinite;
        }

        .spin-circle-reverse {
          animation: spinReverse 15s linear infinite;
        }
      `}</style>

      {/* Grainient background that extends past hero into logos section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <Grainient
            color1="#000000"
            color2="#000000"
            color3="#3a3984"
            colorBalance={-0.34}
            timeSpeed={0.75}
            warpFrequency={1.4}
            warpStrength={1.0}
            warpSpeed={2.0}
            warpAmplitude={50.0}
            noiseScale={2.0}
            grainAmount={0.1}
            contrast={1.5}
            saturation={1.0}
          />
          {/* Fade to black at the bottom */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '35%',
            background: 'linear-gradient(to bottom, transparent, #000000)',
            pointerEvents: 'none',
          }} />
        </div>

      {/* Hero Section with Integrated Navigation */}
      <section className="flex flex-col relative" style={{ background: 'transparent', minHeight: '100vh' }}>
        {/* Navigation Bar */}
        <nav className="w-full z-50 relative" style={{ background: 'transparent', borderBottom: 'none' }}>
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3">
              <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={40} height={40} className="object-contain" />
              <span className="font-bold text-xl text-white hidden sm:block">InterviewSense</span>
            </Link>

            {/* Desktop Navigation and Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {status === 'authenticated' ? (
                <Button
                  asChild
                  size="lg"
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                >
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    onClick={handleGetStartedClick}
                    size="sm"
                    className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button - Made larger */}
            <div className="flex md:hidden items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-menu-button text-zinc-300 hover:text-white p-3 hover:bg-zinc-800/50 rounded-full focus:outline-none transition-all duration-300"
                aria-label="Toggle menu"
              >
                {!mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Drawer */}
          {mobileMenuOpen && (
            <div className="mobile-menu md:hidden">
              <div className="fixed inset-0 z-50"> 
                {/* Overlay */}
                <div className="absolute inset-0 bg-black opacity-80" onClick={() => setMobileMenuOpen(false)}></div>
                
                {/* Menu Container */}
                <div className="absolute inset-y-0 right-0 w-[80%] max-w-sm bg-zinc-950 shadow-xl">
                  <div className="flex flex-col h-full">
                    <div className="bg-zinc-950 px-6 py-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={50} height={50} className="object-contain" />
                        <span className="font-bold text-lg text-white hidden sm:block">InterviewSense</span>
                      </div>
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-zinc-300 p-2 hover:bg-zinc-800 rounded-full"
                        aria-label="Close menu"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto bg-zinc-950">
                    </div>
                    
                    <div className="p-6 bg-black">
                      <h3 className="text-sm uppercase text-zinc-500 font-medium mb-4">Account</h3>
                      {status === 'authenticated' ? (
                        <Button 
                          asChild 
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-500 text-white w-full font-bold py-8 text-lg rounded-lg shadow-lg"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>
                      ) : (
                        <div className="flex gap-3">
                          <Button
                            asChild
                            variant="ghost"
                            size="lg"
                            className="text-white hover:text-white hover:bg-zinc-800 flex-1 font-medium py-4 text-base rounded-lg"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Link href="/login">Login</Link>
                          </Button>
                          <Button
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleGetStartedClick();
                            }}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white flex-1 font-semibold py-4 text-base rounded-lg shadow-md"
                          >
                            Sign Up
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Content - Split Layout */}
        <div className="flex-1 flex items-center justify-center relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 py-12 lg:py-0" style={{ minHeight: 'calc(100vh - 80px)' }}>

          <div className="w-full max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-12 lg:gap-16 items-center">
            {/* LEFT COLUMN - Text + CTA */}
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="mb-10 w-full">
                <TypewriterHeadline
                  phrases={['behavioral interview', 'technical interview', 'resume screen', 'system design']}
                  typingSpeed={45}
                  highlightDuration={320}
                  holdDuration={1200}
                  started={heroStarted}
                />
              </div>

              {/* CTA Button */}
              <div className="flex flex-col items-center lg:items-start gap-2">
                <button
                  onClick={handleGetStartedClick}
                  className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5"
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    fontWeight: 500,
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    fontFamily: 'Syne, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3b82f6'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Start Practicing Free
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginLeft: '4px' }}>
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className="text-xs text-zinc-500" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No credit card required · 3-day free trial</p>
              </div>

              {/* Mobile Video - Shows below button on mobile */}
              <div className="lg:hidden mt-10 w-full max-w-2xl mx-auto" style={{
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#111318',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
              }}>
                {/* Top Bar */}
                <div style={{
                  background: '#1a1d24',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  {/* Left - Dots */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }}></div>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }}></div>
                  </div>
                  {/* Center - URL */}
                  <div style={{
                    background: '#1e2027',
                    borderRadius: '20px',
                    padding: '4px 14px',
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>
                    ● interviewsense.org
                  </div>
                  {/* Right - Live Demo */}
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Live Demo</div>
                </div>

                {/* Video Content */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  background: '#0d0f14'
                }}>
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      display: 'block'
                    }}
                    src="https://player.vimeo.com/video/1098880047?share=copy&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&background=1&autopause=0&dnt=1&playsinline=1"
                    title="InterviewSense Demo"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Browser Mockup - Desktop Only */}
            <div className="hidden lg:block" style={{
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#111318',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
            }}>
              {/* Top Bar */}
              <div style={{
                background: '#1a1d24',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* Left - Dots */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }}></div>
                </div>
                {/* Center - URL */}
                <div style={{
                  background: '#1e2027',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  ● interviewsense.org
                </div>
                {/* Right - Live Demo */}
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Live Demo</div>
              </div>

              {/* Video Content */}
              <div style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                background: '#0d0f14'
              }}>
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                  src="https://player.vimeo.com/video/1098880047?share=copy&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&background=1&autopause=0&dnt=1&playsinline=1"
                  title="InterviewSense Demo"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section id="company-logos" className="py-12 relative z-[1]" style={{ background: 'transparent' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-base sm:text-lg text-zinc-300 font-medium tracking-wide">InterviewSense users have landed offers at</p>
          </div>
          
          {/* Sliding logos container */}
          <div className="relative overflow-hidden">
            <div className="flex animate-slide-left space-x-16">
              {/* First set of logos */}
              <div className="flex items-center space-x-16 flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png" 
                    alt="Meta" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png" 
                    alt="Apple" 
                    className="h-10 w-auto max-w-[120px] object-contain filter brightness-0 invert"
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png" 
                    alt="Amazon" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(60%) sepia(100%) saturate(1000%) hue-rotate(15deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png" 
                    alt="Netflix" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(15%) sepia(100%) saturate(7500%) hue-rotate(350deg) brightness(1) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png" 
                    alt="Google" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/2560px-Nvidia_logo.svg.png" 
                    alt="NVIDIA" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(50%) sepia(100%) saturate(1000%) hue-rotate(80deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2560px-Microsoft_logo.svg.png" 
                    alt="Microsoft" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/2560px-SAP_2011_logo.svg.png" 
                    alt="SAP" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png" 
                    alt="Oracle" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(15%) sepia(100%) saturate(7500%) hue-rotate(350deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png" 
                    alt="IBM" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
              </div>
              
              {/* Duplicate set for seamless loop */}
              <div className="flex items-center space-x-16 flex-shrink-0">
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/2560px-Meta_Platforms_Inc._logo.svg.png" 
                    alt="Meta" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png" 
                    alt="Apple" 
                    className="h-10 w-auto max-w-[120px] object-contain filter brightness-0 invert"
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2020/04/Amazon-Logo.png" 
                    alt="Amazon" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(60%) sepia(100%) saturate(1000%) hue-rotate(15deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png" 
                    alt="Netflix" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(15%) sepia(100%) saturate(7500%) hue-rotate(350deg) brightness(1) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2020/09/Google-Logo.png" 
                    alt="Google" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/2560px-Nvidia_logo.svg.png" 
                    alt="NVIDIA" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(50%) sepia(100%) saturate(1000%) hue-rotate(80deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2560px-Microsoft_logo.svg.png" 
                    alt="Microsoft" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/2560px-SAP_2011_logo.svg.png" 
                    alt="SAP" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png" 
                    alt="Oracle" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(15%) sepia(100%) saturate(7500%) hue-rotate(350deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
                <div className="flex items-center justify-center h-16 w-32 opacity-60 hover:opacity-100 transition-opacity">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/2560px-IBM_logo.svg.png" 
                    alt="IBM" 
                    className="h-10 w-auto max-w-[120px] object-contain"
                    style={{filter: 'brightness(0) saturate(100%) invert(30%) sepia(100%) saturate(2000%) hue-rotate(200deg) brightness(1.2) contrast(1)'}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>{/* end Grainient wrapper */}

      {/* 1. Product — show what they get immediately */}
      <PreparationSection />

      {/* 2. Social proof — build trust right after product showcase */}
      {/* Testimonials Section - Scrollable Carousel */}
      <section className="py-20 lg:py-28 relative z-[1]" style={{ background: '#000000' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-[36px] sm:text-[42px] md:text-[48px] font-bold text-white mb-3 tracking-[-0.03em]" style={{ fontFamily: 'var(--font-sora), Inter, -apple-system, sans-serif' }}>What our users say</h2>
              <p className="text-base text-white/40">Real stories from engineers who landed their dream roles.</p>
            </div>

            {/* Carousel wrapper */}
            <div className="relative">
              {/* Scroll container */}
              <div
                id="testimonials-carousel"
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              >
                {/* Testimonial Card 1 - Meta Blue */}
                <div className="snap-start flex-shrink-0 w-full lg:w-[calc(50%-12px)] bg-[#0668E1] rounded-3xl p-10 lg:p-14 flex flex-col justify-between min-h-[480px]">
                  <p className="text-2xl lg:text-[28px] xl:text-3xl font-normal text-white leading-relaxed mb-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    &quot;InterviewSense&apos;s behavioral module was a game-changer. I drilled STAR responses until they felt natural.&quot;
                  </p>
                  <div className="text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <span className="font-semibold text-base">Marcus Chen</span>
                    <span className="mx-2">&middot;</span>
                    <span className="opacity-90">SWE Intern, Meta</span>
                  </div>
                </div>

                {/* Testimonial Card 2 - Stripe Purple */}
                <div className="snap-start flex-shrink-0 w-full lg:w-[calc(50%-12px)] bg-[#635BFF] rounded-3xl p-10 lg:p-14 flex flex-col justify-between min-h-[480px]">
                  <p className="text-2xl lg:text-[28px] xl:text-3xl font-normal text-white leading-relaxed mb-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    &quot;The resume tool caught so much stuff I missed. Fixed my bullet points in like an hour and started hearing back from companies the next week. Wish I found this earlier.&quot;
                  </p>
                  <div className="text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <span className="font-semibold text-base">Priya Raghavan</span>
                    <span className="mx-2">&middot;</span>
                    <span className="opacity-90">SWE Intern, Stripe</span>
                  </div>
                </div>

                {/* Testimonial Card 3 - Databricks Red */}
                <div className="snap-start flex-shrink-0 w-full lg:w-[calc(50%-12px)] bg-[#FF3621] rounded-3xl p-10 lg:p-14 flex flex-col justify-between min-h-[480px]">
                  <p className="text-2xl lg:text-[28px] xl:text-3xl font-normal text-white leading-relaxed mb-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    &quot;I was grinding leetcode for months but kept failing onsites because I couldn't explain my thought process. The voice analysis stuff actually helped me slow down and communicate better. Got into Databricks.&quot;
                  </p>
                  <div className="text-white text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <span className="font-semibold text-base">Jordan Williams</span>
                    <span className="mx-2">&middot;</span>
                    <span className="opacity-90">SWE Intern, Databricks</span>
                  </div>
                </div>

                {/* Testimonial Card 4 - Amazon Orange */}
                <div className="snap-start flex-shrink-0 w-full lg:w-[calc(50%-12px)] bg-[#FF9900] rounded-3xl p-10 lg:p-14 flex flex-col justify-between min-h-[480px]">
                  <p className="text-2xl lg:text-[28px] xl:text-3xl font-normal text-black leading-relaxed mb-12" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    &quot;Used this for like 3 weeks before my Amazon loop. The mock behavioral rounds were super helpful, felt way less nervous going in. Got the offer.&quot;
                  </p>
                  <div className="text-black text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <span className="font-semibold text-base">Sofia Gutierrez</span>
                    <span className="mx-2">&middot;</span>
                    <span className="opacity-80">SWE Intern, Amazon</span>
                  </div>
                </div>
              </div>

              {/* Navigation arrows */}
              <button
                onClick={() => {
                  const el = document.getElementById('testimonials-carousel')
                  if (el) el.scrollBy({ left: -(el.clientWidth / 2 + 12), behavior: 'smooth' })
                }}
                className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 rounded-full items-center justify-center text-white transition-colors z-10 backdrop-blur-sm border border-zinc-700/50"
                aria-label="Previous testimonials"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('testimonials-carousel')
                  if (el) el.scrollBy({ left: el.clientWidth / 2 + 12, behavior: 'smooth' })
                }}
                className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 rounded-full items-center justify-center text-white transition-colors z-10 backdrop-blur-sm border border-zinc-700/50"
                aria-label="Next testimonials"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {/* Scroll indicator dots */}
              <div className="flex justify-center gap-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Differentiation — show why you're better than alternatives */}
      {/* Comparison Table Section */}
      <section className="py-20 lg:py-28 relative z-[1]" style={{ background: '#000000' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-[36px] sm:text-[42px] md:text-[48px] font-bold text-white mb-3 tracking-[-0.03em]" style={{ fontFamily: 'var(--font-sora), Inter, -apple-system, sans-serif' }}>How we compare</h2>
              <p className="text-base text-white/40">See what sets us apart from traditional prep platforms.</p>
            </div>

            <div className="bg-zinc-950/30 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr>
                      <th className="text-left py-5 px-6 text-zinc-400 font-medium text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Feature</th>
                      <th className="text-center py-5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={24} height={24} className="object-contain" />
                          <span className="text-white font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>InterviewSense</span>
                        </div>
                      </th>
                      <th className="text-center py-5 px-6 text-zinc-400 font-medium text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>LeetCode</th>
                      <th className="text-center py-5 px-6 text-zinc-400 font-medium text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pramp</th>
                      <th className="text-center py-5 px-6 text-zinc-400 font-medium text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AlgoExpert</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 px-6 text-zinc-300 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Real-time Voice Analysis</td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-0.5 bg-yellow-500/10 rounded-full text-yellow-400 text-xs font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Partial</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 text-zinc-300 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Behavioral Interview Practice</td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 text-zinc-300 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>LeetCode-style Problems</td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-0.5 bg-yellow-500/10 rounded-full text-yellow-400 text-xs font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Partial</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 text-zinc-300 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Resume Analysis</td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 text-zinc-300 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI-Powered Feedback</td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-0.5 bg-yellow-500/10 rounded-full text-yellow-400 text-xs font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Partial</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-0.5 bg-yellow-500/10 rounded-full text-yellow-400 text-xs font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Partial</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 text-zinc-300 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cost</td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-semibold text-blue-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$25/mo</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm text-zinc-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$35/mo</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-semibold text-green-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Free</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm text-zinc-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$99/yr</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Value reinforcement — summarize why before final CTA */}
      <WhySection />

      {/*CTA Section */}
      <section id="cta" className="py-20 md:py-24 relative overflow-hidden z-[1]" style={{ background: '#000000' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl text-zinc-300 mb-8 md:mb-10 max-w-2xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Join 10,000+ developers who've already landed their dream jobs.
              <span className="text-blue-400 font-semibold"> Start practicing in under 30 seconds.</span>
            </p>

            {/* Social proof stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-10 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <CountUpOnView end={10000} duration={1500} className="inline-block" />
                </div>
                <div className="text-sm text-zinc-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <CountUpOnView end={89} duration={1200} className="inline-block" />%
                </div>
                <div className="text-sm text-zinc-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <CountUpOnView end={5} duration={1000} className="inline-block" />/5
                </div>
                <div className="text-sm text-zinc-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>User Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <RevealOnView className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStartedClick}
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Start Practicing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-4 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Link href="/login">Already have an account? Sign In</Link>
              </Button>
            </RevealOnView>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 lg:py-20 relative z-[1]" style={{ background: '#000000' }}>
        <div className="container mx-auto px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
              Practice Smart, Interview Better.
            </h2>

            {/* Email Subscription Form */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-6 py-4 bg-zinc-900 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors">
                  Join Email List
                </button>
              </div>
              <p className="text-zinc-500 text-xs mt-3 text-left">
                Be the first to experience new features, limited to 500 early access users.
              </p>
            </div>

            {/* Checkbox */}
            <div className="max-w-md mx-auto mb-3">
              <label className="flex items-start gap-3 text-left cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded bg-zinc-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  defaultChecked
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                  I agree to receive InterviewSense updates and offers by email.
                </span>
              </label>
            </div>

            <p className="text-zinc-600 text-xs max-w-md mx-auto mb-12">
              Unsubscribe anytime. We don&apos;t sell or share your info.
            </p>
          </div>

          {/* Footer Links and Copyright */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6 text-sm">
            <Link href="/contact" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Feedback
            </Link>
          </div>

          <div className="text-center text-zinc-600 text-sm">
            © {new Date().getFullYear()} InterviewSense. Interview practice that works.
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
