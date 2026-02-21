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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GitBranch, 
  Upload, 
  ExternalLink, 
  Globe, 
  Github, 
  LogOut,
  User,
  Sparkles,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ProtectedRoute from '@/components/ProtectedRoute';
import PortfolioAnalysisLoadingModal from '@/components/PortfolioAnalysisLoadingModal';

export default function PortfolioReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  // Form state
  const [portfolioData, setPortfolioData] = useState({
    portfolioUrl: '',
    githubUrl: '',
    description: '',
    projectTypes: [] as string[],
    experience: '',
    targetRole: '',
    specificFeedback: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!portfolioData.portfolioUrl || !portfolioData.targetRole) {
      setError("Please provide your portfolio URL and target role.");
      setIsLoading(false);
      return;
    }
    
    try {
      setShowLoadingModal(true);
      
      const response = await fetch('/api/portfolio-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze portfolio');
      }

      // Store results in sessionStorage to pass to results page
      sessionStorage.setItem('portfolioReviewResults', JSON.stringify(result));
      
      // Close loading modal before navigation
      setShowLoadingModal(false);
      router.push('/portfolio-review/results');
    } catch (error) {
      console.error('Portfolio review error:', error);
      setError("Failed to analyze portfolio. Please try again.");
      setShowLoadingModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectTypeChange = (projectType: string, checked: boolean) => {
    if (checked) {
      setPortfolioData(prev => ({
        ...prev,
        projectTypes: [...prev.projectTypes, projectType]
      }));
    } else {
      setPortfolioData(prev => ({
        ...prev,
        projectTypes: prev.projectTypes.filter(type => type !== projectType)
      }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-[#000818]/80">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={50} height={50} className="object-contain" />
              <span className="font-bold text-xl text-white">InterviewSense</span>
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
          {/* Portfolio Review Form - Centered */}
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-8">
            <div className="w-full max-w-2xl">
              {/* Header Section */}
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 bg-clip-text text-transparent mb-3">
                  Get portfolio feedback that matters
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Professional review of your projects and code quality
                </p>
              </div>

              <Card className="bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-cyan-900/20 border border-cyan-500/20 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Portfolio URL */}
                    <div className="space-y-3 group">
                      <label className="text-cyan-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                        Portfolio Website URL
                      </label>
                      <div className="relative">
                        <Input
                          type="url"
                          placeholder="https://yourportfolio.com"
                          value={portfolioData.portfolioUrl}
                          onChange={(e) => setPortfolioData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                          className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-cyan-500/50 focus:border-cyan-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/10 placeholder:text-zinc-500"
                          required
                        />
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* GitHub URL */}
                    <div className="space-y-3 group">
                      <label className="text-cyan-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                        GitHub Profile (Optional)
                      </label>
                      <div className="relative">
                        <Input
                          type="url"
                          placeholder="https://github.com/yourusername"
                          value={portfolioData.githubUrl}
                          onChange={(e) => setPortfolioData(prev => ({ ...prev, githubUrl: e.target.value }))}
                          className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-cyan-500/50 focus:border-cyan-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/10 placeholder:text-zinc-500"
                        />
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Target Role */}
                    <div className="space-y-3 group">
                      <label className="text-cyan-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                        Target Role
                      </label>
                      <div className="relative">
                        <Select value={portfolioData.targetRole} onValueChange={(value) => setPortfolioData(prev => ({ ...prev, targetRole: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-cyan-500/50 focus:border-cyan-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/10">
                            <SelectValue placeholder="What role are you targeting?" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="frontend">Frontend Developer</SelectItem>
                            <SelectItem value="backend">Backend Developer</SelectItem>
                            <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                            <SelectItem value="mobile">Mobile Developer</SelectItem>
                            <SelectItem value="devops">DevOps Engineer</SelectItem>
                            <SelectItem value="data">Data Scientist</SelectItem>
                            <SelectItem value="ml">ML Engineer</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-3 group">
                      <label className="text-cyan-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                        Experience Level
                      </label>
                      <div className="relative">
                        <Select value={portfolioData.experience} onValueChange={(value) => setPortfolioData(prev => ({ ...prev, experience: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-cyan-500/50 focus:border-cyan-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/10">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="Intern" className="hover:bg-cyan-500/10 focus:bg-cyan-500/20">
                              Intern
                            </SelectItem>
                            <SelectItem value="Entry-level" className="hover:bg-cyan-500/10 focus:bg-cyan-500/20">
                              Entry-level (0-2 years)
                            </SelectItem>
                            <SelectItem value="Mid-level" className="hover:bg-cyan-500/10 focus:bg-cyan-500/20">
                              Mid-level (2-5 years)
                            </SelectItem>
                            <SelectItem value="Senior" className="hover:bg-cyan-500/10 focus:bg-cyan-500/20">
                              Senior (5+ years)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                        className="w-full h-14 bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-cyan-500 text-white rounded-2xl text-base sm:text-lg font-semibold shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] border border-cyan-400/20"
                        disabled={isLoading || !portfolioData.portfolioUrl || !portfolioData.targetRole}
                      >
                        <GitBranch className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                        <span>{isLoading ? "Analyzing Portfolio..." : "Get Portfolio Review"}</span>
                      </Button>
                      
                      {(!portfolioData.portfolioUrl || !portfolioData.targetRole) && (
                        <p className="text-center text-zinc-400 text-sm mt-3">
                          Please provide your portfolio URL and target role to get started
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

      {/* Loading Modal */}
      <PortfolioAnalysisLoadingModal 
        isOpen={showLoadingModal}
        onClose={() => {}} // Don't allow closing during analysis
      />
    </ProtectedRoute>
  );
} 