"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"

interface CompactProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
}

export function CompactProductCard({ product, onAddToCart }: CompactProductCardProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [isInWishlist, setIsInWishlist] = useState(product.in_wishlist || false)
  const [wishlistId, setWishlistId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user?.id) {
      checkWishlistStatus()
    }
  }, [user, product.id])

  const checkWishlistStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user?.id)
        .eq("product_id", product.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking wishlist status:", error)
        return
      }

      setIsInWishlist(!!data)
      if (data) {
        setWishlistId(data.id)
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    }
  }

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to add items to wishlist")
      return
    }

    setIsLoading(true)

    try {
      if (isInWishlist && wishlistId) {
        // Remove from wishlist
        const { error } = await supabase.from("wishlist").delete().eq("id", wishlistId)

        if (error) throw error

        setIsInWishlist(false)
        setWishlistId(null)
        toast.success("Removed from wishlist")
      } else {
        // Add to wishlist
        const { data, error } = await supabase
          .from("wishlist")
          .insert({
            user_id: user.id,
            product_id: product.id,
          })
          .select("id")
          .single()

        if (error) throw error

        setIsInWishlist(true)
        setWishlistId(data.id)
        toast.success("Added to wishlist")
      }
    } catch (error) {
      console.error("Error updating wishlist:", error)
      toast.error("Failed to update wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-gray-300"
        }`}
      />
    ))
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-xl bg-black border border-purple-500/20 shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="icon"
          variant="secondary"
          className={`h-8 w-8 rounded-full ${
            isInWishlist ? "bg-red-500 text-white hover:bg-red-600" : "bg-black/50 text-white hover:bg-black"
          }`}
          onClick={toggleWishlist}
          disabled={isLoading}
          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
        </Button>
      </div>

      <Link href={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden relative">
          <Image
            src={product.image_url || "/placeholder.svg?height=200&width=200"}
            alt={product.name}
            width={200}
            height={200}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600 text-xs">
              {product.stock_quantity} left
            </Badge>
          )}

          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-3 py-1">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/products/${product.id}`}>
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-sm font-semibold text-white line-clamp-1">{product.name}</h3>
            {product.category && (
              <Badge variant="secondary" className="text-xs ml-1">
                {product.category.name}
              </Badge>
            )}
          </div>

          <p className="text-xs text-gray-300 mb-2 line-clamp-2">{product.description}</p>
        </Link>

        {/* Rating */}
        {product.review_count && product.review_count > 0 ? (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">{renderStars(product.average_rating || 0)}</div>
            <span className="text-xs text-gray-300">({product.review_count})</span>
          </div>
        ) : (
          <div className="h-4 mb-2" />
        )}

        <div className="flex flex-col gap-2">
          <span className="text-lg font-bold text-purple-400">${product.price.toFixed(2)}</span>

          <Button
            onClick={() => onAddToCart(product.id)}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white h-8"
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            {isMobile ? "" : "Add"}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
