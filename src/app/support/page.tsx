"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, HelpCircle, Book, MessageSquare, Mail, FileQuestion, ArrowLeft, User } from "lucide-react"
import Image from 'next/image'
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SupportPage() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
            <span className="font-bold text-xl">InterviewSense</span>
          </div>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                    <AvatarFallback className="bg-blue-500">
                      {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800" align="end">
                <DropdownMenuLabel className="text-slate-400">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem asChild className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-slate-800 hover:text-red-300 cursor-pointer"
                  onClick={handleSignOut}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild className="text-slate-300 border-slate-700 hover:bg-slate-800">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Header Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex p-3 rounded-full bg-blue-500/10 mb-4">
              <HelpCircle className="h-6 w-6 text-blue-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">How Can We Help You?</h1>
            <p className="text-lg text-zinc-400 mb-8">
              Find answers to common questions or reach out to our support team for assistance.
            </p>

            {/* Search Box (can be implemented with functionality later) */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded-md text-sm">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help Categories */}
      <section className="py-12 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Getting Started */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-blue-500/50 transition-all">
              <CardHeader className="pb-2">
                <div className="mb-2 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Book className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription className="text-zinc-400">New to InterviewSense?</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="#account-setup" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Setting up your account
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#first-interview" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Your first mock interview
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#dashboard-overview" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Dashboard overview
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Technical Issues */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-blue-500/50 transition-all">
              <CardHeader className="pb-2">
                <div className="mb-2 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Image src="/logo.webp" alt="InterviewSense" width={24} height={24} className="object-contain" />
                </div>
                <CardTitle>Technical Issues</CardTitle>
                <CardDescription className="text-zinc-400">Facing problems?</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="#microphone-setup" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Microphone not working
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#interview-audio" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Interview audio issues
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#browser-compatibility" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Browser compatibility
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card className="bg-zinc-800/50 border-zinc-700/50 hover:border-blue-500/50 transition-all">
              <CardHeader className="pb-2">
                <div className="mb-2 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription className="text-zinc-400">Need direct assistance?</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href="/contact" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Contact form
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="mailto:akhil@interviewsense.org" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Email support
                    </a>
                  </li>
                  <li>
                    <Link 
                      href="#response-times" 
                      className="text-sm text-zinc-300 hover:text-blue-400 flex items-center"
                    >
                      <ChevronRight className="h-4 w-4 mr-2 text-blue-500" />
                      Support response times
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started Guide */}
      <section id="account-setup" className="py-12 md:py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Setting Up Your Account</h2>
            <div className="space-y-6 text-zinc-300">
              <p>Creating and setting up your InterviewSense account is quick and straightforward. Follow these steps to get started:</p>
              <ol className="list-decimal pl-5 space-y-4">
                <li><strong>Sign up</strong> - Visit our homepage and click "Get Started Free" or "Sign Up". You can register with your email or use social sign-in options.</li>
                <li><strong>Verify your email</strong> - Check your inbox for a verification email and click the confirmation link.</li>
                <li><strong>Complete your profile</strong> - Add your professional information including industry, experience level, and target roles.</li>
                <li><strong>Personalize your settings</strong> - Adjust notification preferences and configure your account dashboard.</li>
              </ol>
              <p>Once your account is set up, you'll have full access to all InterviewSense features, including mock interviews, resume analysis, and technical assessments.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="first-interview" className="py-12 md:py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Your First Mock Interview</h2>
            <div className="space-y-6 text-zinc-300">
              <p>Preparing for your first mock interview with InterviewSense is simple:</p>
              <ol className="list-decimal pl-5 space-y-4">
                <li><strong>Choose an interview type</strong> - Select from behavioral, technical, or traditional interview formats based on your needs.</li>
                <li><strong>Select a job role</strong> - Specify the position you're applying for to receive tailored questions.</li>
                <li><strong>Test your microphone</strong> - Ensure your device's microphone is working properly for voice analysis.</li>
                <li><strong>Begin the interview</strong> - Start answering questions either by speaking or typing your responses.</li>
                <li><strong>Review feedback</strong> - After completing the interview, review detailed feedback on your performance.</li>
              </ol>
              <p>For best results, find a quiet environment, use headphones if possible, and treat the mock interview like a real one.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard-overview" className="py-12 md:py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Dashboard Overview</h2>
            <div className="space-y-6 text-zinc-300">
              <p>Your InterviewSense dashboard provides a comprehensive overview of your interview preparation journey:</p>
              <ul className="list-disc pl-5 space-y-4">
                <li><strong>Progress tracker</strong> - See how many interviews you've completed and your improvement over time.</li>
                <li><strong>Recent activities</strong> - Quick access to your most recent mock interviews and resume reviews.</li>
                <li><strong>Recommended practice</strong> - Personalized suggestions for interview topics to focus on.</li>
                <li><strong>Skill analysis</strong> - Visual representation of your strengths and areas for improvement.</li>
                <li><strong>History section</strong> - Access all past interviews with their feedback and recommendations.</li>
              </ul>
              <p>The dashboard is fully customizable - you can rearrange widgets and focus on the metrics most important to your job search.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Issues Sections */}
      <section id="microphone-setup" className="py-12 md:py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Microphone Not Working</h2>
            <div className="space-y-6 text-zinc-300">
              <p>If you're experiencing issues with your microphone during interview sessions, try these troubleshooting steps:</p>
              <ol className="list-decimal pl-5 space-y-4">
                <li><strong>Check browser permissions</strong> - Make sure you've granted microphone access to InterviewSense in your browser settings.</li>
                <li><strong>Verify device selection</strong> - Ensure the correct microphone is selected in your device settings and browser.</li>
                <li><strong>Test in another application</strong> - Confirm your microphone works in other applications like Zoom or Google Meet.</li>
                <li><strong>Restart your browser</strong> - Sometimes closing and reopening your browser can resolve permission issues.</li>
                <li><strong>Try a different browser</strong> - If problems persist, try using Chrome, Firefox, or Edge as alternatives.</li>
              </ol>
              <p>If you continue to experience issues after trying these steps, please contact our support team for assistance.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="interview-audio" className="py-12 md:py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Interview Audio Issues</h2>
            <div className="space-y-6 text-zinc-300">
              <p>If you're experiencing audio issues during your interview sessions, here are some common solutions:</p>
              <ul className="list-disc pl-5 space-y-4">
                <li><strong>Echo or feedback</strong> - Use headphones to prevent your microphone from picking up sound from your speakers.</li>
                <li><strong>Background noise</strong> - Find a quiet environment and consider using a headset with noise cancellation.</li>
                <li><strong>Choppy audio</strong> - Check your internet connection stability and close any bandwidth-intensive applications.</li>
                <li><strong>Low volume</strong> - Adjust your microphone input level in your device's sound settings.</li>
              </ul>
              <p>For optimal performance, we recommend using a headset with a dedicated microphone rather than your device's built-in microphone.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="browser-compatibility" className="py-12 md:py-16 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Browser Compatibility</h2>
            <div className="space-y-6 text-zinc-300">
              <p>InterviewSense works best with the following browsers:</p>
              <ul className="list-disc pl-5 space-y-4">
                <li><strong>Google Chrome</strong> (Recommended) - Version 90 or later</li>
                <li><strong>Mozilla Firefox</strong> - Version 88 or later</li>
                <li><strong>Microsoft Edge</strong> - Version 90 or later</li>
                <li><strong>Safari</strong> - Version 14 or later</li>
              </ul>
              <p>For the best experience, we recommend using the latest version of Google Chrome, as it provides optimal compatibility with our voice analysis features.</p>
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 mt-6">
                <p className="font-medium">Note: Internet Explorer is not supported. If you're using Internet Explorer, please switch to one of the supported browsers listed above.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="response-times" className="py-12 md:py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">Support Response Times</h2>
            <div className="space-y-6 text-zinc-300">
              <p>Our support team is committed to providing timely assistance:</p>
              <ul className="list-disc pl-5 space-y-4">
                <li><strong>Email support</strong> - We aim to respond to all email inquiries within 24 hours during business days.</li>
                <li><strong>Contact form</strong> - Submissions through our contact form receive responses within 1-2 business days.</li>
                <li><strong>Critical issues</strong> - For urgent technical problems affecting your ability to use the platform, we prioritize responses within 12 hours.</li>
              </ul>
              <p>Our support hours are Monday through Friday, 9:00 AM to 5:00 PM Eastern Time. While we do monitor support channels outside these hours, response times may be longer during weekends and holidays.</p>
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20 mt-6">
                <p className="font-medium">For fastest resolution, please include the following in your support request:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Your account email</li>
                  <li>Browser and device information</li>
                  <li>Clear description of the issue</li>
                  <li>Screenshots if applicable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-20 bg-zinc-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.1),transparent_70%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex p-3 rounded-full bg-blue-500/10 mb-4">
                <FileQuestion className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-zinc-400">Find answers to the most common questions about InterviewSense.</p>
            </div>

            <div className="space-y-6">
              {/* FAQ Item 1 */}
              <Card className="bg-zinc-800/50 border-zinc-700/50">
                <CardContent className="pt-6">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="mr-2 text-blue-500">Q.</span>
                      How does voice analysis work?
                    </h3>
                  </div>
                  <p className="text-zinc-400 pl-6">
                    Our AI analyzes your speech patterns, pacing, filler words, and clarity. It processes your responses in real-time, providing feedback on delivery, confidence, and articulation. All audio is processed on-device and never stored.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ Item 2 */}
              <Card className="bg-zinc-800/50 border-zinc-700/50">
                <CardContent className="pt-6">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="mr-2 text-blue-500">Q.</span>
                      Can I access my previous interview feedback?
                    </h3>
                  </div>
                  <p className="text-zinc-400 pl-6">
                    Yes, all your interview sessions and feedback are saved to your profile. You can access them anytime from the dashboard under "History" to track your progress and improvements over time.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ Item 3 */}
              <Card className="bg-zinc-800/50 border-zinc-700/50">
                <CardContent className="pt-6">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="mr-2 text-blue-500">Q.</span>
                      How do I prepare for technical interview questions?
                    </h3>
                  </div>
                  <p className="text-zinc-400 pl-6">
                    InterviewSense offers specialized technical interview preparation. Navigate to the "Technical Assessment" section from your dashboard, select your tech stack or programming language, and choose from various difficulty levels to practice coding problems similar to those used in technical interviews.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ Item 4 */}
              <Card className="bg-zinc-800/50 border-zinc-700/50">
                <CardContent className="pt-6">
                  <div className="mb-2">
                    <h3 className="text-lg font-semibold flex items-center">
                      <span className="mr-2 text-blue-500">Q.</span>
                      Is my data private and secure?
                    </h3>
                  </div>
                  <p className="text-zinc-400 pl-6">
                    Absolutely. We take your privacy seriously. Voice inputs are processed in real-time and not stored. Your interview answers and feedback are securely stored with end-to-end encryption and are only accessible to you. You can delete your data at any time from your account settings.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <h3 className="text-lg font-medium mb-4">Still have questions?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white">
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button asChild variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                  <a href="mailto:akhil@interviewsense.org">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}