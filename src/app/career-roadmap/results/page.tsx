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
import { DashboardLayout } from '@/components/DashboardLayout'
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
  GraduationCap,
  Code2
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
const mockAnalysis: RoadmapAnalysis = {
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
  skillsAnalysis: {
    technicalSkills: [
      {
        skill: "React/Frontend Frameworks",
        importance: 90,
        currentLevel: "Advanced",
        targetLevel: "Expert",
        learningPriority: "Medium"
      },
      {
        skill: "Backend Development",
        importance: 85,
        currentLevel: "Beginner",
        targetLevel: "Intermediate",
        learningPriority: "High"
      }
    ],
    softSkills: [
      {
        skill: "Technical Leadership",
        importance: 95,
        description: "Essential for leading technical decisions and mentoring team members"
      },
      {
        skill: "Communication",
        importance: 88,
        description: "Critical for collaborating with stakeholders and explaining technical concepts"
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
  },
  certifications: [
    {
      name: "AWS Solutions Architect Associate",
      provider: "Amazon Web Services",
      priority: "High",
      estimatedTime: "3 months",
      description: "Fundamental cloud architecture knowledge for tech leadership"
    }
  ],
  networking: {
    communities: ["React Community", "Engineering Leadership Groups"],
    events: ["Tech Lead conferences", "Frontend meetups"],
    platforms: ["LinkedIn", "Twitter", "Dev.to"]
  },
  resources: {
    courses: [
      {
        title: "System Design Course",
        provider: "Educative",
        type: "Online",
        duration: "8 weeks"
      }
    ],
    books: ["The Tech Lead's Toolkit", "Designing Data-Intensive Applications"],
    podcasts: ["Software Engineering Daily", "The Changelog"],
    blogs: ["Engineering at Netflix", "Uber Engineering"]
  }
}

export default function CareerRoadmapResultsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [analysis, setAnalysis] = useState<RoadmapAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 Results page useEffect triggered');
    
    // Try to get analysis data from localStorage
    const storedData = localStorage.getItem('careerRoadmapResults');
    console.log('🔍 Stored data from localStorage:', storedData);
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log('📊 Parsed data (first 500 chars):', JSON.stringify(parsedData).substring(0, 500));
        console.log('📊 Data structure check:', {
          hasSuccess: !!parsedData.success,
          hasAnalysis: !!parsedData.analysis,
          hasOverallScore: parsedData.overallScore !== undefined,
          analysisType: typeof parsedData.analysis,
          keys: Object.keys(parsedData)
        });
        
        // Check if it's the full response with success property
        if (parsedData.success && parsedData.analysis) {
          console.log('✅ Using REAL analysis data from API response');
          console.log('✅ Analysis summary:', parsedData.analysis.summary);
          console.log('✅ Analysis overall score:', parsedData.analysis.overallScore);
          setAnalysis(parsedData.analysis);
          
          // DON'T clear immediately - keep for debugging
          setTimeout(() => {
            localStorage.removeItem('careerRoadmapResults');
          }, 5000);
          
        } else if (parsedData.analysis) {
          console.log('⚠️ Using analysis data (alternate structure)');
          setAnalysis(parsedData.analysis);
        } else if (parsedData.overallScore !== undefined) {
          console.log('⚠️ Using direct analysis object');
          setAnalysis(parsedData);
        } else {
          console.error('❌ Invalid data structure:', parsedData);
          console.log('❌ Falling back to MOCK data');
          // TEMPORARILY DISABLE MOCK DATA TO FORCE DEBUGGING
          // setAnalysis(mockAnalysis);
          setAnalysis(null); // This will show error state instead
        }
      } catch (error) {
        console.error('❌ Error parsing stored analysis:', error);
        console.log('❌ Falling back to MOCK data');
        // TEMPORARILY DISABLE MOCK DATA 
        // setAnalysis(mockAnalysis);
        setAnalysis(null);
      }
    } else {
      console.warn('⚠️ No data found in localStorage');
      console.log('🔍 All localStorage keys:', Object.keys(localStorage));
      // TEMPORARILY DISABLE MOCK DATA TO FORCE DEBUGGING
      // setAnalysis(mockAnalysis);
      setAnalysis(null); // This will show "No Analysis Data Found" instead
    }
    setIsLoading(false);
  }, [])

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



  // Show loading state while fetching data
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-zinc-400">Loading your career roadmap...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show error state if no analysis data
  if (!analysis) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">No Analysis Data Found</h1>
            <p className="text-zinc-400 mb-6">Unable to load your career roadmap analysis.</p>
            <Button 
              onClick={() => router.push('/career-roadmap')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Create New Roadmap
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">

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



          {/* Skills Analysis */}
          {analysis.skillsAnalysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Technical Skills */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-400">
                    <Code2 className="h-5 w-5" />
                    Technical Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.skillsAnalysis.technicalSkills?.map((skill, index) => (
                      <div key={index} className="bg-zinc-900/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{skill.skill}</h4>
                          <Badge className={getPriorityColor(skill.learningPriority)}>
                            {skill.learningPriority} Priority
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-zinc-400">Current: </span>
                            <span className="text-zinc-300">{skill.currentLevel}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Target: </span>
                            <span className="text-zinc-300">{skill.targetLevel}</span>
                          </div>
                        </div>
                        <Progress value={skill.importance} className="h-2 mt-2" />
                        <p className="text-xs text-zinc-400 mt-1">Importance: {skill.importance}%</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Soft Skills */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <Users className="h-5 w-5" />
                    Soft Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.skillsAnalysis.softSkills?.map((skill, index) => (
                      <div key={index} className="bg-zinc-900/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{skill.skill}</h4>
                          <span className="text-purple-400 text-sm font-medium">{skill.importance}%</span>
                        </div>
                        <p className="text-zinc-300 text-sm">{skill.description}</p>
                        <Progress value={skill.importance} className="h-2 mt-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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

          {/* Certifications and Learning Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Certifications */}
            {analysis.certifications && analysis.certifications.length > 0 && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Award className="h-5 w-5" />
                    Recommended Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.certifications.map((cert, index) => (
                      <div key={index} className="bg-zinc-900/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{cert.name}</h4>
                          <Badge className={getPriorityColor(cert.priority)}>
                            {cert.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-zinc-400 text-sm mb-2">{cert.provider}</p>
                        <p className="text-zinc-300 text-sm mb-2">{cert.description}</p>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Clock className="h-3 w-3" />
                          <span>Estimated time: {cert.estimatedTime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Networking */}
            {analysis.networking && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-400">
                    <Network className="h-5 w-5" />
                    Networking & Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.networking.communities && analysis.networking.communities.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-cyan-300 mb-2">Communities to Join</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.networking.communities.map((community, index) => (
                            <Badge key={index} variant="secondary" className="bg-cyan-900/30 text-cyan-300 border-cyan-700">
                              {community}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysis.networking.events && analysis.networking.events.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-cyan-300 mb-2">Events to Attend</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.networking.events.map((event, index) => (
                            <Badge key={index} variant="secondary" className="bg-cyan-900/30 text-cyan-300 border-cyan-700">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysis.networking.platforms && analysis.networking.platforms.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-cyan-300 mb-2">Platforms to Use</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.networking.platforms.map((platform, index) => (
                            <Badge key={index} variant="secondary" className="bg-cyan-900/30 text-cyan-300 border-cyan-700">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Learning Resources */}
          {analysis.resources && (
            <Card className="bg-zinc-800/50 border-zinc-700 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-400">
                  <BookOpen className="h-5 w-5" />
                  Learning Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Courses */}
                  {analysis.resources.courses && analysis.resources.courses.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-indigo-300 mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Recommended Courses
                      </h4>
                      <div className="space-y-3">
                        {analysis.resources.courses.map((course, index) => (
                          <div key={index} className="bg-zinc-900/50 p-3 rounded-lg">
                            <h5 className="font-medium text-white text-sm">{course.title}</h5>
                            <p className="text-zinc-400 text-xs">{course.provider} • {course.type} • {course.duration}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Books, Podcasts, Blogs */}
                  <div className="space-y-4">
                    {analysis.resources.books && analysis.resources.books.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-indigo-300 mb-2">Books</h4>
                        <div className="space-y-1">
                          {analysis.resources.books.map((book, index) => (
                            <p key={index} className="text-zinc-300 text-sm">• {book}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.resources.podcasts && analysis.resources.podcasts.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-indigo-300 mb-2">Podcasts</h4>
                        <div className="space-y-1">
                          {analysis.resources.podcasts.map((podcast, index) => (
                            <p key={index} className="text-zinc-300 text-sm">• {podcast}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.resources.blogs && analysis.resources.blogs.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-indigo-300 mb-2">Blogs</h4>
                        <div className="space-y-1">
                          {analysis.resources.blogs.map((blog, index) => (
                            <p key={index} className="text-zinc-300 text-sm">• {blog}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}



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
      </DashboardLayout>
    </ProtectedRoute>
  )
} 