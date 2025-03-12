"use client";

import { usePathname } from 'next/navigation'
import { SidebarLayout } from './SidebarLayout'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname)
  const isHomePage = pathname === "/"

  return (
    <div className="min-h-screen bg-gray-100">
      {!isAuthPage && !isHomePage ? (
        <SidebarLayout>{children}</SidebarLayout>
      ) : (
        <main className="p-8">
          {children}
        </main>
      )}
    </div>
  )
} 