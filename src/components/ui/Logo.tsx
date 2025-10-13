import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function Logo({ 
  size = 32, 
  width, 
  height, 
  className = "object-contain",
  priority = false
}: LogoProps) {
  const logoWidth = width || size
  const logoHeight = height || size

  return (
    <Image 
      src="/app-icon.svg" 
      alt="InterviewSense" 
      width={logoWidth} 
      height={logoHeight} 
      className={cn("object-contain", className)}
      priority={priority}
      // Add static import for better optimization
      unoptimized={false}
    />
  )
}
