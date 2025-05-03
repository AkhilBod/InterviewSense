"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ChevronLeft, Mail, ArrowRight} from "lucide-react"
import { FcGoogle } from "react-icons/fc" // Correct the import for Google icon
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FaMicrosoft } from 'react-icons/fa'
export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"email" | "google" | "microsoft">("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // In a real app, we would handle authentication here
    setTimeout(() => {
      setIsLoading(false)
      // For now, just redirect to start page
      window.location.href = "/start"
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
        </div>
      </header>

      <div className="flex-1 py-12 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container px-4 max-w-md relative z-10">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 mb-8 text-zinc-300 hover:text-white hover:bg-zinc-800/70 rounded-full"
          >
            <Link href="/">
              <ChevronLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>

          <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="space-y-2 pt-8">
              <CardTitle className="text-2xl text-center text-white">Welcome back</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Log in to your InterviewSense account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6">
              <RadioGroup
                value={loginMethod}
                onValueChange={(value) => setLoginMethod(value as "email" | "google" | "microsoft")}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="email" id="email" className="peer sr-only" />
                  <Label
                    htmlFor="email"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-4 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-colors"
                  >
                    <Mail className="mb-2 h-6 w-6 text-blue-500" />
                    <span className="text-sm text-zinc-300">Email</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="google" id="google" className="peer sr-only" />
                  <Label
                    htmlFor="google"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-4 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-colors"
                  >
                    <FcGoogle className="mb-2 h-6 w-6" />
                    <span className="text-sm text-zinc-300">Google</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="microsoft" id="microsoft" className="peer sr-only" />
                  <Label
                    htmlFor="microsoft"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-800/70 p-4 hover:bg-zinc-800 hover:border-zinc-600 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer transition-colors"
                  >
                    <FaMicrosoft className="mb-2 h-6 w-6 text-blue-500" />
                    <span className="text-sm text-zinc-300">Microsoft</span>
                  </Label>
                </div>
              </RadioGroup>

              {loginMethod === "email" ? (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email-input" className="text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="email-input"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-zinc-300">
                        Password
                      </Label>
                      <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-zinc-800/70 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6 mt-2"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              ) : (
                <div className="space-y-5">
                  <p className="text-sm text-zinc-400 text-center">
                    Log in with your {loginMethod === "google" ? "Google" : "Microsoft"} account to sync your interview progress
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full py-6"
                    onClick={() => setIsLoading(true)}
                    disabled={isLoading}
                  >
                    {loginMethod === "google" ? (
                      <FcGoogle className="h-5 w-5" />
                    ) : (
                      <FaMicrosoft className="mb-2 h-6 w-6 text-blue-500" />
                    )}
                    {isLoading ? "Connecting..." : `Continue with ${loginMethod === "google" ? "Google" : "Microsoft"}`}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col pb-8 px-6">
              <div className="text-sm text-zinc-400 text-center mt-4">
                Don't have an account?{" "}
                <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
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
