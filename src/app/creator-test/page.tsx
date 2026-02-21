'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, Copy, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CreatorTestPage() {
  const [currentUrl, setCurrentUrl] = useState('')
  const [creatorCode, setCreatorCode] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin)
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        setCreatorCode(code)
      }
    }
  }, [])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const testLinks = [
    {
      title: 'Homepage with Creator Code',
      url: `${currentUrl}?code=Koja`,
      description: 'Test the homepage with your creator code'
    },
    {
      title: 'Direct Signup Link',
      url: `${currentUrl}/signup?code=Koja`,
      description: 'Direct link to signup with creator code'
    },
    {
      title: 'Analytics Dashboard',
      url: `${currentUrl}/creator`,
      description: 'View signup statistics and metrics'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.ibb.co/hJC8n6NB/Generated-Image-February-20-2026-7-04-PM-Photoroom.png" alt="InterviewSense" width={40} height={40} className="object-contain" />
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
          <h1 className="text-3xl font-bold mb-2">Creator Code Test Page</h1>
          <p className="text-zinc-400">Test your creator code functionality across environments</p>
        </div>

        {/* Current Status */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 mb-8">
          <CardHeader>
            <CardTitle>Current Environment</CardTitle>
            <CardDescription>Information about your current session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Current Domain:</strong> <span className="text-blue-400">{currentUrl}</span>
            </div>
            {creatorCode && (
              <div className="flex items-center gap-2 p-3 bg-blue-900/30 border border-blue-800 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                <span>Creator code detected: <strong>{creatorCode}</strong></span>
              </div>
            )}
            {!creatorCode && (
              <div className="text-zinc-400">
                No creator code detected in URL. Add <code>?code=Koja</code> to test.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Links */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Test Links</h2>
          
          <div className="grid gap-4">
            {testLinks.map((link, index) => (
              <Card key={index} className="bg-zinc-800/50 border-zinc-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{link.title}</h3>
                      <p className="text-zinc-400 text-sm mb-3">{link.description}</p>
                      <code className="text-xs bg-zinc-900/50 px-2 py-1 rounded break-all">
                        {link.url}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(link.url, link.title)}
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 text-zinc-300 hover:text-white"
                      >
                        {copied === link.title ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500"
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Production URLs */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 mt-8">
          <CardHeader>
            <CardTitle>Production URLs (interviewsense.org)</CardTitle>
            <CardDescription>Use these links for sharing in production</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: 'Production Homepage',
                url: 'https://www.interviewsense.org?code=Koja'
              },
              {
                title: 'Production Signup',
                url: 'https://www.interviewsense.org/signup?code=Koja'
              },
              {
                title: 'Production Analytics',
                url: 'https://www.interviewsense.org/creator'
              }
            ].map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg">
                <div>
                  <div className="font-medium">{link.title}</div>
                  <code className="text-xs text-zinc-400">{link.url}</code>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => copyToClipboard(link.url, `prod-${link.title}`)}
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:text-white"
                  >
                    {copied === `prod-${link.title}` ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:text-white"
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
