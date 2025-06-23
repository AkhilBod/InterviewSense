'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { 
  TrendingUp,
  Target,
  BookOpen,
  Users,
  Award,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  LogOut,
  Star,
  ExternalLink,
  Calendar,
  Lightbulb,
  Trophy,
  Network,
  GraduationCap
} from "lucide-react"

interface RoadmapAnalysis {
  overallScore: number;
  summary: string;
  currentRoleAnalysis: {
    strengths: string[];
    skillGaps: string[];
    marketDemand: number;
  };
  careerPath: {
    phases: Array<{
      title: string;
      timeframe: string;
      description: string;
      keyMilestones: string[];
      skillsToAcquire: string[];
      estimatedSalaryRange: string;
    }>;
  };
  skillsAnalysis: {
    technicalSkills: Array<{
      skill: string;
      importance: number;
      currentLevel: string;
      targetLevel: string;
      learningPriority: string;
    }>;
    softSkills: Array<{
      skill: string;
      importance: number;
      description: string;
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  certifications: Array<{
    name: string;
    provider: string;
    priority: string;
    estimatedTime: string;
    description: string;
  }>;
  networking: {
    communities: string[];
    events: string[];
    platforms: string[];
  };
  resources: {
    courses: Array<{
      title: string;
      provider: string;
      type: string;
      duration: string;
    }>;
    books: string[];
    podcasts: string[];
    blogs: string[];
  };
}

interface ResultsData {
  success: boolean;
  analysis: RoadmapAnalysis;
}

// Mock data - in real implementation, this would come from API
const mockAnalysis = {
  overallScore: 85,
  summary: "Your career transition from Frontend Developer to Tech Lead is highly achievable within 2 years. Your strong technical foundation and growing leadership interest position you well for this advancement.",
  currentRoleAnalysis: {
    strengths: [
      "Strong React and JavaScript expertise",
      "Experience with modern frontend frameworks",
      "Understanding of UI/UX principles",
      "Active open-source contributor"
    ],
    skillGaps: [
      "Backend system architecture knowledge",
      "Team leadership experience",
      "Project management skills",
      "Strategic technical decision making"
    ],
    marketDemand: 78
  },
  careerPath: {
    phases: [
      {
        title: "Senior Frontend Developer",
        timeframe: "0-8 months",
        description: "Focus on advancing technical leadership and mentoring junior developers",
        keyMilestones: [
          "Lead a major frontend project",
          "Mentor 2-3 junior developers",
          "Contribute to architectural decisions"
        ],
        skillsToAcquire: ["Advanced TypeScript", "Micro-frontend architecture", "Code review best practices"],
        estimatedSalaryRange: "$95,000 - $125,000"
      },
      {
        title: "Tech Lead",
        timeframe: "18-24 months",
        description: "Full technical leadership across frontend and backend systems",
        keyMilestones: [
          "Drive technical roadmap",
          "Manage technical debt initiatives",
          "Collaborate with product and design leads"
        ],
        skillsToAcquire: ["Backend technologies", "Database optimization", "Strategic planning"],
        estimatedSalaryRange: "$140,000 - $180,000"
      }
    ]
  },
  recommendations: {
    immediate: [
      "Start contributing to backend codebases in your current role",
      "Volunteer to lead the next major frontend project",
      "Begin system design practice with online resources"
    ],
    shortTerm: [
      "Take on a junior developer as a mentee",
      "Complete AWS/Cloud certification",
      "Lead a cross-team technical initiative"
    ],
    longTerm: [
      "Establish yourself as a go-to technical decision maker",
      "Build relationships with engineering managers",
      "Develop expertise in emerging frontend technologies"
    ]
  }
}

export default function CareerRoadmapResultsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const analysis = mockAnalysis

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-amber-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-amber-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30'
      default: return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
    }
  }



  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
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
                    <DropdownMenuItem asChild>
                      <Link href="/career-roadmap" className="cursor-pointer text-white hover:text-white hover:bg-zinc-800">
                        New Roadmap
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-3">
              Your Career Roadmap
            </h1>
            <p className="text-zinc-400 text-lg">
              Personalized guidance for your career journey
            </p>
          </div>

          {/* Overall Score & Summary */}
          <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                {/* Score Circle */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-zinc-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysis.overallScore / 100)}`}
                        className={`${getScoreColor(analysis.overallScore)} transition-all duration-1000 ease-out`}
                        style={{
                          filter: 'drop-shadow(0 0 8px currentColor)',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </span>
                      <span className="text-sm text-slate-400 font-medium">/ 100</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Achievability Score</h3>
                  <p className="text-sm text-slate-400 text-center">
                    {analysis.overallScore >= 80 ? 'Highly Achievable' : 
                     analysis.overallScore >= 60 ? 'Achievable' : 'Challenging'}
                  </p>
                </div>

                {/* Summary */}
                <div className="flex-1 bg-zinc-700/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Career Path Summary</h3>
                  <p className="text-zinc-300 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Role Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-amber-400" />
                  <span className="font-medium">Current Strengths</span>
                </div>
                <div className="space-y-2">
                  {analysis.currentRoleAnalysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-zinc-300">{strength}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  <span className="font-medium">Skill Gaps</span>
                </div>
                <div className="space-y-2">
                  {analysis.currentRoleAnalysis.skillGaps.map((gap, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-zinc-300">{gap}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="font-medium">Market Demand</span>
                </div>
                <div className="space-y-3">
                  <div className={`text-2xl font-bold ${getScoreColor(analysis.currentRoleAnalysis.marketDemand)}`}>
                    {analysis.currentRoleAnalysis.marketDemand}%
                  </div>
                  <Progress value={analysis.currentRoleAnalysis.marketDemand} className="h-2" />
                  <p className="text-sm text-zinc-400">
                    {analysis.currentRoleAnalysis.marketDemand >= 80 ? 'High demand' : 
                     analysis.currentRoleAnalysis.marketDemand >= 60 ? 'Moderate demand' : 'Lower demand'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Career Path Phases */}
          <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <TrendingUp className="h-5 w-5" />
                Career Path Phases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.careerPath.phases.map((phase, index) => (
                  <div key={index} className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-600">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-amber-400" />
                          <span className="text-amber-300 text-sm">{phase.timeframe}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-green-300 text-sm font-medium">{phase.estimatedSalaryRange}</span>
                      </div>
                    </div>
                    
                    <p className="text-zinc-300 mb-4">{phase.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-amber-400 mb-2">Key Milestones</h4>
                        <ul className="space-y-1">
                          {phase.keyMilestones.map((milestone, milestoneIndex) => (
                            <li key={milestoneIndex} className="text-sm text-zinc-300 flex items-start gap-2">
                              <Trophy className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-2">Skills to Acquire</h4>
                        <div className="flex flex-wrap gap-2">
                          {phase.skillsToAcquire.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary" className="bg-zinc-700 text-zinc-200 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>



          {/* Recommendations */}
          <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Lightbulb className="h-5 w-5" />
                Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-green-400 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Immediate (0-3 months)
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.immediate.map((action, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-zinc-300">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-yellow-400 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Short-term (3-12 months)
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.shortTerm.map((action, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-zinc-300">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-amber-400 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Long-term (1+ years)
                  </h4>
                  <div className="space-y-2">
                    {analysis.recommendations.longTerm.map((action, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-zinc-300">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              onClick={() => router.push('/career-roadmap')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Create New Roadmap
            </Button>
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
} 