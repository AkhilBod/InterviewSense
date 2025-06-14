"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, FileText, Brain } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, UserCog, RotateCcw, Quote, ChevronRight, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
// Optional: if using next-auth or similar
import { getSession } from "next-auth/react"
import { useSession } from "next-auth/react"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentText, setCurrentText] = useState('resume')
  const [isDeleting, setIsDeleting] = useState(false)
  const [charIndex, setCharIndex] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)

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

  // Typewriter effect for rotating text
  useEffect(() => {
    const words = ['resume', 'behavioral', 'technical']
    const typingSpeed = 100
    const erasingSpeed = 30
    const delayBetweenWords = 1500

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (charIndex < words[wordIndex].length) {
          setCurrentText(words[wordIndex].substring(0, charIndex + 1))
          setCharIndex(charIndex + 1)
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), delayBetweenWords)
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setCurrentText(words[wordIndex].substring(0, charIndex - 1))
          setCharIndex(charIndex - 1)
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false)
          setWordIndex((wordIndex + 1) % words.length)
        }
      }
    }, isDeleting ? erasingSpeed : typingSpeed)

    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, wordIndex])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={48} height={48} className="object-contain" />
            <span className="font-bold text-xl">InterviewSense</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-zinc-300 hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="/#features" className="text-sm font-medium text-zinc-300 hover:text-blue-400 transition-colors">
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-zinc-300 hover:text-blue-400 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm font-medium text-zinc-300 hover:text-blue-400 transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {status === 'authenticated' ? (
              <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="text-zinc-300 border-zinc-600 hover:text-white hover:bg-zinc-800/70">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button 
                  onClick={handleGetStartedClick} 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25"
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-button text-zinc-300 p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {!mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <div className="absolute inset-y-0 right-0 w-[80%] max-w-sm bg-black border-l border-zinc-800 shadow-xl">
                <div className="flex flex-col h-full">
                  <div className="bg-black px-6 py-4 flex justify-between items-center border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
                      <span className="font-bold text-lg text-white">InterviewSense</span>
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
                  
                  <div className="flex-1 overflow-y-auto bg-black">
                    <nav className="flex flex-col py-6 px-6">
                      <Link 
                        href="/" 
                        className="text-lg font-medium text-white py-3 px-4 hover:bg-zinc-800 rounded-lg flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-2 text-blue-500">•</span>
                        Home
                      </Link>
                      <Link 
                        href="/#features" 
                        className="text-lg font-medium text-white py-3 px-4 hover:bg-zinc-800 rounded-lg flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-2 text-blue-500">•</span>
                        Features
                      </Link>
                      <Link
                        href="/#how-it-works"
                        className="text-lg font-medium text-white py-3 px-4 hover:bg-zinc-800 rounded-lg flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-2 text-blue-500">•</span>
                        How It Works
                      </Link>
                      <Link
                        href="/#testimonials"
                        className="text-lg font-medium text-white py-3 px-4 hover:bg-zinc-800 rounded-lg flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-2 text-blue-500">•</span>
                        Testimonials
                      </Link>
                      <Link
                        href="/#faq"
                        className="text-lg font-medium text-white py-3 px-4 hover:bg-zinc-800 rounded-lg flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-2 text-blue-500">•</span>
                        FAQ
                      </Link>
                      <Link
                        href="/contact"
                        className="text-lg font-medium text-white py-3 px-4 hover:bg-zinc-800 rounded-lg flex items-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="mr-2 text-blue-500">•</span>
                        Contact
                      </Link>
                    </nav>
                  </div>
                  
                  <div className="p-6 border-t border-zinc-800 bg-black">
                    <h3 className="text-sm uppercase text-zinc-500 font-medium mb-3">Account</h3>
                    {status === 'authenticated' ? (
                      <Button 
                        asChild 
                        className="bg-blue-600 hover:bg-blue-500 text-white w-full font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link href="/dashboard">Go to Dashboard</Link>
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          asChild 
                          variant="outline" 
                          className="text-white border-zinc-600 hover:text-white hover:bg-zinc-800 w-full font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link href="/login">Log in</Link>
                        </Button>
                        <Button 
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleGetStartedClick();
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white w-full font-medium shadow-lg shadow-blue-500/20"
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
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 lg:min-h-screen flex items-center bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter mb-4 md:mb-6">
                Improve your <span className="text-blue-500">{currentText}</span><span className="animate-pulse">|</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto lg:mx-0 mb-6 sm:mb-10 px-2">
                Practice interview → Instant AI feedback and personalized coaching.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start">
                <Button
                  onClick={handleGetStartedClick}
                  size="lg"
                  className="text-lg sm:text-xl px-8 sm:px-10 py-6 sm:py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25"
                >
                  Start Practicing Now <ArrowRight className="ml-2 h-5 sm:h-6 w-5 sm:w-6" />
                </Button>
              </div>
              
              {/* Trust indicators - Hidden on mobile to reduce clutter */}
              <div className="hidden sm:flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-6 text-sm text-zinc-500">
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
                  <span>Join hundreds of developers</span>
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
                
                {/* Vimeo Video Embed */}
                <div className="aspect-video bg-gradient-to-br from-zinc-950 to-zinc-900 relative overflow-hidden rounded-lg group">
                  <iframe
                    className="w-full h-full"
                    src="https://player.vimeo.com/video/1090649164?h=28acac635f&autoplay=1&loop=1&muted=1&controls=0&title=0&byline=0&portrait=0&background=1&autopause=0&dnt=1&playsinline=1"
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
      </section>

      {/* Company Logos Section */}
      <section className="py-12 bg-zinc-950 border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm text-zinc-400 font-medium">Questions specified for 5000+ companies</p>
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
      <section id="features" className="py-16 md:py-24 bg-zinc-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">Powerful Features</h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto px-2">
              Our AI-powered platform provides everything you need to prepare for your next interview.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {/* Real Time Voice Analysis (original, kept) */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-800 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-6 md:p-8">
                <div className="bg-blue-500/10 rounded-2xl p-3 md:p-4 mb-4 md:mb-6 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 group-hover:bg-blue-500/20 transition-colors">
                  <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
                <h3 className="text-blue-400 font-medium text-sm mb-1 md:mb-2">Real Time Voice Analysis</h3>
                <h4 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Say it. See it. Sharpen it.</h4>
                <p className="text-sm md:text-base text-zinc-400">
                  Our AI listens just like a real coach — it picks up on every 'um', pause, and rushed sentence. Using
                  advanced voice analysis, it helps you sound more clear, confident, and in control — every time you
                  speak.
                </p>
              </CardContent>
            </Card>

            {/* LeetCode Practice Feature */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-800 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-6 md:p-8">
                <div className="bg-blue-500/10 rounded-2xl p-3 md:p-4 mb-4 md:mb-6 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 group-hover:bg-blue-500/20 transition-colors">
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
                <h3 className="text-blue-400 font-medium text-sm mb-1 md:mb-2">LeetCode-Style Coding Practice</h3>
                <h4 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Problems that Level You Up</h4>
                <p className="text-sm md:text-base text-zinc-400">
                  Practice with real LeetCode questions by number or topic. Get instant feedback on your code, see worked examples, and improve your problem-solving skills for technical interviews.
                </p>
              </CardContent>
            </Card>

            {/* Resume Review Feature */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-800 transition-all duration-300 overflow-hidden group sm:col-span-2 md:col-span-1">
              <CardContent className="p-6 md:p-8">
                <div className="bg-blue-500/10 rounded-2xl p-3 md:p-4 mb-4 md:mb-6 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 group-hover:bg-blue-500/20 transition-colors">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
                <h3 className="text-blue-400 font-medium text-sm mb-1 md:mb-2">AI Resume Review</h3>
                <h4 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Feedback that Gets You Hired</h4>
                <p className="text-sm md:text-base text-zinc-400">
                  Upload your resume and get instant, detailed feedback. Our AI analyzes your resume for strengths, areas for improvement, ATS compatibility, and keyword match for your target job. Download a full report and get actionable suggestions to boost your chances.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table Section */}
      <section className="py-16 md:py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">Why Choose InterviewSense?</h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              See how InterviewSense compares to traditional interview preparation methods.
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">What Our Users Say</h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto px-2">
              Hear from professionals who have transformed their interview performance with InterviewSense.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Testimonial 1 */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:shadow-blue-500/5 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 md:p-8">
                <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500/40 mb-4 md:mb-6" />
                <p className="text-zinc-300 mb-6 md:mb-8 text-base sm:text-lg">
                  "The voice analysis really helped me catch how many 'ums' I was using. After practicing for 2 weeks, I felt way more confident and landed 3 offers!"
                </p>
                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="https://sportslogohistory.com/wp-content/uploads/2021/08/penn_state_nittany_lions_1996-Pres.png" 
                        alt="Penn State" 
                        className="max-h-8 max-w-8 object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="font-medium text-white">Rishabh U.</p>
                      <p className="text-xs sm:text-sm text-zinc-400">CS Student at Penn State</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:shadow-blue-500/5 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 md:p-8">
                <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500/40 mb-4 md:mb-6" />
                <p className="text-zinc-300 mb-6 md:mb-8 text-base sm:text-lg">
                  "Behavioral questions used to stress me out. This app taught me the STAR method and my answers became way more structured. Really helpful for practice!"
                </p>
                <div className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/2560px-Nvidia_logo.svg.png" 
                        alt="NVIDIA" 
                        className="max-h-8 max-w-8 object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="font-medium text-white">Rangesh K.</p>
                      <p className="text-xs sm:text-sm text-zinc-400">Software Engineer at NVIDIA</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:shadow-blue-500/5 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 md:p-8">
                <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500/40 mb-4 md:mb-6" />
                <p className="text-zinc-300 mb-6 md:mb-8 text-base sm:text-lg">
                  "As a career changer, I needed all the practice I could get. Being able to do mock interviews anytime was super convenient. The instant feedback helped a lot."
                </p>
                <div className="flex items-center"> 
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
                      <img 
                        src="https://brandlogos.net/wp-content/uploads/2021/10/oracle-logo-symbol-vector.png" 
                        alt="Oracle" 
                        className="max-h-8 max-w-8 object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="font-medium text-white">Marcus L.</p>
                      <p className="text-xs sm:text-sm text-zinc-400">Software Developer at Oracle</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Login Conversion Section - Hidden on mobile to reduce clutter */}
      <section className="hidden sm:block py-16 md:py-24 bg-zinc-950 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-300 font-medium">Join hundreds of developers already practicing</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            
            <p className="text-lg md:text-xl text-zinc-300 mb-8 md:mb-10 max-w-2xl mx-auto">
              Join thousands of developers who've already landed their dream jobs. 
              <span className="text-blue-400 font-semibold"> Start practicing in under 30 seconds.</span>
            </p>

            {/* Social proof stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-10 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">100+</div>
                <div className="text-sm text-zinc-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">89%</div>
                <div className="text-sm text-zinc-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">4.9/5</div>
                <div className="text-sm text-zinc-400">User Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
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
            </div>

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

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">Frequently Asked Questions</h2>
              <p className="text-base text-zinc-400">If you can't find what you're looking for, email our support team.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 md:gap-y-12">
              {/* FAQ Item 1 */}
              <div className="group p-4 sm:p-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4 text-white flex items-center">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span>How does InterviewSense work?</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 ml-6">
                  InterviewSense uses advanced AI to simulate realistic interview scenarios. You select the job role
                  you're interviewing for, and our system generates relevant questions. You can respond by speaking or
                  typing, and our AI analyzes your answers in real-time.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="group p-4 sm:p-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4 text-white flex items-center">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Are AI suggestions always accurate?</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 ml-6">
                  We use advanced Language Models from top AI research companies. While these models are
                  constantly improving, they may not always interpret every situation perfectly, so always trust your
                  own judgment as well.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="group p-4 sm:p-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4 text-white flex items-center">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Is my data secure with InterviewSense?</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 ml-6">
                  Absolutely. We use end-to-end encryption and make every effort to minimize the amount of data we
                  collect. We do not record any audio or video; audio is processed in real-time by a speech-to-text
                  service and then immediately discarded.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="group p-4 sm:p-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4 text-white flex items-center">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Can interviewers detect if I'm using InterviewSense?</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 ml-6">
                  No, our system is designed for practice sessions only. Use what you learn during practice to improve your skills for real interviews.
                </p>
              </div>

              {/* FAQ Item 5 */}
              <div className="group p-4 sm:p-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4 text-white flex items-center">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Why use InterviewSense if I'm well-prepared?</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 ml-6">
                  Interviewers often ask questions designed to challenge you. Even the most prepared candidates can struggle to recall key details in these moments.
                  InterviewSense helps you practice handling unexpected questions.
                </p>
              </div>

              {/* FAQ Item 6 */}
              <div className="group p-4 sm:p-0">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-4 text-white flex items-center">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mr-2 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Can I cancel my subscription at any time?</span>
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 ml-6">
                  We have no plan of making this paid, unless we can no longer support it.
                </p>
              </div>
            </div>

            <div className="text-center mt-10 md:mt-16">
              <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 sm:px-8 py-2 sm:py-3">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Hidden on mobile to reduce clutter */}
      <section className="hidden sm:block py-12 sm:py-16 md:py-20 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-5xl mx-auto backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Ready to ace your next interview?</h2>
                <p className="text-sm sm:text-base text-zinc-400 mb-0">
                  Join thousands of professionals who have transformed their interview skills with InterviewSense.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 sm:px-8 whitespace-nowrap w-full md:w-auto"
              >
                <button
                  onClick={handleGetStartedClick}
                  className="text-sm sm:text-base px-6 py-4 sm:py-5 md:py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center"
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </Button>
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
  )
}
