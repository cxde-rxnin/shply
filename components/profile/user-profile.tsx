"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, ShoppingBag, Star, LogOut, Package } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Order } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"

export function UserProfile() {
  const { user, signOut } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user?.id) {
      fetchUserOrders()
    }
  }, [user])

  const fetchUserOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            *,
            product:products(*)
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden bg-black border-purple-500/20">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 mb-4">
              <Avatar className="w-24 h-24 border-4 border-black shadow-lg">
                <AvatarFallback className="text-2xl font-bold bg-purple-600 text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left pb-2 flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-white">{user?.name || "User"}</h1>
                <p className="text-gray-300">{user?.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {user?.role === "admin" ? "Administrator" : "Customer"}
                </Badge>
              </div>
              <div className="pb-2">
                <Button variant="outline" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-black border border-purple-500/20">
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-purple-600">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 data-[state=active]:bg-purple-600">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-purple-600">
              <User className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-black border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShoppingBag className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse h-24 bg-gray-800 rounded-lg"></div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No orders yet</p>
                    <p className="text-sm text-gray-400">Start shopping to see your orders here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border border-purple-500/20 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-white">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-300">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                            <p className="font-semibold mt-1 text-white">${order.total_amount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-300">{order.order_items?.length || 0} items</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="bg-black border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Star className="h-5 w-5" />
                  My Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No reviews yet</p>
                  <p className="text-sm text-gray-400">Purchase products to leave reviews</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-black border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="font-medium">Name:</span> {user?.name}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium">Email:</span> {user?.email}
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium">Role:</span> {user?.role}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Preferences</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="font-medium">Notifications:</span> Enabled
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium">Newsletter:</span> Subscribed
                      </p>
                      <p className="text-gray-300">
                        <span className="font-medium">Theme:</span> Dark
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
