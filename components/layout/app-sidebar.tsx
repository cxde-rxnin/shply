"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, User, Settings, LogOut, Heart, Package, Users, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const sidebarItems: SidebarItem[] = [
  { name: "Products", href: "/products", icon: ShoppingBag },
  { name: "Wishlist", href: "/wishlist", icon: Heart },
  { name: "Cart", href: "/cart", icon: Package },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Admin", href: "/admin", icon: BarChart3, adminOnly: true },
  { name: "Users", href: "/admin/users", icon: Users, adminOnly: true },
]

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (user?.id) {
      fetchCartCount()
    }
  }, [user])

  const fetchCartCount = async () => {
    try {
      const { data, error } = await supabase.from("cart").select("quantity").eq("user_id", user?.id)

      if (error) throw error

      const totalItems = data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
      setCartCount(totalItems)
    } catch (error) {
      console.error("Error fetching cart count:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
      router.push("/")
    } catch (error) {
      toast.error("Failed to sign out")
    }
  }

  const filteredItems = sidebarItems.filter((item) => !item.adminOnly || user?.role === "admin")

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-4 left-4 z-40">
        <div className="flex flex-col h-full">
          <motion.div
            className="flex flex-col h-full rounded-2xl bg-black/30 backdrop-blur-lg border border-white/10 shadow-xl overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* User Avatar */}
            <div className="flex justify-center py-6">
              <Avatar className="h-10 w-10 ring-2 ring-purple-400">
                <AvatarFallback className="bg-purple-600 text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 space-y-4">
              {filteredItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} className="group relative" title={item.name}>
                    <div
                      className={cn(
                        "flex justify-center p-3 rounded-xl transition-all duration-200",
                        isActive
                          ? "bg-purple-600 text-white shadow-lg"
                          : "text-gray-300 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <item.icon className="h-5 w-5" />

                      {/* Cart Badge */}
                      {item.name === "Cart" && cartCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                          {cartCount}
                        </Badge>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Sign Out (Desktop only) */}
            <div className="p-2 mb-4">
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="icon"
                className="w-full flex justify-center text-gray-300 hover:bg-red-600/20 hover:text-red-300 rounded-xl p-3"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 md:hidden z-30">
        <div className="flex items-center justify-around py-2">
          {filteredItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 relative",
                  isActive ? "text-purple-400" : "text-gray-300 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>

                {/* Cart Badge */}
                {item.name === "Cart" && cartCount > 0 && (
                  <Badge className="absolute -top-1 right-0 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
