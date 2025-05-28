"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, ShoppingBag, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { WishlistItem } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export function WishlistComponent() {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchWishlistItems()
    }
  }, [user])

  const fetchWishlistItems = async () => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          *,
          product:products(
            *,
            category:categories(*)
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setWishlistItems(data || [])
    } catch (error) {
      console.error("Error fetching wishlist items:", error)
      toast.error("Failed to load wishlist")
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase.from("wishlist").delete().eq("id", itemId)

      if (error) throw error

      setWishlistItems((prev) => prev.filter((item) => item.id !== itemId))
      toast.success("Removed from wishlist")
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Failed to remove from wishlist")
    }
  }

  const addToCart = async (productId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to add items to cart")
      return
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase.from("cart").insert({
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        })

        if (error) throw error
      }

      toast.success("Added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-purple-600 rounded-full">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300">Items you've saved for later</p>
      </motion.div>

      {wishlistItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-black/5 dark:bg-black/40 rounded-full flex items-center justify-center">
            <Heart className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Save items you love to your wishlist and revisit them anytime.
          </p>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900">
              Explore Products
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {wishlistItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group"
              >
                {item.product && (
                  <Card className="overflow-hidden border border-purple-100">
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full bg-black/50 hover:bg-black text-white"
                        onClick={() => removeFromWishlist(item.id)}
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Link href={`/products/${item.product.id}`}>
                      <div className="aspect-square overflow-hidden relative">
                        <Image
                          src={item.product.image_url || "/placeholder.svg?height=200&width=200"}
                          alt={item.product.name}
                          width={200}
                          height={200}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </Link>

                    <div className="p-3">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                          {item.product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          ${item.product.price.toFixed(2)}
                        </span>

                        <Button
                          size="sm"
                          onClick={() => addToCart(item.product_id)}
                          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                          disabled={item.product.stock_quantity === 0}
                        >
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
