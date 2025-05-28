"use client"
import { AppSidebar } from "./app-sidebar"
import type React from "react"

import { useAuth } from "@/lib/auth-context"

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppSidebar />
      <div className="md:ml-20 pb-16 md:pb-0">{children}</div>
    </div>
  )
}
