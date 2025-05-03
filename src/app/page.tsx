"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, UserCog, RotateCcw, Quote, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
// Optional: if using next-auth or similar
import { getSession } from "next-auth/react"
export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession() // or your custom auth check
      setIsAuthenticated(!!session)
    }
    checkAuth()
  }, [])

  const handleGetStartedClick = () => {
    router.push(isAuthenticated ? "/start" : "/signup")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-xl">InterviewSense</span>
          </div>
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
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800/70">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white">
            <button
                onClick={handleGetStartedClick}
                className="text-lg px-5 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center"
              >
                Get Started Free
            </button>

            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className = " min-h-screen flex items-center py-20 md:py-28 bg-gradient-to-b from-slate-900 to-slate-800 ">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter mb-6">
              Ace Your Next Interview with <span className="text-blue-500">AI-Powered</span> Practice
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-10">
              InterviewSense uses advanced AI to give you realistic mock interviews with personalized feedback, helping
              you prepare for any job interview.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full"
              >
                <button
                  onClick={handleGetStartedClick}
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center"
                >
                  Start Practicing Now <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-full"
              >
                <Link href="/#how-it-works">Learn How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our AI-powered platform provides everything you need to prepare for your next interview.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-800 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-8">
                <div className="bg-blue-500/10 rounded-2xl p-4 mb-6 flex items-center justify-center w-16 h-16 group-hover:bg-blue-500/20 transition-colors">
                  <Mic className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-blue-400 font-medium text-sm mb-2">Real Time Voice Analysis</h3>
                <h4 className="text-2xl font-bold text-white mb-4">Say it. See it. Sharpen it.</h4>
                <p className="text-zinc-400">
                  Our AI listens just like a real coach — it picks up on every 'um', pause, and rushed sentence. Using
                  advanced voice analysis, it helps you sound more clear, confident, and in control — every time you
                  speak.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-800 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-8">
                <div className="bg-blue-500/10 rounded-2xl p-4 mb-6 flex items-center justify-center w-16 h-16 group-hover:bg-blue-500/20 transition-colors">
                  <UserCog className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-blue-400 font-medium text-sm mb-2">Personalized Training</h3>
                <h4 className="text-2xl font-bold text-white mb-4">Training that knows you</h4>
                <p className="text-zinc-400">
                  Every answer you give is matched against thousands of real-world successful interview responses. Our
                  AI understands what top candidates say — and how they say it — for feedback tailored to your unique
                  style.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:bg-zinc-800 transition-all duration-300 overflow-hidden group">
              <CardContent className="p-8">
                <div className="bg-blue-500/10 rounded-2xl p-4 mb-6 flex items-center justify-center w-16 h-16 group-hover:bg-blue-500/20 transition-colors">
                  <RotateCcw className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-blue-400 font-medium text-sm mb-2">Dynamic Adaptation</h3>
                <h4 className="text-2xl font-bold text-white mb-4">Adapts as you speak</h4>
                <p className="text-zinc-400">
                  Every answer you give helps shape the next question. If the AI notices you're struggling with a
                  certain topic, it shifts gears and asks follow-up questions to help you improve right then and there.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Get started in minutes and transform your interview skills.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((num, i) => {
              const steps = [
                { title: "Select Job Role", text: "Choose the specific position and company you're interviewing for." },
                { title: "Answer Questions", text: "Respond to AI-generated questions either by speaking or typing." },
                { title: "Get Feedback", text: "Receive detailed analysis on the strength of your answers." },
                { title: "Improve", text: "Use the insights to strengthen your responses for the real interview." },
              ]
              const step = steps[i]
              return (
                <div key={num} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xl font-bold mb-6 border border-blue-500/30">
                    {num}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-zinc-400">{step.text}</p>
                </div>
              )
            })}
          </div>
          <div className="text-center mt-16">
          <button
            onClick={handleGetStartedClick}
            className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full"
          >
            Start Your First Mock Interview
          </button>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Users Say</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Hear from professionals who have transformed their interview performance with InterviewSense.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:shadow-blue-500/5 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <Quote className="h-10 w-10 text-blue-500/40 mb-6" />
                <p className="text-zinc-300 mb-8 text-lg">
                  InterviewSense helped me identify my verbal tics and filler words. After just a week of practice, I
                  felt so much more confident in my technical interview and landed my dream job at a top tech company.
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-white">Ethan Gray</p>
                    <p className="text-sm text-zinc-400">Software Engineer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:shadow-blue-500/5 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <Quote className="h-10 w-10 text-blue-500/40 mb-6" />
                <p className="text-zinc-300 mb-8 text-lg">
                  The real-time feedback was a game-changer. I could see exactly where I needed to improve, and the AI
                  asked follow-up questions just like a real interviewer would. Worth every penny!
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-white">Akhil B</p>
                    <p className="text-sm text-zinc-400">Software Engineer Intern</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:shadow-blue-500/5 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <Quote className="h-10 w-10 text-blue-500/40 mb-6" />
                <p className="text-zinc-300 mb-8 text-lg">
                  As someone who gets nervous in interviews, this tool was invaluable. I practiced with InterviewSense
                  for two weeks before my interview series, and it helped me stay calm and articulate under pressure.
                </p>
                <div className="flex items-center"> 
                  <div>
                    <p className="font-medium text-white">Justin Li</p>
                    <p className="text-sm text-zinc-400">Full Stack Intern</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>ƒ

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-zinc-400">If you can't find what you're looking for, email our support team.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
              {/* FAQ Item 1 */}
              <div className="group">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
                  <ChevronRight className="h-5 w-5 text-blue-500 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  How does InterviewSense work?
                </h3>
                <p className="text-zinc-400">
                  InterviewSense uses advanced AI to simulate realistic interview scenarios. You select the job role
                  you're interviewing for, and our system generates relevant questions. You can respond by speaking or
                  typing, and our AI analyzes your answers in real-time, providing feedback on content, delivery, and
                  confidence.
                </p>
              </div>

              {/* FAQ Item 2 */}
              <div className="group">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
                  <ChevronRight className="h-5 w-5 text-blue-500 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Are AI suggestions always accurate?
                </h3>
                <p className="text-zinc-400">
                  We use advanced Large Language Models from top AI research companies. While these models are
                  constantly improving, they may not always interpret every situation perfectly, so always trust your
                  own judgment. Interview Copilot is here to keep you on track, but it's not a replacement for your own
                  knowledge.
                </p>
              </div>

              {/* FAQ Item 3 */}
              <div className="group">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
                  <ChevronRight className="h-5 w-5 text-blue-500 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Is my data secure with InterviewSense?
                </h3>
                <p className="text-zinc-400">
                  Absolutely. We use end-to-end encryption and make every effort to minimize the amount of data we
                  collect. We do not record any audio or video; audio is processed in real-time by a speech-to-text
                  service and then immediately discarded. For more information, please refer to our Privacy Policy.
                </p>
              </div>

              {/* FAQ Item 4 */}
              <div className="group">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
                  <ChevronRight className="h-5 w-5 text-blue-500 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Can interviewers detect if I'm using InterviewSense?
                </h3>
                <p className="text-zinc-400">
                  No, our system doesn't join the meeting or notify anyone. It simply monitors the conversation quietly
                  in the background. To keep your delivery natural, avoid reading AI suggestions word for word. Instead,
                  use them as a guide to craft responses in your own voice.
                </p>
              </div>

              {/* FAQ Item 5 */}
              <div className="group">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
                  <ChevronRight className="h-5 w-5 text-blue-500 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Why use InterviewSense if I'm well-prepared?
                </h3>
                <p className="text-zinc-400">
                  Interviewers often ask questions designed to throw you off, diving into areas you haven't revisited in
                  months. Even the most prepared candidates can struggle to recall key details in these moments.
                  InterviewSense helps you navigate these hurdles with real-time suggestions, keeping you sharp and
                  focused.
                </p>
              </div>

              {/* FAQ Item 6 */}
              <div className="group">
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
                  <ChevronRight className="h-5 w-5 text-blue-500 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Can I cancel my subscription at any time?
                </h3>
                <p className="text-zinc-400">
                  Yes, you can cancel anytime through Manage Subscription on the Account page in the app, and you'll
                  retain full access until the end of your billing period.
                </p>
              </div>
            </div>

            <div className="text-center mt-16">
              <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-12 max-w-5xl mx-auto backdrop-blur-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to ace your next interview?</h2>
                <p className="text-zinc-400 mb-0">
                  Join thousands of professionals who have transformed their interview skills with InterviewSense.
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 whitespace-nowrap"
              >
                <button
                  onClick={handleGetStartedClick}
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center"
                >
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-800 mt-auto bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <span className="font-bold text-white">InterviewSense</span>
              </div>
              <p className="text-zinc-400 text-sm">AI-powered interview practice to help you land your dream job.</p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-zinc-400 hover:text-blue-400 text-sm">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Interview Guides
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-zinc-400 hover:text-blue-400 text-sm">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-zinc-400 hover:text-blue-400 text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-zinc-400 hover:text-blue-400 text-sm">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-zinc-500">© {new Date().getFullYear()} InterviewSense. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-zinc-400 hover:text-blue-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-blue-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-blue-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802c-2.506 0-2.836.011-3.844.057-.984.045-1.517.209-1.88.347-.466.182-.799.398-1.15.748-.35.35-.566.683-.748 1.15-.137.362-.302.895-.347 1.88-.047 1.008-.058 1.338-.058 3.844s.011 2.836.058 3.844c.045.984.21 1.517.347 1.88.182.466.399.799.748 1.15.35.35.683.566 1.15.748.363.137.896.302 1.88.347 1.008.047 1.338.058 3.844.058s2.836-.011 3.844-.058c.984-.045 1.517-.21 1.88-.347.466-.182.799-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.363.302-.896.347-1.88.047-1.008.058-1.338.058-3.844s-.011-2.836-.058-3.844c-.045-.984-.21-1.517-.347-1.88a3.097 3.097 0 00-.748-1.15 3.097 3.097 0 00-1.15-.748c-.363-.137-.896-.302-1.88-.347-1.008-.047-1.338-.058-3.844-.058z"
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
