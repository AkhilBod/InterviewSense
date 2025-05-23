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
import { User, LogOut, UserX } from 'lucide-react'
import { deleteUserData } from '@/lib/account'
import { useToast } from '@/components/ui/use-toast'

export function UserAccountDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
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
        <Button variant="outline" size="icon" className="rounded-full border-2 border-blue-500 bg-white hover:bg-blue-50">
          <Avatar className="h-8 w-8 bg-blue-100 text-blue-600">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-blue-500 text-white font-bold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
        <div className="flex items-center justify-start gap-2 p-2 bg-blue-50">
          <div className="flex flex-col space-y-1 leading-none">
            {session.user.name && <p className="font-medium text-blue-800">{session.user.name}</p>}
            {session.user.email && (
              <p className="w-[200px] truncate text-sm text-blue-600">
                {session.user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-blue-50 text-blue-800"
          onClick={() => router.push('/dashboard')}
        >
          <User className="mr-2 h-4 w-4 text-blue-600" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer bg-red-500 text-white hover:bg-red-600 focus:bg-red-700 focus:text-white"
          onClick={handleDeleteUserData}
          disabled={isDeleting}
        >
          <UserX className="mr-2 h-4 w-4 text-white" />
          {isDeleting ? 'Deleting...' : 'Delete My Data'}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200" />
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-100" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4 text-gray-600" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}