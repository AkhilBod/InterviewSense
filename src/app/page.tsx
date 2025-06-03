"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, Brain, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, UserCog, RotateCcw, Quote, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
// Optional: if using next-auth or similar
import { getSession } from "next-auth/react"
import { useSession } from "next-auth/react"

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
      router.push('/signup')
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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
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
                <Button asChild variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/70">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button 
                  onClick={handleGetStartedClick} 
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Go to Dashbord
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
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-500" />
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
                Ace Your Next Interview with <span className="text-blue-500">AI-Powered</span> Practice
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto lg:mx-0 mb-6 sm:mb-10 px-2">
                InterviewSense uses advanced AI to give you realistic mock interviews with personalized feedback, helping
                you prepare for any job interview.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  onClick={handleGetStartedClick}
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center"
                >
                  Start Practicing Now <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-full mt-3 sm:mt-0"
                >
                  <Link href="/#how-it-works">Learn How It Works</Link>
                </Button>
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
                <div className="aspect-video bg-gradient-to-br from-zinc-950 to-zinc-900 relative overflow-hidden rounded-lg">
                  <iframe
                    className="w-full h-full"
                    src="https://player.vimeo.com/video/1090257351?background=1&playsinline=1&autopause=0&quality=auto&transparent=0"
                    title="InterviewSense Demo"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    loading="eager"
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
                      <Brain className="w-3 h-3 text-blue-400" />
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

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">How It Works</h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              Get started in minutes and transform your interview skills.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((num, i) => {
              const steps = [
                { title: "Select Job Role", text: "Choose the specific position you're interviewing for." },
                { title: "Answer Questions", text: "Respond to AI-generated questions by speaking or typing." },
                { title: "Get Feedback", text: "Receive detailed analysis on your answers." },
                { title: "Improve", text: "Use insights to strengthen your responses." },
              ]
              const step = steps[i]
              return (
                <div key={num} className="flex flex-col items-center text-center p-2 sm:p-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-lg sm:text-xl font-bold mb-4 sm:mb-6 border border-blue-500/30">
                    {num}
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3 text-white">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-400">{step.text}</p>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-10 md:mt-16">
          <Button
            onClick={handleGetStartedClick}
            size="lg"
            className="text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full"
          >
            Start Your First Mock Interview
          </Button>
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
                  InterviewSense helped me identify my verbal tics and filler words. After just a week of practice, I
                  felt so much more confident in my technical interview and landed my dream job at Google.
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-white">Larry P</p>
                    <p className="text-xs sm:text-sm text-zinc-400">Senior Software Engineer at Google</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:shadow-blue-500/5 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 md:p-8">
                <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500/40 mb-4 md:mb-6" />
                <p className="text-zinc-300 mb-6 md:mb-8 text-base sm:text-lg">
                  The real-time feedback was a game-changer. I could see exactly where I needed to improve, and the AI
                  asked follow-up questions just like a real interviewer would. This helped me secure my internship.
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-white">Bill G</p>
                    <p className="text-xs sm:text-sm text-zinc-400">Software Engineer Intern at Microsoft</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:shadow-blue-500/5 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 md:p-8">
                <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500/40 mb-4 md:mb-6" />
                <p className="text-zinc-300 mb-6 md:mb-8 text-base sm:text-lg">
                  As someone who gets nervous in interviews, this tool was invaluable. I practiced with InterviewSense
                  for two weeks before my interview series, and it helped me stay calm and articulate under pressure.
                </p>
                <div className="flex items-center"> 
                  <div>
                    <p className="font-medium text-white">Mark Z</p>
                    <p className="text-xs sm:text-sm text-zinc-400">Full Stack Developer at Meta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-zinc-900">
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
                <MessageSquare className="h-5 w-5 text-blue-500" />
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
