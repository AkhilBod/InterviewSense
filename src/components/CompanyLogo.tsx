'use client'

import { Building2 } from 'lucide-react'
import { useState } from 'react'

interface CompanyLogoProps {
  companyName: string
  companySlug: string
}

export default function CompanyLogo({ companyName, companySlug }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <>
      {!imgError ? (
        <img
          src={`https://img.logo.dev/${companySlug}.com?token=pk_Qc_me_jVR_W-pQM8CWOeAw`}
          alt={`${companyName} logo`}
          className="inline-block w-20 h-20 mb-8 rounded-2xl object-contain"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(29,100,255,0.2)', padding: '12px' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="inline-flex items-center justify-center w-20 h-20 mb-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(29,100,255,0.2)' }}>
          <Building2 className="h-10 w-10" style={{ color: '#1877f2' }} />
        </div>
      )}
    </>
  )
}
