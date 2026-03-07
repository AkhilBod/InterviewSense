'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export interface ProfileData {
  resumeUrl: string | null
  resumeFilename: string | null
  targetRole: string | null
  targetCompany: string | null
  jobDescription: string | null
  preferredCodingLanguage: string | null
  onboardingCompleted: boolean
}

const defaultProfile: ProfileData = {
  resumeUrl: null,
  resumeFilename: null,
  targetRole: null,
  targetCompany: null,
  jobDescription: null,
  preferredCodingLanguage: null,
  onboardingCompleted: false,
}

export function useProfileData() {
  const { status } = useSession()
  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/onboarding/status')
      .then((r) => r.json())
      .then((data) => {
        setProfile({
          resumeUrl: data.resumeUrl ?? null,
          resumeFilename: data.resumeFilename ?? null,
          targetRole: data.targetRole ?? null,
          targetCompany: data.targetCompany ?? null,
          jobDescription: data.jobDescription ?? null,
          preferredCodingLanguage: data.preferredCodingLanguage ?? null,
          onboardingCompleted: data.onboardingCompleted ?? false,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  return { profile, loading }
}
