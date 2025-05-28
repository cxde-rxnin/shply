"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import { toast } from "sonner"

type User = {
  id: string
  email: string
  name: string
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, role, password")
        .eq("email", email.toLowerCase().trim())
        .single()

      if (error || !data) {
        console.error("Sign in error:", error)
        return { success: false, error: "Invalid email or password" }
      }

      // Simple password check (in production, use proper hashing)
      if (data.password !== password) {
        return { success: false, error: "Invalid email or password" }
      }

      const user = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role || "customer",
      }

      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      return { success: true }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: "Authentication failed" }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, name: string, password: string) => {
    try {
      setLoading(true)

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .single()

      if (existingUser) {
        return { success: false, error: "User already exists with this email" }
      }

      const { data, error } = await supabase
        .from("users")
        .insert({
          email: email.toLowerCase().trim(),
          name: name.trim(),
          password,
          role: "customer",
        })
        .select("id, email, name, role")
        .single()

      if (error) {
        console.error("Sign up error:", error)
        return { success: false, error: "Failed to create account" }
      }

      const user = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      }

      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      return { success: true }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, error: "Failed to create account" }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      // Check if user exists
      const { data: user, error } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email.toLowerCase().trim())
        .single()

      if (error || !user) {
        return { success: false, error: "No account found with this email address" }
      }

      // In a real app, you would send a reset email here
      // For demo purposes, we'll just show a success message
      toast.success("Password reset instructions sent to your email")
      return { success: true }
    } catch (error) {
      console.error("Reset password error:", error)
      return { success: false, error: "Failed to send reset instructions" }
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
