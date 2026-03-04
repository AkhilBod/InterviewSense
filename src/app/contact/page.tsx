"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, AlertCircle } from "lucide-react"
import Image from 'next/image'
import { toast } from "@/components/ui/use-toast"
import StarryBackground from '@/components/StarryBackground'

export default function ContactSupportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [inquiryType, setInquiryType] = useState("support")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Auto-fill email and name if user is logged in
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  // If user is logged in and viewing from dashboard, show contact in drawer instead
  useEffect(() => {
    if (session && typeof window !== 'undefined') {
      const referrer = document.referrer
      if (referrer && referrer.includes('/dashboard')) {
        // User came from dashboard, they can stay here
      }
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          inquiryType,
          subject: subject.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit message');
      }

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon!",
      });

      setIsSubmitting(false)
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);

      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem sending your message. Please try again.",
      });
    }
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setSubject("")
    setMessage("")
    setInquiryType("support")
    setIsSubmitted(false)
    setError("")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#000818] text-white relative">
      <StarryBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#000818]/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2">
            <Image
              src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png"
              alt="InterviewSense"
              width={50}
              height={50}
              className="object-contain"
            />
            <span className="font-bold text-xl text-white">InterviewSense</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 pt-20 py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Contact Support</h1>
              <p className="text-zinc-400 text-lg">
                Need assistance? We're here to help you succeed.
              </p>
            </div>

            {isSubmitted ? (
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="text-center pt-10">
                  <div className="mx-auto mb-6 bg-blue-500/10 p-4 rounded-full">
                    <Mail className="h-12 w-12 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl text-white">Message Received!</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-10">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8">
                      <Link href={session ? "/dashboard" : "/"}>
                        {session ? "Back to Dashboard" : "Return to Homepage"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
                      onClick={resetForm}
                    >
                      Send Another Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Contact Support</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Need help? Have a question? We're here to assist you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-zinc-300">
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-zinc-300">
                        Your Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Inquiry Type */}
                    <div className="space-y-2">
                      <Label htmlFor="inquiryType" className="text-zinc-300">
                        How can we help?
                      </Label>
                      <select
                        id="inquiryType"
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800/70 border border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 rounded-md"
                      >
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing & Subscription</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Report a Bug</option>
                        <option value="account">Account Issues</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-zinc-300">
                        Subject <span className="text-zinc-500">(Optional)</span>
                      </Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your inquiry"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-zinc-300">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Please describe your issue or question in detail..."
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 min-h-[150px]"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-6 mt-4 text-lg font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending Message..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800/50 mt-auto bg-black relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center text-zinc-600 text-sm">
            © {new Date().getFullYear()} InterviewSense. Interview practice that works.
          </div>
        </div>
      </footer>
    </div>
  )
}
