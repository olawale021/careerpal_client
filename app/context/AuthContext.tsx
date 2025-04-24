'use client'

import { useAuth } from '@/lib/hooks/useAuth'

// We'll use a simple implementation that wraps the useAuth hook
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

// Re-export the useAuth hook as the main way to access auth functionality
export { useAuth }

// For backward compatibility 
export const useAuthContext = useAuth 