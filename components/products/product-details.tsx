"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Heart, Star, ArrowLeft, Package, Shield, Truck, Plus, Minus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Product } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"

interface ProductDetailsProps {
  productId: string
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistId, setWishlistId] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productId, user])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          reviews(
            id,
            rating,
            comment,
            created_at,
            user:users(name)
          )
        `)
        .eq("id", productId)
        .eq("is_active", true)
        .single()

      if (error) throw error

      // Calculate average rating
      const productWithRating = {
        ...data,
        average_rating:
          data.reviews?.length > 0
            ? data.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / data.reviews.length
            : 0,
        review_count: data.reviews?.length || 0,
      }

      setProduct(productWithRating)

      // Check wishlist status if user is logged in
      if (user?.id) {
        const { data: wishlistData } = await supabase
          .from("wishlist")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .single()

        if (wishlistData) {
          setIsInWishlist(true)
          setWishlistId(wishlistData.id)
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Failed to load product")
      router.push("/products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user?.id) {
      toast.error("Please sign in to add items to cart")
      return
    }

    setAddingToCart(true)

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
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase.from("cart").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        })

        if (error) throw error
      }

      toast.success(`Added ${quantity} item(s) to cart!`)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const toggleWishlist = async () => {
    if (!user?.id) {
      toast.error("Please sign in to add items to wishlist")
      return
    }

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
            product_id: productId,
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
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-gray-400"
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-800 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-gray-300 mb-6">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/products")} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-gray-300 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-2xl bg-gray-900 border border-purple-500/20">
              <Image
                src={product.image_url || "/placeholder.svg?height=600&width=600"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {product.stock_quantity === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Badge variant="destructive" className="text-lg px-6 py-2">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-white">{product.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleWishlist}
                  className={`${isInWishlist ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}`}
                >
                  <Heart className={`h-6 w-6 ${isInWishlist ? "fill-current" : ""}`} />
                </Button>
              </div>

              {product.category && (
                <Badge variant="secondary" className="mb-4">
                  {product.category.name}
                </Badge>
              )}

              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-purple-400">${product.price.toFixed(2)}</span>
                {product.stock_quantity < 10 && product.stock_quantity > 0 && (
                  <Badge className="bg-orange-500">Only {product.stock_quantity} left</Badge>
                )}
              </div>

              {/* Rating */}
              {product.review_count > 0 ? (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">{renderStars(product.average_rating || 0)}</div>
                  <span className="text-gray-300">
                    {product.average_rating?.toFixed(1)} ({product.review_count} reviews)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                  <Star className="h-5 w-5" />
                  <span>No reviews yet</span>
                </div>
              )}
            </div>

            <Separator className="bg-gray-700" />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            <Separator className="bg-gray-700" />

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-600 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 p-0 text-white hover:bg-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                      className="h-10 w-10 p-0 text-white hover:bg-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-gray-400 text-sm">{product.stock_quantity} available</span>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || addingToCart}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 h-12 text-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            {/* Product Features */}
            <Card className="bg-gray-900 border-purple-500/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Truck className="h-6 w-6 text-green-400" />
                    <span className="text-sm text-gray-300">Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-400" />
                    <span className="text-sm text-gray-300">Secure Payment</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-6 w-6 text-purple-400" />
                    <span className="text-sm text-gray-300">Fast Delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-6">Customer Reviews</h3>
            <div className="space-y-4">
              {product.reviews.map((review: any) => (
                <Card key={review.id} className="bg-gray-900 border-purple-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">{renderStars(review.rating)}</div>
                        <span className="font-medium text-white">{review.user?.name || "Anonymous"}</span>
                      </div>
                      <span className="text-sm text-gray-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    {review.comment && <p className="text-gray-300">{review.comment}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
