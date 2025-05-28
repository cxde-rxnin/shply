import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

export async function fallbackHandler() {
  return new Response(JSON.stringify({ error: "Authentication service unavailable" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  })
}

// Fallback mechanism
export default function auth(req, res) {
  try {
    return handler(req, res)
  } catch (error) {
    console.error("NextAuth configuration error:", error)
    return fallbackHandler()
  }
}
