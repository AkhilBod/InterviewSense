"use client"

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Code2, 
  Database, 
  Server, 
  Network, 
  LogOut,
  User,
  Sparkles,
  Target,
  Zap,
  Cloud,
  Shield,
  Globe,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SystemDesignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    experienceLevel: '',
    testDifficulty: '',
    targetCompany: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!formData.experienceLevel || !formData.testDifficulty) {
      setError("Please provide your experience level and test difficulty.");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/system-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate system design test');
      }

      // Store the result and navigate to results page
      sessionStorage.setItem('systemDesignTest', JSON.stringify(result.data));
      router.push('/system-design/results');
    } catch (error) {
      console.error('System design generation error:', error);
      setError("Failed to generate system design test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={40} height={40} className="object-contain" />
              <span className="font-semibold text-white">InterviewSense</span>
            </Link>
            <nav className="flex items-center gap-4">
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                        <AvatarFallback className="bg-zinc-700 text-white">
                          {session.user?.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user?.name && (
                          <p className="font-medium text-sm text-white">{session.user.name}</p>
                        )}
                        {session.user?.email && (
                          <p className="w-[200px] truncate text-sm text-zinc-400">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer text-white hover:text-white hover:bg-zinc-800">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-400 focus:text-red-400 focus:bg-red-950/50 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">Log in</Button>
                </Link>
              )}
            </nav>
          </div>
        </header>

        <div className="pt-16 px-4 h-full overflow-y-auto">
          {/* System Design Test - Centered */}
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-8">
            <div className="w-full max-w-2xl">
              {/* Header Section */}
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent mb-3">
                  System Design Interview Test
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Demonstrate your system design skills with real-world scenarios
                </p>
              </div>

              <Card className="bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-red-900/20 border border-red-500/20 backdrop-blur-sm shadow-2xl shadow-red-500/10">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Experience Level */}
                    <div className="space-y-3 group">
                      <label className="text-red-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Your Experience Level
                      </label>
                      <div className="relative">
                        <Select value={formData.experienceLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-red-500/50 focus:border-red-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-500/10">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                            <SelectItem value="mid">Mid-Level (2-5 years)</SelectItem>
                            <SelectItem value="senior">Senior (5+ years)</SelectItem>
                            <SelectItem value="lead">Tech Lead/Principal</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Test Difficulty */}
                    <div className="space-y-3 group">
                      <label className="text-red-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Test Difficulty
                      </label>
                      <div className="relative">
                        <Select value={formData.testDifficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, testDifficulty: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-red-500/50 focus:border-red-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-500/10">
                            <SelectValue placeholder="Choose test difficulty" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="easy">Easy (Basic concepts)</SelectItem>
                            <SelectItem value="medium">Medium (Real-world scenarios)</SelectItem>
                            <SelectItem value="hard">Hard (Complex systems)</SelectItem>
                            <SelectItem value="interview">Interview Style (Mixed difficulty)</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Target Company Type */}
                    <div className="space-y-3 group">
                      <label className="text-red-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        Target Company Type (Optional)
                      </label>
                      <div className="relative">
                        <Select value={formData.targetCompany} onValueChange={(value) => setFormData(prev => ({ ...prev, targetCompany: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-red-500/50 focus:border-red-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-500/10">
                            <SelectValue placeholder="What type of company are you targeting?" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="faang">FAANG/Big Tech</SelectItem>
                            <SelectItem value="startup">Startup</SelectItem>
                            <SelectItem value="fintech">Fintech</SelectItem>
                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-900/30 border border-red-800 text-red-200 p-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <div className="text-sm">{error}</div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:via-red-400 hover:to-red-500 text-white rounded-2xl text-base sm:text-lg font-semibold shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] border border-red-400/20"
                        disabled={isLoading || !formData.experienceLevel || !formData.testDifficulty}
                      >
                        <Code2 className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                        <span>{isLoading ? "Preparing Test..." : "Start System Design Test"}</span>
                      </Button>
                      
                      {(!formData.experienceLevel || !formData.testDifficulty) && (
                        <p className="text-center text-zinc-400 text-sm mt-3">
                          Please select your experience level and test difficulty to begin
                        </p>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 