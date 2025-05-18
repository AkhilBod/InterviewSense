'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  let errorMessage = 'An error occurred during authentication'

  switch (error) {
    case 'Configuration':
      errorMessage = 'There is a problem with the server configuration'
      break
    case 'AccessDenied':
      errorMessage = 'You do not have permission to sign in'
      break
    case 'Verification':
      errorMessage = 'The verification link is no longer valid'
      break
    case 'OAuthSignin':
      errorMessage = 'Error in constructing an authorization URL'
      break
    case 'OAuthCallback':
      errorMessage = 'Error in handling the response from OAuth provider'
      break
    case 'OAuthCreateAccount':
      errorMessage = 'Could not create OAuth provider user in the database'
      break
    case 'EmailCreateAccount':
      errorMessage = 'Could not create email provider user in the database'
      break
    case 'Callback':
      errorMessage = 'Error in the OAuth callback handler'
      break
    case 'OAuthAccountNotLinked':
      errorMessage = 'Email already in use with different sign in method'
      break
    case 'EmailSignin':
      errorMessage = 'Check your email for the sign in link'
      break
    case 'CredentialsSignin':
      errorMessage = 'Invalid email or password'
      break
    case 'SessionRequired':
      errorMessage = 'Please sign in to access this page'
      break
    default:
      errorMessage = 'An error occurred during sign in'
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      <div className="flex-1 py-12 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="container px-4 max-w-md relative z-10">
          <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="space-y-2 pt-8">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-center text-white">Authentication Error</CardTitle>
              <CardDescription className="text-center text-zinc-400">
                {errorMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-8">
              <div className="flex flex-col space-y-4">
                <Button 
                  onClick={() => router.back()}
                  variant="outline" 
                  className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full"
                >
                  Go back
                </Button>
                
                <Link href="/login">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full" 
                  >
                    Try again
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-zinc-900 to-black">
        <div className="w-full max-w-md p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400 text-center">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
} 