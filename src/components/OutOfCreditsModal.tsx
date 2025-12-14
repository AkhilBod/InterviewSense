import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Zap, ArrowRight, X } from 'lucide-react'
import Link from 'next/link'

interface OutOfCreditsModalProps {
  isOpen: boolean
  onClose: () => void
  currentCredits: number
  requiredCredits: number
  serviceType: string
}

export function OutOfCreditsModal({
  isOpen,
  onClose,
  currentCredits,
  requiredCredits,
  serviceType,
}: OutOfCreditsModalProps) {
  const getServiceName = (type: string) => {
    const names: Record<string, string> = {
      resume_review: 'Resume Review',
      behavioral_interview: 'Behavioral Interview',
      technical_interview: 'Technical Interview',
      cover_letter: 'Cover Letter Review',
      system_design: 'System Design Session',
      portfolio_review: 'Portfolio Review',
    }
    return names[type] || 'Service'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Zap className="h-5 w-5 text-yellow-500" />
            Out of Credits
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            You need more credits to access {getServiceName(serviceType)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm">Your Current Credits</span>
              <span className="text-white font-semibold text-lg">{currentCredits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Credits Needed</span>
              <span className="text-yellow-500 font-semibold text-lg">{requiredCredits}</span>
            </div>
            <div className="mt-3 bg-red-900/30 border border-red-700/50 rounded p-2">
              <p className="text-red-400 text-xs text-center">
                Short by {requiredCredits - currentCredits} credits
              </p>
            </div>
          </div>

          {/* Credit Costs Reference */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase">Credit Costs</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-zinc-400">Resume Review</p>
                <p className="text-white font-semibold">1 credit</p>
              </div>
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-zinc-400">Behavioral</p>
                <p className="text-white font-semibold">3 credits</p>
              </div>
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-zinc-400">Technical</p>
                <p className="text-white font-semibold">3 credits</p>
              </div>
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-zinc-400">Cover Letter</p>
                <p className="text-white font-semibold">1 credit</p>
              </div>
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-zinc-400">System Design</p>
                <p className="text-white font-semibold">4 credits</p>
              </div>
              <div className="bg-zinc-800/30 rounded p-2">
                <p className="text-zinc-400">Portfolio</p>
                <p className="text-white font-semibold">3 credits</p>
              </div>
            </div>
          </div>

          {/* Plans */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase">Upgrade Your Plan</p>
            
            <Card className="bg-blue-600/10 border-blue-500/50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">Plus Plan</h4>
                    <p className="text-blue-400 font-bold text-lg">$5/month</p>
                  </div>
                  <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">Popular</span>
                </div>
                <p className="text-zinc-300 text-xs mb-3">Unlimited credits for all services</p>
                <Link href="/pricing">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm">
                    Upgrade to Plus <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-zinc-800/30 border-zinc-700/50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold">Pro Plan</h4>
                    <p className="text-green-400 font-bold text-lg">$9/month</p>
                  </div>
                </div>
                <p className="text-zinc-300 text-xs mb-3">Everything in Plus + Advanced features</p>
                <Link href="/pricing">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm">
                    Upgrade to Pro <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Free Option */}
          <div className="bg-zinc-800/30 rounded-lg p-3">
            <p className="text-xs text-zinc-400 mb-2">
              <span className="font-semibold text-blue-400">Free tier users:</span> Get 6 credits every Monday at midnight UTC
            </p>
            <p className="text-xs text-zinc-500">
              Come back next week or upgrade your plan for immediate access.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white"
            >
              Close
            </Button>
            <Link href="/pricing" className="flex-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
