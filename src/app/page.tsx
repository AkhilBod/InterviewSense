"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, FileText, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, UserCog, RotateCcw, Quote, ChevronRight, CheckCircle2 } from "lucide-react"
import ScrollStack, { ScrollStackItem } from './ScrollStack'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import RotatingText from "./RotatingText"
import CountUpOnView from './CountUpOnView'
import RevealOnView from './RevealOnView'
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
    "price": "0",
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
      "name": "Do I need to pay for InterviewSense as a CS student?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No! InterviewSense is completely free for all students. Access unlimited coding practice, behavioral interview prep, resume analysis, and AI feedback without any cost or subscription fees."
      }
    }
  ]
}

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  

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
      {/* Meta tags to prevent redirect detection */}
      <meta name="robots" content="index,follow,noarchive" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <link rel="canonical" href="https://www.interviewsense.org" />
      
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
      
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">

      {/* Hero Section with Integrated Navigation */}
      <section className="py-4 md:py-8 lg:min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 relative">
        {/* Navigation Bar */}
        <nav className="w-full z-50 relative">
          <div className="container mx-auto px-4 py-2 flex justify-between items-center">
            {/* Logo Section - Made smaller and more compact */}
            <div className="flex items-center gap-4">
              <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={40} height={40} className="object-contain" />
              <span className="font-bold text-2xl text-white hidden sm:block">InterviewSense</span>
            </div>

            {/* Desktop Auth Buttons - Made bigger and more prominent */}
            <div className="hidden md:flex items-center gap-6">
              {status === 'authenticated' ? (
                <Button 
                  asChild 
                  size="lg"
                  className="px-5 py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="lg"
                    className="px-6 py-3 text-lg font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-full transition-all duration-300"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button 
                    onClick={handleGetStartedClick}
                    size="sm"
                    className="px-6 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Get Started Free
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
                <div className="absolute inset-y-0 right-0 w-[80%] max-w-sm bg-zinc-950 border-l border-zinc-800 shadow-xl">
                  <div className="flex flex-col h-full">
                    <div className="bg-zinc-950 px-6 py-4 flex justify-between items-center border-b border-zinc-800">
                      <div className="flex items-center gap-3">
                        <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
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
                    
                    <div className="p-6 border-t border-zinc-800 bg-black">
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
                        <div className="space-y-4">
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="lg"
                            className="text-white hover:text-white hover:bg-zinc-800 w-full font-medium py-4 text-lg rounded-full border border-zinc-700"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Link href="/login">Sign In</Link>
                          </Button>
                          <Button 
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleGetStartedClick();
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white w-full font-semibold py-3 text-sm rounded-lg shadow-md"
                          >
                            Get Started Free
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

        {/* Hero Content */}
        <div className="flex-1 flex items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter mb-4 md:mb-6">
                Ace your <span className="text-blue-500"><RotatingText
                  texts={['CS internships', 'coding interviews', 'tech roles']}
                  mainClassName="px-0 sm:px-0 md:px-0 bg-transparent text-blue-400 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                /></span>
              </h1>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start">
                <Button
                  onClick={handleGetStartedClick}
                  size="lg"
                  className="text-base px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center shadow-md font-semibold"
                >
                  Start Practicing Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              {/* Trust indicators - CS focused */}
              <div className="hidden sm:flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Free for all CS students</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>LeetCode practice included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>FAANG interview questions</span>
                </div>
              </div>
            </div>

            {/* Right side - Video */}
            <div className="relative lg:order-last">
              {/* Floating elements for visual appeal */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
              
              <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl overflow-hidden shadow-2xl border border-zinc-700/50 backdrop-blur-sm">
                {/* Enhanced browser-like header */}
                <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 px-4 py-4 flex items-center gap-3 border-b border-zinc-600/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="bg-zinc-600/50 backdrop-blur-sm rounded-lg px-4 py-2 text-xs text-zinc-300 inline-flex items-center gap-2 font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      interviewsense.org
                    </div>
                  </div>
                  <div className="text-zinc-400 text-xs">
                    Live Demo
                  </div>
                </div>
                
                {/* Vimeo Video Embed - Trigger build 2025-06-27 */}
                <div className="aspect-video bg-gradient-to-br from-zinc-950 to-zinc-900 relative overflow-hidden rounded-lg group">
                  <iframe
                    className="w-full h-full"
                    src="https://player.vimeo.com/video/1098880047?share=copy&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&background=1&autopause=0&dnt=1&playsinline=1"
                    title="InterviewSense Demo"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  
                  {/* Interactive badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Live Demo
                    </div>
                  </div>
                </div>
                
                {/* Bottom info bar */}
                <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 px-4 py-3 border-t border-zinc-600/50">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-2">
                      <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={16} height={16} className="object-contain" />
                      AI Analysis Active
                    </span>
                    <span>Real-time feedback enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section id="company-logos" className="py-12 bg-zinc-950 border-b border-zinc-800">
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

      

      {/* Comparison Table Section */}
      <section className="py-16 md:py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">Why CS Students Choose InterviewSense</h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              See how InterviewSense compares to traditional CS internship preparation methods.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Desktop Table */}
            <div className="hidden md:block bg-zinc-800/30 border border-zinc-700/50 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-700/50">
                    <th className="text-left p-6 text-white font-semibold">Feature</th>
                    <th className="text-center p-6 text-white font-semibold bg-blue-900/20">
                      <div className="flex items-center justify-center gap-2">
                        <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={24} height={24} className="object-contain" />
                        <span>InterviewSense</span>
                      </div>
                    </th>
                    <th className="text-center p-6 text-zinc-400 font-semibold">Traditional Methods</th>
                    <th className="text-center p-6 text-zinc-400 font-semibold">Mock Interviews</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-700/30">
                    <td className="p-6 text-zinc-300">Real-time Voice Analysis</td>
                    <td className="p-6 text-center bg-blue-900/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-700/30">
                    <td className="p-6 text-zinc-300">24/7 Availability</td>
                    <td className="p-6 text-center bg-blue-900/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-700/30">
                    <td className="p-6 text-zinc-300">Instant Detailed Feedback</td>
                    <td className="p-6 text-center bg-blue-900/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-700/30">
                    <td className="p-6 text-zinc-300">LeetCode Integration</td>
                    <td className="p-6 text-center bg-blue-900/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-700/30">
                    <td className="p-6 text-zinc-300">Resume Analysis</td>
                    <td className="p-6 text-center bg-blue-900/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-700/30">
                    <td className="p-6 text-zinc-300">Cost</td>
                    <td className="p-6 text-center bg-blue-900/10">
                      <span className="text-green-500 font-semibold">Free</span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-green-500 font-semibold">Free</span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-red-500 font-semibold">$50-200+</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-6 text-zinc-300">Progress Tracking</td>
                    <td className="p-6 text-center bg-blue-900/10">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </td>
                    <td className="p-6 text-center">
                      <svg className="h-5 w-5 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-6">
              <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={24} height={24} className="object-contain" />
                    InterviewSense
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Real-time Voice Analysis</span>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">24/7 Availability</span>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Instant Detailed Feedback</span>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">LeetCode Integration</span>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Resume Analysis</span>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Cost</span>
                      <span className="text-green-500 font-semibold">Free</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Progress Tracking</span>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-zinc-400">Traditional Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Real-time Voice Analysis</span>
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">24/7 Availability</span>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Instant Detailed Feedback</span>
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">LeetCode Integration</span>
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Resume Analysis</span>
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Cost</span>
                      <span className="text-green-500 font-semibold">Free</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Progress Tracking</span>
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/30 border-zinc-700/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-zinc-400">Mock Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Real-time Voice Analysis</span>
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">24/7 Availability</span>
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Instant Detailed Feedback</span>
                      <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">LeetCode Integration</span>
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Resume Analysis</span>
                      <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Cost</span>
                      <span className="text-red-500 font-semibold">$50-200+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300">Progress Tracking</span>
                      <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={handleGetStartedClick}
                size="lg"
                className="text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full"
              >
                Start Using InterviewSense Free <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Scroll Stack) */}
      <section id="features" className="bg-zinc-950 relative">
        <div className="absolute inset-0 z-0">
          <div className="text-center pt-8 pb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">Product Features</h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto px-4">Key features built for CS students preparing for internships.</p>
          </div>
        </div>

        <div className="relative z-10 h-[80vh]">
          <ScrollStack 
            stackPosition="10%" 
            scaleEndPosition="5%"
            itemDistance={300}
            itemStackDistance={15}
            baseScale={0.95}
            onStackComplete={() => {
              // Auto-scroll to CTA section after stack completion
              setTimeout(() => {
                const ctaSection = document.querySelector('#cta');
                if (ctaSection) {
                  ctaSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 500);
            }}
          >
              <ScrollStackItem itemClassName="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border-blue-500/30">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-3">Real-time Voice Analysis</h3>
                    <p className="text-blue-100 text-lg leading-relaxed">Get instant feedback on pacing, filler words, clarity, and confidence during mock interviews.</p>
                  </div>
                  <div className="mt-auto bg-blue-900/20 rounded-xl p-4 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-200 text-sm font-medium">Live audio processing active</span>
                    </div>
                    <div className="mt-2 h-2 bg-blue-800/30 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-purple-600/20 to-purple-800/10 border-purple-500/30">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-3">LeetCode-style Practice</h3>
                    <p className="text-purple-100 text-lg leading-relaxed">Practice coding problems tailored to CS internships with step-by-step hints and solutions.</p>
                  </div>
                  <div className="mt-auto bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-500/20 text-green-400 text-xs py-1 px-2 rounded font-medium text-center">Easy: 45</div>
                      <div className="bg-yellow-500/20 text-yellow-400 text-xs py-1 px-2 rounded font-medium text-center">Medium: 32</div>
                      <div className="bg-red-500/20 text-red-400 text-xs py-1 px-2 rounded font-medium text-center">Hard: 18</div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 border-emerald-500/30">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-3">Behavioral Coaching</h3>
                    <p className="text-emerald-100 text-lg leading-relaxed">Structured STAR-based coaching and AI suggestions to help you craft memorable answers.</p>
                  </div>
                  <div className="mt-auto bg-emerald-900/20 rounded-xl p-4 border border-emerald-500/20">
                    <div className="flex items-center justify-between text-emerald-200 text-sm">
                      <span className="font-medium">STAR Method Progress</span>
                      <span className="text-emerald-400">85%</span>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1">
                      <div className="h-1 bg-emerald-400 rounded"></div>
                      <div className="h-1 bg-emerald-400 rounded"></div>
                      <div className="h-1 bg-emerald-400 rounded"></div>
                      <div className="h-1 bg-emerald-600/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

              <ScrollStackItem itemClassName="bg-gradient-to-br from-amber-600/20 to-amber-800/10 border-amber-500/30">
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-3">Resume & Interview Feedback</h3>
                    <p className="text-amber-100 text-lg leading-relaxed">Automated resume scoring and interviewer-style feedback to prioritize improvements that matter.</p>
                  </div>
                  <div className="mt-auto bg-amber-900/20 rounded-xl p-4 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-amber-200 text-sm font-medium">Resume Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-400/20 rounded-full flex items-center justify-center">
                          <span className="text-amber-400 text-xs font-bold">92</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      <CheckCircle2 className="w-4 h-4 text-amber-600/50" />
                    </div>
                  </div>
                </div>
              </ScrollStackItem>

          </ScrollStack>
        </div>
      </section>

      {/* Login Conversion Section - Hidden on mobile to reduce clutter */}
      <section id="cta" className="hidden sm:block py-8 md:py-12 bg-zinc-950 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-300 font-medium">Join 10k+ developers already practicing</span>
            </div>
            
            <p className="text-lg md:text-xl text-zinc-300 mb-8 md:mb-10 max-w-2xl mx-auto">
              Join 10k+ developers who've already landed their dream jobs. 
              <span className="text-blue-400 font-semibold"> Start practicing in under 30 seconds.</span>
            </p>

            {/* Social proof stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-10 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  <CountUpOnView end={10000} duration={1500} className="inline-block" />
                </div>
                <div className="text-sm text-zinc-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  <CountUpOnView end={89} duration={1200} className="inline-block" />%
                </div>
                <div className="text-sm text-zinc-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  <CountUpOnView end={49} duration={1000} className="inline-block" />/5
                </div>
                <div className="text-sm text-zinc-400">User Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <RevealOnView className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Button
                onClick={handleGetStartedClick}
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
              >
                Start Free Practice <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-4 border-zinc-600 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-full"
              >
                <Link href="/login">Already have an account? Sign In</Link>
              </Button>
            </RevealOnView>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Start in 30 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-zinc-800 mt-auto bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={20} height={20} className="object-contain" />
                <span className="font-bold text-white">InterviewSense</span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm">AI-powered interview practice to help you land your dream job.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-zinc-400 hover:text-blue-400 text-xs sm:text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-zinc-400 hover:text-blue-400 text-xs sm:text-sm">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-zinc-400 hover:text-blue-400 text-xs sm:text-sm">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-zinc-400 hover:text-blue-400 text-xs sm:text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" className="text-zinc-400 hover:text-blue-400 text-xs sm:text-sm">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-zinc-400 hover:text-blue-400 text-xs sm:text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/support#faq" className="text-zinc-400 hover:text-blue-400 text-xs sm:text-sm">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs sm:text-sm text-zinc-500">© {new Date().getFullYear()} InterviewSense. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="#" className="text-zinc-400 hover:text-blue-400">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-blue-400">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-blue-400">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043.049 1.064.218 1.791.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802c-2.506 0-2.836.011-3.844.057-.984.045-1.517.209-1.88.347-.466.182-.799.398 -1.15.748-.35.35-.566.683-.748 1.15-.137.362-.302.895-.347 1.88-.047 1.008-.058 1.338-.058 3.844s.011 2.836.058 3.844c.045.984.21 1.517.347 1.88.182.466.399.799.748 1.15.35.35.683.566 1.15.748.363.137.896.302 1.88.347 1.008.047 1.338.058 3.844.058s2.836-.011 3.844-.058c.984-.045 1.517-.21 1.88-.347.466-.182.799-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.363.302-.896.347-1.88.047-1.008.058 -1.338.058 -3.844s-.011-2.836-.058-3.844c-.045-.984-.21-1.517-.347-1.88a3.097 3.097 0 00-.748-1.15 3.097 3.097 0 00-1.15-.748c-.363-.137-.896-.302-1.88-.347-1.008-.047-1.338-.058-3.844-.058z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
