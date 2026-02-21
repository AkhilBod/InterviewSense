"use client"

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, UserX, CreditCard, XCircle } from 'lucide-react'
import { deleteUserData } from '@/lib/account'
import { useToast } from '@/components/ui/use-toast'

export function UserAccountDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return
    }

    setIsCanceling(true)

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      toast({
        title: "Subscription canceled",
        description: data.message || "Your subscription will be canceled at the end of the billing period.",
      })
    } catch (error) {
      toast({
        title: "Error canceling subscription",
        description: error instanceof Error ? error.message : "There was a problem canceling your subscription.",
        variant: "destructive",
      })
    } finally {
      setIsCanceling(false)
    }
  }

  const handleDeleteUserData = async () => {
    if (!confirm('Are you sure you want to delete your personal data? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteUserData()

      toast({
        title: "Data deleted successfully",
        description: "Your personal information has been removed.",
      })

      // Optionally sign out after data deletion
      await signOut({ redirect: true, callbackUrl: '/' })
    } catch (error) {
      toast({
        title: "Error deleting data",
        description: "There was a problem deleting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!session?.user) {
    return null
  }

  const initials = session.user.name
    ? session.user.name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Clean minimal design */}
        <Button variant="outline" size="icon" className="rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-primary">
          <Avatar className="h-8 w-8 bg-gray-100 text-primary">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-gray-100 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {/* Clean dropdown content */}
      <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg text-black w-64">
        <div className="flex items-center justify-start gap-3 p-3 border-b border-gray-100">
          <Avatar className="h-10 w-10 bg-gray-100 text-primary">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-gray-100 text-primary font-bold text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5 leading-none">
            {session.user.name && <p className="font-semibold text-black">{session.user.name}</p>}
            {session.user.email && (
              <p className="w-[180px] truncate text-sm text-gray-600">
                {session.user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-700 hover:text-primary focus:text-primary"
          onClick={() => router.push('/dashboard')}
        >
          <User className="mr-2 h-4 w-4 text-primary" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-700 hover:text-primary focus:text-primary"
          onClick={() => router.push('/dashboard/billing')}
        >
          <CreditCard className="mr-2 h-4 w-4 text-primary" />
          Billing
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 text-gray-700 hover:text-primary focus:text-primary"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4 text-primary" />
          Sign Out
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem
          className="cursor-pointer bg-orange-50 text-orange-600 hover:bg-orange-100 focus:bg-orange-100"
          onClick={handleCancelSubscription}
          disabled={isCanceling}
        >
          <XCircle className="mr-2 h-4 w-4" />
          {isCanceling ? 'Canceling...' : 'Cancel Subscription'}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-100" />
        <DropdownMenuItem
          className="cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 focus:bg-red-100"
          onClick={handleDeleteUserData}
          disabled={isDeleting}
        >
          <UserX className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting Data...' : 'Delete My Data'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}