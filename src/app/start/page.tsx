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
  LayoutDashboard,
  RefreshCw
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
  isLoading: boolean;
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
    isSupported: false,
    isLoading: false
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
      setMicState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }

    setMicState(prev => ({ ...prev, isLoading: true }));

    try {
      // First, request microphone permission to get device labels
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Now enumerate devices (this will include labels after permission is granted)
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      // Stop the stream as we only needed it for permission
      stream.getTracks().forEach(track => track.stop());
      
      setMicState(prev => ({
        ...prev,
        isSupported: true,
        devices: audioDevices,
        selectedDevice: audioDevices[0]?.deviceId || '',
        isLoading: false
      }));
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      // Try to enumerate devices anyway (might work without labels)
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        setMicState(prev => ({
          ...prev,
          isSupported: audioDevices.length > 0,
          devices: audioDevices,
          selectedDevice: audioDevices[0]?.deviceId || '',
          isLoading: false
        }));
      } catch (enumError) {
        console.error('Error enumerating devices:', enumError);
        setMicState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      }
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

  const handleStartInterview = async () => {
    if (!formData.jobTitle) {
      toast({
        title: "Please enter a job title",
        description: "Job title is required to generate relevant questions.",
        variant: "destructive"
      });
      return;
    }
    
    // Refresh microphone devices before showing the dialog
    await checkMicrophoneSupport();
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
    localStorage.setItem('numberOfQuestions', formData.numberOfQuestions.toString());
    
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
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
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
                      <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                      <AvatarFallback className="bg-blue-500">
                        {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
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

      {/* Main Content */}
      <div className="pt-16 sm:pt-20 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center justify-center lg:min-h-[70vh]">
          
          {/* Left Side - Breathing Circle */}
          <div className="flex flex-col items-center justify-center space-y-4 lg:space-y-8 order-2 lg:order-1">
            <div className="relative">
              {/* Breathing Dotted Circle Pattern */}
              <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full relative animate-breathing">
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
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2 flex justify-center">
            <div className="w-full max-w-lg">
              {/* Header Section */}
              <div className="text-center mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-3">
                  Ready to shine in your interview?
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Let's prepare you for success with personalized practice
                </p>
              </div>

              <Card className="bg-gradient-to-br from-zinc-800/80 via-zinc-800/50 to-blue-900/20 border border-blue-500/20 backdrop-blur-sm shadow-2xl shadow-blue-500/10">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  
                  {/* Resume Upload and Job Title - Stack on Mobile */}
                  <div className="space-y-6 lg:space-y-0 lg:flex lg:items-end lg:justify-between lg:gap-6">
                    {/* Job Title Selection */}
                    <div className="flex-1 min-w-0 group">
                      <Label className="text-blue-300 text-sm font-medium mb-3 block flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        What role are you targeting?
                      </Label>
                      <div className="relative">
                        <Select 
                          value={formData.jobTitle} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, jobTitle: value }))}
                        >
                          <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-blue-500/50 focus:border-blue-500 text-left w-full h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10 [&>span]:text-left [&>span]:justify-start">
                            <SelectValue placeholder="Choose your dream role..." className="text-zinc-400" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50 max-h-60 w-full">
                            {TECH_JOB_TITLES
                              .filter(job => job.title && job.title.trim() !== '')
                              .map(job => (
                                <SelectItem 
                                  key={job.id} 
                                  value={job.title} 
                                  className="text-left hover:bg-blue-500/10 focus:bg-blue-500/20 transition-colors"
                                >
                                  <div className="flex flex-col items-start w-full">
                                    <div className="font-medium text-white">{job.title}</div>
                                    <div className="text-sm text-blue-300/70 hidden sm:block">{job.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>

                    {/* Resume Upload */}
                    <div className="lg:flex-shrink-0 group">
                      <Label className="text-blue-300 text-sm font-medium mb-3 block flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Your resume
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-gradient-to-r from-blue-600/10 to-blue-700/10 hover:from-blue-600/20 hover:to-blue-700/20 border-2 border-blue-500/30 hover:border-blue-400/50 text-blue-300 hover:text-blue-200 transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 h-12 px-4"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {formData.resume ? "Change" : "Upload"}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                        {formData.resume && (
                          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
                            <FileText className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <span className="text-sm text-green-300 truncate max-w-32 sm:max-w-none">
                              {formData.resume.name.length > 15
                                ? `${formData.resume.name.substring(0, 15)}...`
                                : formData.resume.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-3 group">
                    <Label className="text-blue-300 text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Your experience level
                    </Label>
                    <div className="relative">
                      <Select 
                        value={formData.experienceLevel} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                      >
                        <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-blue-500/50 focus:border-blue-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                          <SelectItem value="Intern" className="hover:bg-blue-500/10 focus:bg-blue-500/20">
                            Intern
                          </SelectItem>
                          <SelectItem value="Entry-level" className="hover:bg-blue-500/10 focus:bg-blue-500/20">
                            Entry-level (0-2 years)
                          </SelectItem>
                          <SelectItem value="Mid-level" className="hover:bg-blue-500/10 focus:bg-blue-500/20">
                            Mid-level (2-5 years)
                          </SelectItem>
                          <SelectItem value="Senior" className="hover:bg-blue-500/10 focus:bg-blue-500/20">
                            Senior (5+ years)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>

                  {/* Number of Questions */}
                  <div className="space-y-3 group">
                    <Label className="text-blue-300 text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      How many questions?
                    </Label>
                    <div className="relative">
                      <Select 
                        value={formData.numberOfQuestions.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfQuestions: parseInt(value) }))}
                      >
                        <SelectTrigger className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-blue-500/50 focus:border-blue-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900/95 backdrop-blur-lg border-2 border-zinc-700/50">
                          {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                            <SelectItem 
                              key={num} 
                              value={num.toString()}
                              className="hover:bg-blue-500/10 focus:bg-blue-500/20"
                            >
                              {num} questions
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>

                  {/* Company Input */}
                  <div className="space-y-3 group">
                    <Label className="text-blue-300 text-sm font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      Target company (optional)
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="e.g., Google, Apple, Meta"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-zinc-900/50 border-2 border-zinc-600/50 hover:border-blue-500/50 focus:border-blue-500 h-12 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/10 placeholder:text-zinc-500"
                      />
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>

                  {/* Start Interview Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleStartInterview}
                      disabled={!isFormValid()}
                      className="w-full h-14 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 text-white rounded-2xl text-base sm:text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.02] active:scale-[0.98] border border-blue-400/20"
                    >
                      <Play className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                      <span>Start Your Journey</span>
                    </Button>
                    
                    {!isFormValid() && (
                      <p className="text-center text-zinc-400 text-sm mt-3">
                        Please select a job title to get started
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Microphone Setup Dialog */}
      <Dialog open={showMicSetup} onOpenChange={setShowMicSetup}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <Mic className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-white">Microphone Setup</DialogTitle>
            </div>
            <DialogDescription className="text-zinc-400">
              Configure your microphone before starting the interview
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Microphone Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Microphone</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkMicrophoneSupport}
                  className="text-zinc-400 hover:text-zinc-300 p-1"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              {micState.isLoading ? (
                <div className="bg-zinc-800 border border-zinc-600 rounded-md p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 text-zinc-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Detecting microphones...</span>
                  </div>
                </div>
              ) : micState.devices.length === 0 ? (
                <div className="bg-zinc-800 border border-zinc-600 rounded-md p-3 text-center">
                  <p className="text-sm text-zinc-400 mb-2">
                    No microphones detected. Please allow microphone access.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkMicrophoneSupport}
                    className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Detect Microphones
                  </Button>
                </div>
              ) : (
                <Select 
                  value={micState.selectedDevice} 
                  onValueChange={(value) => setMicState(prev => ({ ...prev, selectedDevice: value }))}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-600">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {micState.devices
                      .filter(device => device.deviceId && device.deviceId.trim() !== '')
                      .map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Volume</Label>
                <span className="text-zinc-400">{micState.volume}%</span>
              </div>
              <div className="flex items-center space-x-3">
                <Volume2 className="h-4 w-4 text-zinc-400" />
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
              className="flex-1 border-zinc-600 hover:bg-zinc-800"
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
