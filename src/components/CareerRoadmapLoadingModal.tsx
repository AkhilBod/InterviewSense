'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp,
  Target,
  BookOpen,
  Users,
  Award,
  CheckCircle
} from "lucide-react"

interface LoadingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  duration: number
}

const LOADING_STEPS: LoadingStep[] = [
  {
    id: 'analyzing',
    title: 'Analyzing Current Position',
    description: 'Evaluating your current role and experience level',
    icon: <Target className="h-5 w-5" />,
    duration: 2000
  },
  {
    id: 'planning',
    title: 'Creating Career Path',
    description: 'Designing your personalized roadmap phases',
    icon: <TrendingUp className="h-5 w-5" />,
    duration: 2500
  },
  {
    id: 'skills',
    title: 'Mapping Skill Requirements',
    description: 'Identifying technical and soft skills needed',
    icon: <BookOpen className="h-5 w-5" />,
    duration: 2000
  },
  {
    id: 'networking',
    title: 'Finding Growth Opportunities',
    description: 'Discovering communities and learning resources',
    icon: <Users className="h-5 w-5" />,
    duration: 1800
  },
  {
    id: 'finalizing',
    title: 'Finalizing Your Roadmap',
    description: 'Compiling actionable recommendations',
    icon: <Award className="h-5 w-5" />,
    duration: 1500
  }
]

interface CareerRoadmapLoadingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CareerRoadmapLoadingModal({ isOpen, onClose }: CareerRoadmapLoadingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setProgress(0)
      setCompletedSteps([])
      return
    }

    const totalDuration = LOADING_STEPS.reduce((sum, step) => sum + step.duration, 0)
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += 100
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100)
      setProgress(newProgress)

      // Update current step based on elapsed time
      let cumulativeDuration = 0
      let newCurrentStep = 0
      const newCompletedSteps: string[] = []

      for (let i = 0; i < LOADING_STEPS.length; i++) {
        cumulativeDuration += LOADING_STEPS[i].duration
        if (elapsed >= cumulativeDuration) {
          newCompletedSteps.push(LOADING_STEPS[i].id)
        } else if (elapsed >= cumulativeDuration - LOADING_STEPS[i].duration) {
          newCurrentStep = i
          break
        }
      }

      setCurrentStep(newCurrentStep)
      setCompletedSteps(newCompletedSteps)

      if (elapsed >= totalDuration) {
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [isOpen])

  const getStepStatus = (stepId: string, index: number) => {
    if (completedSteps.includes(stepId)) return 'completed'
    if (index === currentStep) return 'current'
    return 'pending'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-amber-500/20 text-white">
        <div className="flex flex-col items-center space-y-6 py-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-amber-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-semibold text-amber-400">
              Creating Your Career Roadmap
            </h2>
            <p className="text-sm text-zinc-400">
              Analyzing your career path and building personalized recommendations
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Progress</span>
              <span className="text-amber-400 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-zinc-800"
            />
          </div>

          {/* Loading Steps */}
          <div className="w-full space-y-3">
            {LOADING_STEPS.map((step, index) => {
              const status = getStepStatus(step.id, index)
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    status === 'completed'
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : status === 'current'
                      ? 'bg-amber-500/5 border border-amber-500/10 shadow-lg shadow-amber-500/5'
                      : 'bg-zinc-800/30 border border-zinc-700/50'
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    status === 'completed'
                      ? 'text-amber-400'
                      : status === 'current'
                      ? 'text-amber-500 animate-pulse'
                      : 'text-zinc-500'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      status === 'completed' || status === 'current'
                        ? 'text-white'
                        : 'text-zinc-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className={`text-xs ${
                      status === 'completed' || status === 'current'
                        ? 'text-amber-300/70'
                        : 'text-zinc-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-zinc-500">
              This may take a few moments while we analyze market trends and career data
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 