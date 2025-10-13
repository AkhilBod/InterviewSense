"use client"

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Target, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  LogOut,
  User,
  Sparkles,
  Briefcase,
  GraduationCap,
  DollarSign,
  Clock,
  AlertCircle,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ProtectedRoute from '@/components/ProtectedRoute';
import CareerRoadmapLoadingModal from '@/components/CareerRoadmapLoadingModal';

const TECH_JOB_TITLES = [
  { id: 'frontend-developer', title: 'Frontend Developer', description: 'React, Vue, Angular, JavaScript, TypeScript' },
  { id: 'backend-developer', title: 'Backend Developer', description: 'Node.js, Python, Java, Go, APIs, Databases' },
  { id: 'fullstack-developer', title: 'Full Stack Developer', description: 'Frontend + Backend Development' },
  { id: 'mobile-developer', title: 'Mobile Developer', description: 'React Native, Flutter, iOS, Android' },
  { id: 'devops-engineer', title: 'DevOps Engineer', description: 'AWS, Docker, Kubernetes, CI/CD, Infrastructure' },
  { id: 'software-engineer', title: 'Software Engineer', description: 'General Software Development' },
  { id: 'senior-software-engineer', title: 'Senior Software Engineer', description: 'Advanced Software Development & Leadership' },
  { id: 'tech-lead', title: 'Tech Lead', description: 'Technical Leadership & Architecture' },
  { id: 'engineering-manager', title: 'Engineering Manager', description: 'Team Management & Technical Strategy' },
  { id: 'aiml-engineer', title: 'AI/ML Engineer', description: 'Python, TensorFlow, PyTorch, Machine Learning' },
  { id: 'data-engineer', title: 'Data Engineer', description: 'SQL, Spark, Data Pipelines, ETL' },
  { id: 'data-scientist', title: 'Data Scientist', description: 'Statistics, Machine Learning, Analytics' },
  { id: 'security-engineer', title: 'Security Engineer', description: 'Cybersecurity, Penetration Testing, InfoSec' },
  { id: 'qa-engineer', title: 'QA Engineer', description: 'Testing, Automation, Quality Assurance' },
  { id: 'platform-engineer', title: 'Platform Engineer', description: 'Infrastructure, Platform Tools, Developer Experience' },
  { id: 'site-reliability-engineer', title: 'Site Reliability Engineer (SRE)', description: 'System Reliability, Monitoring, Performance' },
  { id: 'cloud-engineer', title: 'Cloud Engineer', description: 'AWS, Azure, GCP, Cloud Architecture' },
  { id: 'solutions-architect', title: 'Solutions Architect', description: 'System Design, Architecture, Technical Strategy' },
  { id: 'product-engineer', title: 'Product Engineer', description: 'Product Development, User Experience, Business Logic' },
  { id: 'embedded-engineer', title: 'Embedded Systems Engineer', description: 'C/C++, Hardware, IoT, Firmware' },
  { id: 'student', title: 'Student', description: 'Currently studying or new graduate' },
  { id: 'career-changer', title: 'Career Changer', description: 'Transitioning from another field' },
  { id: 'other', title: 'Other', description: 'Different role or industry' }
];

