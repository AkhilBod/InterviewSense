// src/app/providers.tsx
'use client' // This component must be a client component

import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function Providers({ children }: Props) {
  // No need to pass session prop in v5, it's handled automatically
  return <SessionProvider>{children}</SessionProvider>
}