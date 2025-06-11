"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, LogOut, MessageSquare, ChevronLeft, Mail, Building2, Phone, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react"
import Image from 'next/image'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

export default function ContactPage() {
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [company, setCompany] = useState("")
  const [inquiryType, setInquiryType] = useState("enterprise")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          company,
          inquiryType,
          message,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit contact form');
      }

      // Show success toast
      toast({
        title: "Message Sent!",
        description: "We've received your inquiry and will respond shortly.",
      });
      
      setIsSubmitting(false)
      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
      
      // Show error toast
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
    setCompany("")
    setInquiryType("enterprise")
    setMessage("")
    setIsSubmitted(false)
    setError("")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
            <Link href="/" className="font-bold text-xl">
              InterviewSense
            </Link>
          </div>
          <nav className="flex items-center gap-4">
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
                <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700" align="end">
                  <DropdownMenuLabel className="text-zinc-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem asChild className="text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer">
                    <Link href="/">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-zinc-800 hover:text-red-300 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild className="text-zinc-300 border-zinc-700 hover:bg-zinc-800">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <div className="flex-1 py-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
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
                    <p className="text-zinc-400">akhil@interviewsense.org</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {isSubmitted ? (
                <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="text-center pt-10">
                    <div className="mx-auto mb-6 bg-blue-500/10 p-4 rounded-full">
                      <Mail className="h-12 w-12 text-blue-500" />
                    </div>
                    <CardTitle className="text-2xl text-white">Thank You!</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Your message has been received. Our team will review your inquiry and get back to you shortly.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-10">
                    <div className="mb-8 p-4 bg-zinc-700/20 rounded-lg border border-zinc-700/30">
                      <p className="text-zinc-300 mb-1">We typically respond within 24 hours</p>
                      <p className="text-zinc-400 text-sm">Please check your email at <span className="text-blue-400">{email}</span> for our response</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8">
                        <Link href="/">
                          Return to Homepage
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full"
                        onClick={resetForm}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white">Contact Us</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Fill out the form below and we'll get back to you as soon as possible. 
                      Your information is sent directly via email and is not stored in our database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}
                    
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
