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
    <div className="min-h-screen bg-black">
      <AppSidebar />
      <div className="md:ml-20 pb-16 md:pb-0">{children}</div>
    </div>
  )
}
