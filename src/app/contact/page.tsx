"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ChevronLeft, Mail, Building2, Phone, CheckCircle2, ArrowRight } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [inquiryType, setInquiryType] = useState("enterprise")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-xl">InterviewSense</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-zinc-300 hover:text-white hover:bg-zinc-800/70">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 py-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full"
            >
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h1 className="text-3xl font-bold mb-4 text-white">Get in Touch</h1>
              <p className="text-zinc-400 mb-8">
                Have questions about InterviewSense or interested in our enterprise solutions? Fill out the form and our
                team will get back to you within 24 hours.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/10 rounded-2xl p-3 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Email Us</h3>
                    <p className="text-zinc-400">support@interviewsense.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/10 rounded-2xl p-3 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Call Us</h3>
                    <p className="text-zinc-400">+1 (747) 312-1646</p>
                    <p className="text-xs text-zinc-500">Monday - Friday, 9AM - 5PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {isSubmitted ? (
                <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="text-center pt-10">
                    <div className="mx-auto mb-6 bg-green-500/10 p-4 rounded-full">
                      <CheckCircle2 className="h-12 w-12 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl text-white">Message Sent!</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Thank you for reaching out. We've received your inquiry and will respond shortly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-10">
                    <p className="mb-8 text-zinc-400">A confirmation email has been sent to {email}</p>
                    <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8">
                      <Link href="/">
                        Return to Homepage
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white">Contact Us</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-zinc-300">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-zinc-300">
                          Company (Optional)
                        </Label>
                        <Input
                          id="company"
                          placeholder="Your Company"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-zinc-300">Inquiry Type</Label>
                        <RadioGroup
                          value={inquiryType}
                          onValueChange={setInquiryType}
                          className="grid grid-cols-2 gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="enterprise"
                              id="enterprise"
                              className="border-zinc-600 text-blue-500"
                            />
                            <Label htmlFor="enterprise" className="cursor-pointer text-zinc-300">
                              Enterprise Solution
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="support" id="support" className="border-zinc-600 text-blue-500" />
                            <Label htmlFor="support" className="cursor-pointer text-zinc-300">
                              Customer Support
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="partnership"
                              id="partnership"
                              className="border-zinc-600 text-blue-500"
                            />
                            <Label htmlFor="partnership" className="cursor-pointer text-zinc-300">
                              Partnership
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" className="border-zinc-600 text-blue-500" />
                            <Label htmlFor="other" className="cursor-pointer text-zinc-300">
                              Other
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-zinc-300">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          placeholder="How can we help you?"
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 min-h-[120px]"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6 mt-4"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800 mt-auto bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="font-bold text-white">InterviewSense</span>
            </div>
            <p className="text-sm text-zinc-500">© {new Date().getFullYear()} InterviewSense. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
