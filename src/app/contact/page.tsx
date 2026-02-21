"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, AlertCircle, Star } from "lucide-react"
import Image from 'next/image'
import { toast } from "@/components/ui/use-toast"
import StarryBackground from '@/components/StarryBackground'

export default function FeedbackPage() {
  const [name, setName] = useState("")
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please select a rating")
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
          name,
          rating,
          message: feedback,
          inquiryType: 'feedback',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      toast({
        title: "Feedback Sent!",
        description: "Thank you for your feedback. We appreciate it!",
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
        description: "There was a problem sending your feedback. Please try again.",
      });
    }
  }

  const resetForm = () => {
    setName("")
    setRating(0)
    setFeedback("")
    setIsSubmitted(false)
    setError("")
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#000818] text-white relative">
      <StarryBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#000818]/80">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Share Your Feedback</h1>
              <p className="text-zinc-400 text-lg">
                Help us improve InterviewSense. Your feedback matters!
              </p>
            </div>

            {isSubmitted ? (
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="text-center pt-10">
                  <div className="mx-auto mb-6 bg-blue-500/10 p-4 rounded-full">
                    <Mail className="h-12 w-12 text-blue-500" />
                  </div>
                  <CardTitle className="text-2xl text-white">Thank You!</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Your feedback has been received. We appreciate you taking the time to help us improve!
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-10">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8">
                      <Link href="/">
                        Return to Homepage
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
                      onClick={resetForm}
                    >
                      Submit More Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-zinc-900/50 border-zinc-800/50 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">We'd Love to Hear From You</CardTitle>
                  <CardDescription className="text-zinc-400">
                    Rate your experience and let us know what you think.
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
                    {/* Rating */}
                    <div className="space-y-3">
                      <Label className="text-zinc-300 text-lg">How would you rate your experience?</Label>
                      <div className="flex gap-2 justify-center py-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-10 w-10 ${
                                star <= (hoveredRating || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-zinc-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-center text-sm text-zinc-400">
                          {rating === 1 && "We're sorry to hear that. Please let us know how we can improve."}
                          {rating === 2 && "Thanks for your feedback. We'll work on improving."}
                          {rating === 3 && "Good to know. Help us make it better!"}
                          {rating === 4 && "Great! What can we do to make it perfect?"}
                          {rating === 5 && "Awesome! We're glad you love it!"}
                        </p>
                      )}
                    </div>

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

                    {/* Feedback */}
                    <div className="space-y-2">
                      <Label htmlFor="feedback" className="text-zinc-300">
                        Your Feedback
                      </Label>
                      <Textarea
                        id="feedback"
                        placeholder="Tell us what you think..."
                        rows={6}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                        className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 min-h-[150px]"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-6 mt-4 text-lg font-semibold"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Submit Feedback"}
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
