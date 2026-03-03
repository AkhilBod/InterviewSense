'use client'

import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Mic, Volume2 } from "lucide-react"
import { DashboardLayout } from '@/components/DashboardLayout'
import { useProfileData } from '@/hooks/useProfileData'
import { PrefilledChip } from '@/components/ProfileFormComponents'

interface MicrophoneState {
  devices: MediaDeviceInfo[]
  selectedDevice: string
  volume: number
  isSupported: boolean
  isLoading: boolean
}

// ── page-level styles injected once ──────────────────────────────────────────
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');
  body { background: #0a0e1a; overflow-x: hidden; }
  body::after {
    content: '';
    position: fixed;
    bottom: -160px; left: 50%;
    transform: translateX(-50%);
    width: 900px; height: 380px;
    background: radial-gradient(ellipse at center, rgba(37,99,235,0.45) 0%, rgba(99,102,241,0.22) 40%, transparent 75%);
    pointer-events: none;
    z-index: 0;
    filter: blur(8px);
  }
`

export default function StartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { profile, loading: profileLoading } = useProfileData()

  const [company, setCompany] = useState('')
  const [overridingCompany, setOverridingCompany] = useState(false)
  const [showMicSetup, setShowMicSetup] = useState(false)
  const [micState, setMicState] = useState<MicrophoneState>({
    devices: [],
    selectedDevice: '',
    volume: 100,
    isSupported: false,
    isLoading: false,
  })

  // Pre-fill company from profile
  useEffect(() => {
    if (profile.targetCompany) setCompany(profile.targetCompany)
  }, [profile.targetCompany])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    checkMicrophoneSupport()
  }, [status, router])

  const checkMicrophoneSupport = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicState(prev => ({ ...prev, isSupported: false, isLoading: false }))
      return
    }
    setMicState(prev => ({ ...prev, isLoading: true }))
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = devices.filter(d => d.kind === 'audioinput')
      stream.getTracks().forEach(t => t.stop())
      setMicState(prev => ({
        ...prev,
        isSupported: true,
        devices: audioDevices,
        selectedDevice: audioDevices[0]?.deviceId || '',
        isLoading: false,
      }))
    } catch {
      setMicState(prev => ({ ...prev, isSupported: false, isLoading: false }))
    }
  }

  const handleStartInterview = async () => {
    await checkMicrophoneSupport()
    setShowMicSetup(true)
  }

  const handleContinueToInterview = () => {
    // Use profile role if available, fallback to 'Software Engineer'
    const jobTitle = profile.targetRole || 'Software Engineer'
    localStorage.setItem('jobTitle', jobTitle)
    localStorage.setItem('company', company)
    localStorage.setItem('industry', '')
    localStorage.setItem('experienceLevel', 'Mid-level')
    localStorage.setItem('interviewType', 'Behavioral')
    localStorage.setItem('interviewStage', 'Initial Screening')
    localStorage.setItem('jobDescription', '')
    localStorage.setItem('numberOfQuestions', '5')
    router.push('/interview')
  }

  if (status === 'loading' || profileLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 26, height: 26, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    )
  }

  const effectiveCompany = company

  return (
    <DashboardLayout>
      <style>{pageStyles}</style>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 24px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Title */}
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontWeight: 400,
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            color: '#dde2f0',
            marginBottom: 8,
            marginTop: 0,
          }}>
            Behavioral Interview
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.88rem',
            color: '#5a6380',
            marginBottom: 36,
            marginTop: 0,
          }}>
            Practice questions tailored to your background and target role.
          </p>

          {/* Company field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8892b0',
              marginBottom: 7,
            }}>
              Company <span style={{ color: '#4a5370', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>

            {profile.targetCompany && !overridingCompany ? (
              <PrefilledChip
                label="Company"
                value={profile.targetCompany}
                onChangeRequest={() => setOverridingCompany(true)}
              />
            ) : (
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g., Google, Meta, Apple"
                autoFocus={overridingCompany}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.88rem',
                  color: '#dde2f0',
                  outline: 'none',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            )}
          </div>

          {/* Start button */}
          <button
            onClick={handleStartInterview}
            style={{
              width: '100%',
              marginTop: 32,
              padding: 14,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.88rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(37,99,235,0.3)',
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none' }}
          >
            Start Interview
          </button>
        </div>
      </div>

      {/* Microphone Setup Dialog — unchanged functionality */}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Microphone</Label>
                <button
                  type="button"
                  onClick={checkMicrophoneSupport}
                  className="text-zinc-400 hover:text-zinc-300 p-1 bg-transparent border-none cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {micState.isLoading ? (
                <div className="bg-zinc-800 border border-zinc-600 rounded-md p-3 text-center">
                  <div className="flex items-center justify-center space-x-2 text-zinc-400">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Detecting microphones…</span>
                  </div>
                </div>
              ) : micState.devices.length === 0 ? (
                <div className="bg-zinc-800 border border-zinc-600 rounded-md p-3 text-center">
                  <p className="text-sm text-zinc-400 mb-2">No microphones detected. Please allow microphone access.</p>
                  <button type="button" onClick={checkMicrophoneSupport} className="text-sm text-blue-400 underline bg-transparent border-none cursor-pointer">
                    Detect Microphones
                  </button>
                </div>
              ) : (
                <Select
                  value={micState.selectedDevice}
                  onValueChange={value => setMicState(prev => ({ ...prev, selectedDevice: value }))}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-600">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-600">
                    {micState.devices
                      .filter(d => d.deviceId && d.deviceId.trim() !== '')
                      .map(d => (
                        <SelectItem key={d.deviceId} value={d.deviceId}>
                          {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Volume</Label>
                <span className="text-zinc-400">{micState.volume}%</span>
              </div>
              <div className="flex items-center space-x-3">
                <Volume2 className="h-4 w-4 text-zinc-400" />
                <Slider
                  value={[micState.volume]}
                  onValueChange={value => setMicState(prev => ({ ...prev, volume: value[0] }))}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowMicSetup(false)}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#8892b0',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleContinueToInterview}
              style={{
                flex: 1,
                padding: '10px 0',
                background: '#2563eb',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Continue to Interview
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}


