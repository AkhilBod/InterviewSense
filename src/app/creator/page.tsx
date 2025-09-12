'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface CreatorStats {
  creatorCode: string
  totalSignups: number
  verifiedSignups: number
  signupsByDate: Record<string, { total: number, verified: number }>
  recentSignups: Array<{
    id: string
    createdAt: string
    verified: boolean
  }>
}

export default function CreatorStatsPage() {
  const [creatorCode, setCreatorCode] = useState('Koja')
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    if (!creatorCode.trim()) {
      setError('Please enter a creator code')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/creator/stats?code=${encodeURIComponent(creatorCode)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stats')
      }
      
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch stats for "Koja" on page load
  useEffect(() => {
    fetchStats()
  }, [])

  const generateSignupLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.interviewsense.org'
    return `${baseUrl}/signup?code=${encodeURIComponent(creatorCode)}`
  }

  const generateHomepageLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.interviewsense.org'
    return `${baseUrl}?code=${encodeURIComponent(creatorCode)}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.webp" alt="InterviewSense" width={32} height={32} className="object-contain" />
              <span className="font-bold text-xl">InterviewSense</span>
            </Link>
            <nav>
              <Link href="/">
                <Button variant="ghost" className="text-zinc-300 hover:text-white">
                  Back to Home
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Creator Code Analytics</h1>
          <p className="text-zinc-400">Track signups using your creator code</p>
        </div>

        {/* Creator Code Input */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 mb-8">
          <CardHeader>
            <CardTitle>Enter Creator Code</CardTitle>
            <CardDescription>Enter your creator code to view analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="creator-code">Creator Code</Label>
                <Input
                  id="creator-code"
                  value={creatorCode}
                  onChange={(e) => setCreatorCode(e.target.value)}
                  placeholder="Enter creator code"
                  className="bg-zinc-800/70 border-zinc-700 text-white"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={fetchStats}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500"
                >
                  {loading ? 'Loading...' : 'Get Stats'}
                </Button>
              </div>
            </div>
            
            {creatorCode && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Homepage Link (with creator code)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generateHomepageLink()}
                      readOnly
                      className="bg-zinc-800/70 border-zinc-700 text-white"
                    />
                    <Button 
                      onClick={() => copyToClipboard(generateHomepageLink())}
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:text-white"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Direct Signup Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generateSignupLink()}
                      readOnly
                      className="bg-zinc-800/70 border-zinc-700 text-white"
                    />
                    <Button 
                      onClick={() => copyToClipboard(generateSignupLink())}
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:text-white"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
          </CardContent>
        </Card>

        {/* Stats Display */}
        {stats && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-zinc-800/50 border-zinc-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.totalSignups}</p>
                      <p className="text-sm text-zinc-400">Total Signups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.verifiedSignups}</p>
                      <p className="text-sm text-zinc-400">Verified Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-800/50 border-zinc-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {stats.totalSignups > 0 ? Math.round((stats.verifiedSignups / stats.totalSignups) * 100) : 0}%
                      </p>
                      <p className="text-sm text-zinc-400">Verification Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Signups */}
            <Card className="bg-zinc-800/50 border-zinc-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Signups
                </CardTitle>
                <CardDescription>Latest users who signed up with your code</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentSignups.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentSignups.map((signup) => (
                      <div 
                        key={signup.id} 
                        className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${signup.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className="text-sm text-zinc-300">
                            {new Date(signup.createdAt).toLocaleDateString()} at {new Date(signup.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          signup.verified 
                            ? 'bg-green-900/30 text-green-300' 
                            : 'bg-yellow-900/30 text-yellow-300'
                        }`}>
                          {signup.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-8">No signups yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
