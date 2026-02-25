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
import TypewriterHeadline from '@/components/TypewriterHeadline'
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
          setTimeout(() => {
            setShowLoading(false)
            // Start hero typewriter only after loading screen is fully gone
            setHeroStarted(true)
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
      
      <div className="flex flex-col min-h-screen text-white relative" style={{ background: '#0a0e1a' }}>

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

      {/* Hero Section with Integrated Navigation */}
      <section className="flex flex-col relative" style={{ background: '#080d1a', minHeight: '100vh' }}>
        <Aurora color1="000000" color2="0044ff" color3="0d4baf" blend={1} speed={1.2} />
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
                  phrases={['behavioral interviews', 'technical interviews', 'resume review']}
                  typingSpeed={45}
                  highlightDuration={1000}
                  holdDuration={2000}
                  fadeDuration={600}
                  started={heroStarted}
                />
              </div>

              {/* CTA Button */}
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
                Start Practicing
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginLeft: '4px' }}>
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

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
      <section id="company-logos" className="py-12 relative z-[1]" style={{ background: '#0a0e1a' }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm text-zinc-400 font-medium">Practice with interview questions from top tech companies offering CS internships</p>
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

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 relative z-[1]" style={{ background: '#0a0e1a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16 lg:mb-20">
              <h2 className="text-[36px] sm:text-[42px] md:text-[48px] font-bold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Four ways we help you ace interviews</h2>
              <p className="text-[17px] leading-[150%] text-zinc-400 max-w-[640px] mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Everything you need to prepare for your dream role, powered by AI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature Card 1 */}
              <div className="group bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-500 flex flex-col">
                <div className="aspect-[4/3] bg-zinc-900 rounded-xl mb-5 overflow-hidden relative flex items-center justify-center">
                  {/* Voice Analysis Mockup - Speaking Agent Waveform */}
                  <div className="w-full h-full p-6 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 h-20">
                      {/* Animated waveform bars */}
                      <div className="w-1 bg-blue-500 rounded-full" style={{ height: '30%', animation: 'wave1 0.8s ease-in-out infinite' }}></div>
                      <div className="w-1 bg-blue-500 rounded-full" style={{ height: '50%', animation: 'wave2 0.8s ease-in-out infinite 0.1s' }}></div>
                      <div className="w-1 bg-blue-500 rounded-full" style={{ height: '70%', animation: 'wave1 0.8s ease-in-out infinite 0.2s' }}></div>
                      <div className="w-1 bg-blue-400 rounded-full" style={{ height: '45%', animation: 'wave2 0.8s ease-in-out infinite 0.3s' }}></div>
                      <div className="w-1 bg-blue-400 rounded-full" style={{ height: '85%', animation: 'wave1 0.8s ease-in-out infinite 0.4s' }}></div>
                      <div className="w-1 bg-blue-500 rounded-full" style={{ height: '60%', animation: 'wave2 0.8s ease-in-out infinite 0.5s' }}></div>
                      <div className="w-1 bg-blue-400 rounded-full" style={{ height: '40%', animation: 'wave1 0.8s ease-in-out infinite 0.6s' }}></div>
                      <div className="w-1 bg-blue-500 rounded-full" style={{ height: '75%', animation: 'wave2 0.8s ease-in-out infinite 0.7s' }}></div>
                      <div className="w-1 bg-blue-400 rounded-full" style={{ height: '55%', animation: 'wave1 0.8s ease-in-out infinite 0.8s' }}></div>
                      <div className="w-1 bg-blue-500 rounded-full" style={{ height: '35%', animation: 'wave2 0.8s ease-in-out infinite 0.9s' }}></div>
                      <div className="w-1 bg-blue-400 rounded-full" style={{ height: '65%', animation: 'wave1 0.8s ease-in-out infinite 1s' }}></div>
                      <div className="w-1 bg-blue-500 rounded-full" style={{ height: '50%', animation: 'wave2 0.8s ease-in-out infinite 1.1s' }}></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Real-time Voice Analysis</h3>
                <p className="text-[14px] leading-[160%] text-zinc-400 flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Get instant feedback on pacing, filler words, and clarity during interviews.</p>
              </div>

              {/* Feature Card 2 */}
              <div className="group bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-500 flex flex-col">
                <div className="aspect-[4/3] bg-zinc-900 rounded-xl mb-5 overflow-hidden relative">
                  {/* Code Editor Mockup */}
                  <div className="w-full h-full p-3 font-mono text-[9px]">
                    <div className="flex items-center gap-1.5 mb-3 pb-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="text-[9px] text-zinc-500">two_sum.py</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex"><span className="text-zinc-600 w-4">1</span><span className="text-purple-400">def</span> <span className="text-yellow-400">twoSum</span><span className="text-zinc-400">(nums, target):</span></div>
                      <div className="flex"><span className="text-zinc-600 w-4">2</span><span className="text-zinc-400 pl-3">hashmap = {`{}`}</span></div>
                      <div className="flex"><span className="text-zinc-600 w-4">3</span><span className="text-purple-400 pl-3">for</span> <span className="text-zinc-400">i, num</span> <span className="text-purple-400">in</span> <span className="text-blue-400">enumerate</span><span className="text-zinc-400">(nums):</span></div>
                      <div className="flex"><span className="text-zinc-600 w-4">4</span><span className="text-zinc-400 pl-6">complement = target - num</span></div>
                      <div className="flex"><span className="text-zinc-600 w-4">5</span><span className="text-purple-400 pl-6">if</span> <span className="text-zinc-400">complement</span> <span className="text-purple-400">in</span> <span className="text-zinc-400">hashmap:</span></div>
                      <div className="flex"><span className="text-zinc-600 w-4">6</span><span className="text-purple-400 pl-9">return</span> <span className="text-zinc-400">[hashmap[complement], i]</span></div>
                      <div className="flex"><span className="text-zinc-600 w-4">7</span><span className="text-zinc-400 pl-6">hashmap[num] = i</span></div>
                    </div>
                    <div className="mt-3 pt-2">
                      <div className="text-[9px]"><span className="text-green-400">✓ All test cases passed</span></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>LeetCode-style Practice</h3>
                <p className="text-[14px] leading-[160%] text-zinc-400 flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Practice coding problems with hints, solutions, and complexity analysis.</p>
              </div>

              {/* Feature Card 3 */}
              <div className="group bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-500 flex flex-col">
                <div className="aspect-[4/3] bg-zinc-900 rounded-xl mb-5 overflow-hidden relative">
                  {/* STAR Method Mockup */}
                  <div className="w-full h-full p-4 flex flex-col">
                    <div className="text-[11px] font-semibold text-emerald-400 mb-3">STAR Framework</div>
                    <div className="space-y-2.5 flex-1">
                      <div className="bg-zinc-800/50 rounded-md p-2.5">
                        <div className="text-[10px] text-zinc-500 mb-1">Situation</div>
                        <div className="h-1.5 bg-emerald-500/30 rounded"></div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-md p-2.5">
                        <div className="text-[10px] text-zinc-500 mb-1">Task</div>
                        <div className="h-1.5 bg-emerald-500/30 rounded"></div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-md p-2.5">
                        <div className="text-[10px] text-zinc-500 mb-1">Action</div>
                        <div className="h-1.5 bg-emerald-500/50 rounded"></div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-md p-2.5">
                        <div className="text-[10px] text-zinc-500 mb-1">Result</div>
                        <div className="h-1.5 bg-zinc-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Behavioral Coaching</h3>
                <p className="text-[14px] leading-[160%] text-zinc-400 flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Master the STAR method with structured coaching and AI suggestions.</p>
              </div>

              {/* Feature Card 4 */}
              <div className="group bg-zinc-900/40 backdrop-blur-sm rounded-2xl p-6 hover:bg-zinc-900/60 transition-all duration-500 flex flex-col">
                <div className="aspect-[4/3] bg-white rounded-xl mb-5 overflow-hidden relative p-2">
                  {/* Resume Document Mockup - Zoomed Out */}
                  <div className="w-full h-full bg-white text-black text-[6px] space-y-1">
                    <div className="font-bold text-[8px]">JOHN DOE</div>
                    <div className="text-zinc-600 text-[5px]">john.doe@email.com • (555) 123-4567 • linkedin.com/in/johndoe</div>
                    <div className="h-px bg-zinc-300 my-0.5"></div>

                    <div className="font-semibold text-[7px] mb-0.5">EXPERIENCE</div>
                    <div className="relative mb-0.5">
                      <div className="bg-blue-100 px-0.5 py-0.5 rounded">
                        <div className="font-medium text-[6px]">Senior Developer</div>
                        <div className="text-[5px] text-zinc-600">Tech Corp • San Francisco, CA • 2021-2023</div>
                        <div className="text-[5px] mt-0.5 leading-tight space-y-0.5">
                          <div>• Led development of microservices architecture</div>
                          <div>• Reduced API response time by 40%</div>
                          <div>• Mentored 3 junior developers</div>
                        </div>
                      </div>
                      <div className="absolute -right-0.5 top-0 bg-blue-500 text-white px-0.5 rounded text-[5px]">
                        ✓ Strong
                      </div>
                    </div>

                    <div className="relative mb-0.5">
                      <div className="bg-yellow-50 px-0.5 py-0.5 rounded">
                        <div className="font-medium text-[6px]">Junior Developer</div>
                        <div className="text-[5px] text-zinc-600">StartupCo • Remote • 2019-2021</div>
                        <div className="text-[5px] mt-0.5 leading-tight">
                          <div>• Built web applications</div>
                        </div>
                      </div>
                      <div className="absolute -right-0.5 top-0 bg-yellow-500 text-white px-0.5 rounded text-[5px]">
                        ! Weak
                      </div>
                    </div>

                    <div className="font-semibold text-[7px] mt-1 mb-0.5">EDUCATION</div>
                    <div className="text-[5px]">
                      <div className="font-medium text-[6px]">BS Computer Science</div>
                      <div className="text-zinc-600">University of California • GPA: 3.8/4.0</div>
                    </div>

                    <div className="font-semibold text-[7px] mt-1 mb-0.5">SKILLS</div>
                    <div className="flex flex-wrap gap-0.5">
                      <span className="bg-zinc-200 px-1 py-0.5 rounded text-[5px]">React</span>
                      <span className="bg-zinc-200 px-1 py-0.5 rounded text-[5px]">Node.js</span>
                      <span className="bg-blue-100 px-1 py-0.5 rounded text-[5px]">Python</span>
                      <span className="bg-zinc-200 px-1 py-0.5 rounded text-[5px]">AWS</span>
                      <span className="bg-zinc-200 px-1 py-0.5 rounded text-[5px]">Docker</span>
                    </div>

                    <div className="font-semibold text-[7px] mt-1 mb-0.5">PROJECTS</div>
                    <div className="text-[5px] leading-tight space-y-0.5">
                      <div>
                        <span className="font-medium text-[6px]">E-commerce Platform</span>
                        <div className="text-zinc-600">Built full-stack application with 10k+ users</div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Resume & Feedback</h3>
                <p className="text-[14px] leading-[160%] text-zinc-400 flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Get automated resume scoring and detailed feedback to optimize your resume.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 relative z-[1]" style={{ background: '#0a0e1a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Testimonial Card 1 - Databricks Orange */}
              <div className="bg-[#FF6B35] rounded-3xl p-10 lg:p-12 flex flex-col justify-between min-h-[450px]">
                <p className="text-2xl lg:text-3xl font-normal text-black leading-relaxed mb-12">
                  "It’s amazing to have everything I need to practice in one place. It makes the whole experience smooth, convenient, and actually enjoyable.."
                </p>
                <div className="text-black text-sm">
                  <span className="font-medium">Alex R</span>
                  <span className="mx-1.5">·</span>
                  <span className="opacity-80">Intern, Databricks</span>
                </div>
              </div>

              {/* Testimonial Card 2 - Stripe Purple */}
              <div className="bg-[#635BFF] rounded-3xl p-10 lg:p-12 flex flex-col justify-between min-h-[400px]">
                <p className="text-2xl lg:text-3xl font-normal text-white leading-relaxed mb-12">
                  "I was getting zero interviews before. Now my total compensation is $220,000."
                </p>
                <div className="text-white text-sm">
                  <span className="font-medium">Amir K</span>
                  <span className="mx-1.5">·</span>
                  <span className="opacity-90">Product Manager, Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-28 relative z-[1]" style={{ background: '#0a0e1a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1000px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[42px] sm:text-[48px] font-bold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Choose Your Plan
              </h2>
              <p className="text-[17px] text-zinc-400">
                Start your 3-day free trial today. Cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Monthly Plan */}
              <div className="bg-zinc-900/50 border border-zinc-700 rounded-2xl p-8 hover:border-zinc-600 transition-all">
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Monthly</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$25</span>
                  <span className="text-zinc-400">/month</span>
                </div>

                <button
                  onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID, 'Monthly')}
                  disabled={subscriptionLoading === 'Monthly'}
                  className="w-full mb-6 bg-white text-black hover:bg-zinc-200 font-semibold py-4 text-lg rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {subscriptionLoading === 'Monthly' ? 'Loading...' : 'Try 3-day trial'}
                </button>

                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Access to all questions, problems, and quizzes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Interview video guides</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Advanced filtering and question playlists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>5% off all coaching services</span>
                  </li>
                </ul>
              </div>

              {/* Annual Plan */}
              <div className="bg-blue-600/10 border-2 border-blue-500 rounded-2xl p-8 relative hover:border-blue-400 transition-all shadow-lg">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-600 rounded-full text-sm font-semibold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Best Value
                </div>

                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Annual</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-5xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>$199</span>
                  <span className="text-zinc-400">/year</span>
                </div>
                <div className="text-green-400 text-sm font-semibold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Save 33%</div>

                <button
                  onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID, 'Annual')}
                  disabled={subscriptionLoading === 'Annual'}
                  className="w-full mb-6 bg-blue-600 text-white hover:bg-blue-500 font-semibold py-4 text-lg rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {subscriptionLoading === 'Annual' ? 'Loading...' : 'Try 3-day trial'}
                </button>

                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Access to all questions, problems, and quizzes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Interview video guides</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Advanced filtering and question playlists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>15% off all coaching services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Premium community with working professionals</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-20 lg:py-28 relative z-[1]" style={{ background: '#0a0e1a' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[36px] sm:text-[42px] md:text-[48px] font-bold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>How we compare</h2>
              <p className="text-[17px] leading-[150%] text-zinc-400 max-w-[640px] mx-auto">See what makes us different from traditional coding interview platforms.</p>
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

      {/*CTA Section */}
      <section id="cta" className="py-20 md:py-24 relative overflow-hidden z-[1]" style={{ background: '#0a0e1a' }}>
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
      <footer className="py-16 lg:py-20 relative z-[1]" style={{ background: '#0a0e1a' }}>
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
