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
        {/* Use primary color for border and hover states, slate for background */}
        <Button variant="outline" size="icon" className="rounded-full border-2 border-primary bg-slate-800 hover:bg-slate-700 hover:border-primary/80">
          {/* Avatar with primary color accents */}
          <Avatar className="h-8 w-8 bg-primary/10 text-primary">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      {/* Dropdown content with slate background and primary accents */}
      <DropdownMenuContent align="end" className="bg-slate-800/90 backdrop-blur-md border-slate-700 shadow-2xl text-slate-200 w-64">
        <div className="flex items-center justify-start gap-3 p-3 bg-slate-700/50">
          <Avatar className="h-10 w-10 bg-primary/10 text-primary">
            <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5 leading-none">
            {session.user.name && <p className="font-semibold text-primary">{session.user.name}</p>}
            {session.user.email && (
              <p className="w-[180px] truncate text-sm text-slate-400">
                {session.user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-slate-700/70 focus:bg-slate-700/70 text-slate-300 hover:text-primary focus:text-primary"
          onClick={() => router.push('/dashboard')}
        >
          <User className="mr-2 h-4 w-4 text-primary/80" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer hover:bg-slate-700/70 focus:bg-slate-700/70 text-slate-300 hover:text-primary focus:text-primary"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4 text-primary/80" />
          Sign Out
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-700" />
        <DropdownMenuItem 
          className="cursor-pointer bg-destructive/20 text-destructive hover:bg-destructive/30 focus:bg-destructive/30 focus:text-destructive/80"
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