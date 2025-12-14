'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ResendVerificationButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleResend = async () => {
    setLoading(true)
    setMessage(null)

    const res = await fetch('/api/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setMessage(data.message)
    setLoading(false)
  }

  return (
    <div className="text-center mt-4">
      <Button
        onClick={handleResend}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-500 text-white"
      >
        {loading ? "Sending..." : "Resend Verification Email"}
      </Button>
      {message && <p className="text-sm text-zinc-400 mt-2">{message}</p>}
    </div>
  )
}
