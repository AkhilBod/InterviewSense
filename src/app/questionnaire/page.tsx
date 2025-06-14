'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ChevronLeft, ChevronRight, LightbulbIcon, Mic, Clock, BarChart, FileText } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute'

function Questionnaire() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for questionnaire answers
  const [usageGoals, setUsageGoals] = useState<string[]>([]);
  const [role, setRole] = useState<string>('');
  const [referralSource, setReferralSource] = useState<string>('');
  const [otherReferral, setOtherReferral] = useState<string>('');

  const handleUsageChange = (value: string) => {
    if (usageGoals.includes(value)) {
      setUsageGoals(usageGoals.filter(g => g !== value));
    } else {
      setUsageGoals([...usageGoals, value]);
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setError(null);
    } else {
      try {
        setIsSubmitting(true);
        setError(null);
        
        // Save all answers to localStorage
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.setItem('usageGoals', JSON.stringify(usageGoals));
        localStorage.setItem('role', role);
        localStorage.setItem('referralSource', referralSource === 'Other' ? otherReferral : referralSource);
        
        // Save onboarding status to database
        const response = await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save onboarding status');
        }

        // Only redirect after successful API call
        router.push('/dashboard');
      } catch (error) {
        console.error('Failed to save onboarding status:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-900 text-white flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
              <span className="font-bold text-xl">InterviewSense</span>
            </div>
            {/* Profile dropdown with sign out */}
            <ProfileDropdown />
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left panel - Form */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col">
            {error && (
              <div className="mb-4 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm sm:text-base">
                {error}
              </div>
            )}
            
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {step}
                </div>
                <div className="flex-1">
                  <Progress value={(step / totalSteps) * 100} className="h-2 bg-slate-700" />
                </div>
                <div className="text-slate-400 text-sm">
                  {step}/{totalSteps}
                </div>
              </div>
            </div>

            {/* Step 1: Usage Goals */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">How are you planning to use InterviewSense?</h1>
                <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Choose one option so we can tailor your experience</p>
                <div className="flex flex-col gap-3">
                  {[
                    { value: 'practice-interviews', label: 'Practicing for job interviews' },
                    { value: 'update-resume', label: 'Updating Resume' },
                    { value: 'cover-letters', label: 'Generating Cover Letters' },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={usageGoals[0] === option.value ? "default" : "outline"}
                      className={`justify-start px-4 py-5 sm:py-8 h-auto text-left border border-slate-700 hover:bg-slate-800 ${
                        usageGoals[0] === option.value ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-transparent text-slate-300"
                      }`}
                      onClick={() => setUsageGoals([option.value])}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Role Selection */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">What's your role?</h1>
                <p className="text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">InterviewSense will tailor feedback to your role's communication needs</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                  {[
                    'Management', 'Student', 'Product Management', 'Design',
                    'Business Development', 'Educator', 'Engineering', 'Legal',
                    'Marketing', 'Sales or Customer Service', 'Consulting',
                    'Human Resources', 'Health Care provider', 'Investor',
                    'Administrative', 'Content Creator'
                  ].map((roleOption) => (
                    <Button
                      key={roleOption}
                      variant={role === roleOption ? "default" : "outline"}
                      className={`justify-start px-4 py-4 sm:py-6 h-auto text-left border border-slate-700 hover:bg-slate-800 text-sm sm:text-base ${
                        role === roleOption ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-transparent text-slate-300"
                      }`}
                      onClick={() => setRole(roleOption)}
                    >
                      {roleOption}
                    </Button>
                  ))}
                  
                  <Button 
                    variant={role === 'Other' ? "default" : "outline"}
                    className={`justify-start px-4 py-4 sm:py-6 h-auto text-left border border-slate-700 hover:bg-slate-800 text-sm sm:text-base ${
                      role === 'Other' ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-transparent text-slate-300"
                    }`}
                    onClick={() => setRole('Other')}
                  >
                    + Other
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Features */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">How InterviewSense Will Help You</h1>
                <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-8 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {/* 1. AI-Powered Mock Interviews */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="text-blue-500 mt-1 flex-shrink-0">
                      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-blue-400">AI-Powered Mock Interviews</h3>
                      <p className="text-slate-400 mt-1 text-sm sm:text-base">Generate realistic, role-specific interview questions using advanced AI. Practice with both technical and behavioral questions tailored to your job and industry.</p>
                    </div>
                  </div>
                  {/* 2. Real-Time Voice & Text Analysis */}
                  <div className="flex items-start gap-4">
                    <div className="text-green-500 mt-1">
                      <Mic className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-400">Real-Time Voice & Text Analysis</h3>
                      <p className="text-slate-400 mt-1">Get instant feedback on your spoken or typed answers. The AI analyzes clarity, conciseness, confidence, and relevance.</p>
                    </div>
                  </div>
                  {/* 3. Personalized Feedback & Analytics */}
                  <div className="flex items-start gap-4">
                    <div className="text-purple-500 mt-1">
                      <BarChart className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-400">Personalized Feedback & Analytics</h3>
                      <p className="text-slate-400 mt-1">Receive actionable insights after each answer and interview session. See strengths, areas for improvement, and keyword analysis.</p>
                    </div>
                  </div>
                  {/* 4. Filler Word & Delivery Tracking */}
                  <div className="flex items-start gap-4">
                    <div className="text-yellow-500 mt-1">
                      <LightbulbIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-400">Filler Word & Delivery Tracking</h3>
                      <p className="text-slate-400 mt-1">Detects and counts filler words ("um", "like", etc.) to help you sound more professional. Tracks your speaking pace and talk time.</p>
                    </div>
                  </div>
                  {/* 5. Resume & Cover Letter Tools */}
                  <div className="flex items-start gap-4">
                    <div className="text-pink-500 mt-1">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-pink-400">Resume & Cover Letter Tools</h3>
                      <p className="text-slate-400 mt-1">Instantly check your resume for improvements. Generate personalized cover letters for job applications.</p>
                    </div>
                  </div>
                  {/* 6. Progress Tracking & Growth Insights */}
                  <div className="flex items-start gap-4">
                    <div className="text-cyan-500 mt-1">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-400">Progress Tracking & Growth Insights</h3>
                      <p className="text-slate-400 mt-1">Track your improvement over time with analytics and trends. Monitor completed questions, scores, and keyword mastery.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Referral Source */}
            {step === 4 && (
              <div className="animate-fadeIn">
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-6">How did you hear about InterviewSense?</h1>
                <p className="text-slate-400 mb-4 sm:mb-8 text-sm sm:text-base">Help us understand how you found us</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
                  {['Google Search', 'Social Media', 'Friend or Colleague', 'Online Review', 'Professional Network', 'Other'].map((source) => (
                    <Button
                      key={source}
                      variant={referralSource === source ? "default" : "outline"}
                      className={`justify-start px-4 py-4 sm:py-6 h-auto text-left border border-slate-700 hover:bg-slate-800 text-sm sm:text-base ${
                        referralSource === source ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-transparent text-slate-300"
                      }`}
                      onClick={() => setReferralSource(source)}
                    >
                      {source}
                    </Button>
                  ))}
                </div>
                {referralSource === 'Other' && (
                  <div className="mt-4">
                    <Label htmlFor="other-source" className="font-medium mb-2 block text-sm sm:text-base">
                      Please specify:
                    </Label>
                    <Input 
                      id="other-source" 
                      value={otherReferral}
                      onChange={(e) => setOtherReferral(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Where did you hear about us?"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-auto pt-4 sm:pt-8 pb-8 sm:pb-0 flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={step === 1 || isSubmitting}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 px-3 sm:px-4 py-2 text-sm sm:text-base"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                Back
              </Button>
              
              <Button 
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 text-sm sm:text-base"
                disabled={(step === 1 && usageGoals.length === 0) || (step === 2 && !role) || isSubmitting}
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    {step === totalSteps ? 'Finish' : 'Next'}
                    {step !== totalSteps && <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Right panel - Preview */}
          <div className="bg-slate-800 hidden md:flex items-center justify-center p-8">
            <div className="max-w-md w-full flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center">
                <div className="rounded-full bg-blue-500 h-24 w-24 flex items-center justify-center mb-6 shadow-lg">
                  <Image src="/logo.webp" alt="InterviewSense" width={56} height={56} className="object-contain text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2 text-center">Welcome to InterviewSense</h2>
                <p className="text-slate-300 text-center max-w-xs">
                  Answer a few quick questions so we can personalize your experience and help you ace your next interview!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ProfileDropdown() {
  const { data: session } = useSession();
  if (!session) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 rounded-full focus:outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
            <AvatarFallback className="bg-blue-500">
              {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-900 border-slate-800" align="end">
        <DropdownMenuItem
          className="text-red-400 hover:bg-slate-800 hover:text-red-300 cursor-pointer"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function QuestionnaireWithSuspense() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <Questionnaire />
    </Suspense>
  );
}