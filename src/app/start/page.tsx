'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { 
  Upload, 
  FileText, 
  Mic, 
  Volume2, 
  X, 
  User, 
  LogOut, 
  ChevronDown,
  Play,
  LayoutDashboard
} from "lucide-react"

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
  { id: 'embedded-engineer', title: 'Embedded Systems Engineer', description: 'C/C++, Hardware, IoT, Firmware' }
];

interface FormData {
  role: string;
  numberOfQuestions: number;
  resume: File | null;
  company: string;
  jobTitle: string;
  industry: string;
  experienceLevel: string;
  interviewType: string;
  interviewStage: string;
  jobDescription: string;
}

interface MicrophoneState {
  devices: MediaDeviceInfo[];
  selectedDevice: string;
  volume: number;
  isSupported: boolean;
}

export default function StartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    role: '',
    numberOfQuestions: 5,
    resume: null,
    company: '',
    jobTitle: '',
    industry: '',
    experienceLevel: 'Intern',
    interviewType: 'Behavioral',
    interviewStage: 'Initial Screening',
    jobDescription: ''
  });

  // UI state
  const [showMicSetup, setShowMicSetup] = useState(false);
  const [micState, setMicState] = useState<MicrophoneState>({
    devices: [],
    selectedDevice: '',
    volume: 100,
    isSupported: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    checkMicrophoneSupport();
  }, [status, router])

  const checkMicrophoneSupport = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      setMicState(prev => ({
        ...prev,
        isSupported: true,
        devices: audioDevices,
        selectedDevice: audioDevices[0]?.deviceId || ''
      }));
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMicState(prev => ({ ...prev, isSupported: false }));
    }
  };

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
      
      if (allowedTypes.includes(file.type) || allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
        setFormData(prev => ({ ...prev, resume: file }));
        toast({
          title: "Resume uploaded successfully",
          description: `${file.name} has been uploaded.`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, DOCX, or TXT file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStartInterview = () => {
    if (!formData.jobTitle) {
      toast({
        title: "Please enter a job title",
        description: "Job title is required to generate relevant questions.",
        variant: "destructive"
      });
      return;
    }
    
    setShowMicSetup(true);
  };

  const handleContinueToInterview = () => {
    // Store form data in localStorage for the interview page
    localStorage.setItem('jobTitle', formData.jobTitle);
    localStorage.setItem('company', formData.company);
    localStorage.setItem('industry', formData.industry);
    localStorage.setItem('experienceLevel', formData.experienceLevel);
    localStorage.setItem('interviewType', formData.interviewType);
    localStorage.setItem('interviewStage', formData.interviewStage);
    localStorage.setItem('jobDescription', formData.jobDescription);
    
    // Store additional settings
    const interviewData = {
      ...formData,
      micSettings: {
        deviceId: micState.selectedDevice,
        volume: micState.volume
      }
    };
    
    localStorage.setItem('interviewData', JSON.stringify(interviewData));
    router.push('/interview');
  };

  const isFormValid = () => {
    return formData.jobTitle.trim() !== '';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <nav className="w-full z-50 relative border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Image src="https://i.ibb.co/hNsCy7F/logo.webp" alt="InterviewSense" width={56} height={56} className="object-contain" />
            <span className="font-bold text-2xl text-white hidden sm:block">InterviewSense</span>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-6">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="bg-slate-700">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-900 border-slate-700" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center text-slate-300 hover:text-white">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-400 hover:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  asChild 
                  variant="ghost" 
                  size="lg"
                  className="px-6 py-3 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-full transition-all duration-300"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button 
                  asChild
                  size="lg"
                  className="px-10 py-4 text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105 border border-blue-400/20"
                >
                  <Link href="/signup">Start Today - It's Free</Link>
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile Menu for smaller screens */}
          <div className="flex md:hidden items-center">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                      <AvatarFallback className="bg-slate-700">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-900 border-slate-700" align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center text-slate-300 hover:text-white">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-400 hover:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          
          {/* Left Side - Breathing Circle */}
          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              {/* Breathing Dotted Circle Pattern */}
              <div className="w-80 h-80 rounded-full relative animate-breathing">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Main dotted circle with dot animation */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgb(59 130 246)"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeDasharray="0.5 1.5 1 2 0.3 1.8 1.2 1.2 0.7 2.5 0.4 1.6 1.5 1 0.6 2.2 0.8 1.4 1.1 1.8 0.5 2 0.9 1.3 0.7 1.9 1.3 1.1 0.4 2.3 0.6 1.7 1.2 1.4 0.8 2.1 0.5 1.5 1 1.6 0.9 1.2 1.4 1.8 0.7 2.4 0.3 1.9"
                    className="animate-dot-flow opacity-90"
                  />
                  {/* Second layer with different dot animation */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgb(59 130 246)"
                    strokeWidth="0.6"
                    strokeLinecap="round"
                    strokeDasharray="0.3 2 1.5 1 0.7 1.8 0.4 2.2 1.2 1.3 0.6 1.9 0.8 1.6 1.1 1.4 0.5 2.1 0.9 1.7"
                    className="animate-dot-flow-reverse opacity-60"
                  />
                  {/* Subtle background circle with pulse */}
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="rgb(51 65 85 / 0.2)"
                    strokeWidth="0.5"
                    strokeDasharray="0.2 3 0.8 2.5 0.4 3.2 1.1 2.8 0.6 3.5 0.3 2.9 0.9 3.1 0.5 2.7"
                    className="animate-pulse-slow"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-8 space-y-6">
                
                {/* Resume Upload and Job Title Row */}
                <div className="flex items-end justify-between gap-6">
                  {/* Job Title Selection */}
                  <div className="flex-1">
                    <Label className="text-slate-300 text-sm mb-2 block">Job Title</Label>
                    <Select 
                      value={formData.jobTitle} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, jobTitle: value }))}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Select your job title" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                        {TECH_JOB_TITLES.map(job => (
                          <SelectItem key={job.id} value={job.title}>
                            <div>
                              <div className="font-medium">{job.title}</div>
                              <div className="text-sm text-slate-400">{job.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resume Upload */}
                  <div className="flex-shrink-0">
                    <Label className="text-slate-300 text-sm mb-2 block">Resume</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-slate-800/50 hover:bg-slate-700/50 border-slate-600/50 text-slate-300"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {formData.resume ? "Change File" : "Upload Resume"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                      {formData.resume && (
                        <span className="text-sm text-slate-400 flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {formData.resume.name.length > 20
                            ? `${formData.resume.name.substring(0, 20)}...`
                            : formData.resume.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-3">
                  <Label className="text-slate-300">Experience Level</Label>
                  <Select 
                    value={formData.experienceLevel} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="Intern">Intern</SelectItem>
                      <SelectItem value="Entry-level">Entry-level (0-2 years)</SelectItem>
                      <SelectItem value="Mid-level">Mid-level (2-5 years)</SelectItem>
                      <SelectItem value="Senior">Senior (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Questions */}
                <div className="space-y-3">
                  <Label className="text-slate-300">Number of Questions</Label>
                  <Select 
                    value={formData.numberOfQuestions.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfQuestions: parseInt(value) }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} questions</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Input */}
                <div className="space-y-3">
                  <Label className="text-slate-300">Company (Optional)</Label>
                  <Input
                    placeholder="e.g., Google, Apple, Meta"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="bg-slate-800 border-slate-600 focus:border-blue-400"
                  />
                </div>

                {/* Start Interview Button */}
                <Button
                  onClick={handleStartInterview}
                  disabled={!isFormValid()}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full py-6 text-lg font-medium shadow transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Microphone Setup Dialog */}
      <Dialog open={showMicSetup} onOpenChange={setShowMicSetup}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <Mic className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-white">Microphone Setup</DialogTitle>
            </div>
            <DialogDescription className="text-slate-400">
              Configure your microphone before starting the interview
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Microphone Selection */}
            <div className="space-y-3">
              <Label className="text-slate-300">Microphone</Label>
              <Select 
                value={micState.selectedDevice} 
                onValueChange={(value) => setMicState(prev => ({ ...prev, selectedDevice: value }))}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {micState.devices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Volume</Label>
                <span className="text-slate-400">{micState.volume}%</span>
              </div>
              <div className="flex items-center space-x-3">
                <Volume2 className="h-4 w-4 text-slate-400" />
                <Slider
                  value={[micState.volume]}
                  onValueChange={(value) => setMicState(prev => ({ ...prev, volume: value[0] }))}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowMicSetup(false)}
              className="flex-1 border-slate-600 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinueToInterview}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white shadow transition-colors"
            >
              Continue to Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes breathing {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }
        @keyframes dot-flow {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.9;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            stroke-dashoffset: 20;
            opacity: 0.9;
          }
        }
        @keyframes dot-flow-reverse {
          0% {
            stroke-dashoffset: 20;
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.6;
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
            stroke-width: 0.5;
          }
          50% {
            opacity: 0.4;
            stroke-width: 0.7;
          }
        }
        .animate-breathing {
          animation: breathing 4s ease-in-out infinite;
        }
        .animate-dot-flow {
          animation: dot-flow 6s linear infinite;
        }
        .animate-dot-flow-reverse {
          animation: dot-flow-reverse 8s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
