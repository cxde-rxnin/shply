import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "./supabase"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          if (credentials.isSignUp === "true") {
            // Sign up logic - simplified without bcrypt for next-lite
            const { data, error } = await supabase
              .from("users")
              .insert({
                email: credentials.email,
                name: credentials.name || "",
                password: credentials.password, // In production, this should be hashed
              })
              .select()
              .single()

            if (error) {
              console.error("Sign up error:", error)
              return null
            }

            return {
              id: data.id,
              email: data.email,
              name: data.name,
              role: data.role || "customer",
            }
          } else {
            // Sign in logic - simplified password check
            const { data: user, error } = await supabase
              .from("users")
              .select("*")
              .eq("email", credentials.email)
              .eq("password", credentials.password) // In production, compare hashed passwords
              .single()

            if (error || !user) {
              console.error("Sign in error:", error)
              return null
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role || "customer",
            }
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
}