export default function CareerRoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [roadmapData, setRoadmapData] = useState({
    currentRole: '',
    careerGoal: '',
    timeline: '',
    challenges: '',
    location: '',
    salaryGoal: '',
    skills: [] as string[],
    priorities: [] as string[],
    experienceLevel: ''
  });
  
  const [customCurrentRole, setCustomCurrentRole] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const effectiveCurrentRole = roadmapData.currentRole === 'Other' ? customCurrentRole : roadmapData.currentRole;
    if (!effectiveCurrentRole || !roadmapData.careerGoal) {
      setError("Please provide your current role and career goal.");
      setIsLoading(false);
      return;
    }
    
    try {
      const submissionData = {
        ...roadmapData,
        currentRole: effectiveCurrentRole
      };
      
      const response = await fetch('/api/career-roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate career roadmap');
      }

      const data = await response.json();
      console.log('🚀 API Response received:', data);
      console.log('🚀 Response structure:', {
        hasSuccess: !!data.success,
        hasAnalysis: !!data.analysis,
        analysisType: typeof data.analysis
      });
      
      if (data.success) {
        // Store the complete response data in localStorage to pass to results page
        console.log('💾 Storing data in localStorage:', data);
        localStorage.setItem('careerRoadmapResults', JSON.stringify(data));
        
        // Verify the data was stored
        const verification = localStorage.getItem('careerRoadmapResults');
        console.log('🔍 Verification - data in localStorage:', verification ? 'EXISTS' : 'NOT FOUND');
        console.log('✅ Data stored successfully, navigating to results...');
        
        // Small delay to ensure localStorage write completes
        setTimeout(() => {
          router.push('/career-roadmap/results');
        }, 100);
      } else {
        throw new Error(data.error || 'Failed to generate career roadmap');
      }
    } catch (error) {
      console.error('Career roadmap generation error:', error);
      setError("Failed to generate career roadmap. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setRoadmapData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    } else {
      setRoadmapData(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s !== skill)
      }));
    }
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    if (checked) {
      setRoadmapData(prev => ({
        ...prev,
        priorities: [...prev.priorities, priority]
      }));
    } else {
      setRoadmapData(prev => ({
        ...prev,
        priorities: prev.priorities.filter(p => p !== priority)
      }));
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
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
          {/* Career Roadmap Form - Centered */}
          <div className="flex items-center justify-center min-h-[calc(100vh-64px)] py-8">
            <div className="w-full max-w-2xl">
              {/* Header Section */}
              <div className="text-center mb-8 lg:mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-3">
                  Build your personalized career roadmap
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Chart your path to career success with AI guidance
                </p>
              </div>

              <Card className="bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-amber-900/20 border border-amber-500/20 backdrop-blur-sm shadow-2xl shadow-amber-500/10">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Current Role */}
                    <div className="space-y-3 group">
                      <label className="text-amber-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Current Role
                      </label>
                      <div className="relative">
                        <Select 
                          value={roadmapData.currentRole} 
                          onValueChange={(value) => {
                            setRoadmapData(prev => ({ ...prev, currentRole: value }));
                            if (value !== 'Other') {
                              setCustomCurrentRole('');
                            }
                          }}
                        >
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-amber-500/50 focus:border-amber-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/10">
                            <SelectValue placeholder="Select your current role" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50 max-h-64 overflow-y-auto">
                            {TECH_JOB_TITLES.map((job) => (
                              <SelectItem 
                                key={job.id} 
                                value={job.title} 
                                className="text-left hover:bg-amber-500/10 focus:bg-amber-500/20 transition-colors"
                              >
                                <div className="flex flex-col items-start w-full">
                                  <div className="font-medium text-white">{job.title}</div>
                                  <div className="text-sm text-amber-300/70 hidden sm:block">{job.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Custom Current Role Input */}
                        {roadmapData.currentRole === 'Other' && (
                          <div className="mt-3">
                            <Input
                              placeholder="Enter your current role..."
                              value={customCurrentRole}
                              onChange={(e) => setCustomCurrentRole(e.target.value)}
                              className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-amber-500/50 focus:border-amber-500 text-white placeholder:text-zinc-400"
                              required
                            />
                          </div>
                        )}
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-3 group">
                      <label className="text-amber-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Your experience level
                      </label>
                      <div className="relative">
                        <Select 
                          value={roadmapData.experienceLevel} 
                          onValueChange={(value) => setRoadmapData(prev => ({ ...prev, experienceLevel: value }))}
                        >
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-amber-500/50 focus:border-amber-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/10">
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="Intern" className="hover:bg-amber-500/10 focus:bg-amber-500/20">
                              Intern
                            </SelectItem>
                            <SelectItem value="Entry-level" className="hover:bg-amber-500/10 focus:bg-amber-500/20">
                              Entry-level (0-2 years)
                            </SelectItem>
                            <SelectItem value="Mid-level" className="hover:bg-amber-500/10 focus:bg-amber-500/20">
                              Mid-level (2-5 years)
                            </SelectItem>
                            <SelectItem value="Senior" className="hover:bg-amber-500/10 focus:bg-amber-500/20">
                              Senior (5+ years)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Career Goal */}
                    <div className="space-y-3 group">
                      <label className="text-amber-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Dream Role/Career Goal
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="e.g., Senior Software Engineer, Tech Lead, CTO..."
                          value={roadmapData.careerGoal}
                          onChange={(e) => setRoadmapData(prev => ({ ...prev, careerGoal: e.target.value }))}
                          className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-amber-500/50 focus:border-amber-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/10 placeholder:text-zinc-500"
                          required
                        />
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3 group">
                      <label className="text-amber-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Timeline to Achieve Goal
                      </label>
                      <div className="relative">
                        <Select value={roadmapData.timeline} onValueChange={(value) => setRoadmapData(prev => ({ ...prev, timeline: value }))}>
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-amber-500/50 focus:border-amber-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/10">
                            <SelectValue placeholder="When do you want to achieve this?" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                            <SelectItem value="6-months">Within 6 months</SelectItem>
                            <SelectItem value="1-year">Within 1 year</SelectItem>
                            <SelectItem value="2-years">Within 2 years</SelectItem>
                            <SelectItem value="3-years">Within 3 years</SelectItem>
                            <SelectItem value="5-years">Within 5 years</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Current Challenges */}
                    <div className="space-y-3 group">
                      <label className="text-amber-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Current Challenges (Optional)
                      </label>
                      <div className="relative">
                        <Textarea
                          placeholder="What obstacles are you facing in your career journey?"
                          value={roadmapData.challenges}
                          onChange={(e) => setRoadmapData(prev => ({ ...prev, challenges: e.target.value }))}
                          className="w-full px-3 py-3 min-h-[80px] bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-amber-500/50 focus:border-amber-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/10 placeholder:text-zinc-500 rounded-md text-white"
                        />
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                        className="w-full h-14 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 text-white rounded-2xl text-base sm:text-lg font-semibold shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] border border-amber-400/20"
                        disabled={isLoading || !roadmapData.currentRole || !roadmapData.careerGoal}
                      >
                        <TrendingUp className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                        <span>{isLoading ? "Creating Roadmap..." : "Create Career Roadmap"}</span>
                      </Button>
                      
                      {(!roadmapData.currentRole || !roadmapData.careerGoal) && (
                        <p className="text-center text-zinc-400 text-sm mt-3">
                          Please provide your current role and career goal to get started
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
      <CareerRoadmapLoadingModal 
        isOpen={isLoading}
        onClose={() => {}} // Don't allow closing during analysis
      />
    </ProtectedRoute>
  );
} 