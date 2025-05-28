"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"

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
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, role, password")
        .eq("email", email)
        .single()

      if (error || !data) {
        return { success: false, error: "Invalid email or password" }
      }

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
    }
  }

  const signUp = async (email: string, name: string, password: string) => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

      if (existingUser) {
        return { success: false, error: "User already exists with this email" }
      }

      const { data, error } = await supabase
        .from("users")
        .insert({
          email,
          name,
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
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
