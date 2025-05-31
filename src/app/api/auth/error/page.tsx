'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Brain, User, LogOut, AlertCircle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

function ErrorContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

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
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-zinc-950/80 border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            <Link href="/" className="font-bold text-xl">
              InterviewSense
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ''} alt={session.user?.name || 'User'} />
                      <AvatarFallback className="bg-blue-500">
                        {session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700" align="end">
                  <DropdownMenuLabel className="text-zinc-400">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem asChild className="text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer">
                    <Link href="/">Home</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
                    onClick={() => router.back()}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-400 hover:bg-zinc-800 hover:text-red-300 cursor-pointer"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild className="text-zinc-300 border-zinc-700 hover:bg-zinc-800">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

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