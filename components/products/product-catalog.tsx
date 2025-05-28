"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import type { Product } from "@/lib/types"
import { ProductCard } from "./enhanced-product-card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion } from "framer-motion"

export function ProductCatalog() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
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
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Calculate average rating for each product
      const productsWithRatings =
        data?.map((product) => ({
          ...product,
          average_rating:
            product.reviews?.length > 0
              ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
              : 0,
          review_count: product.reviews?.length || 0,
        })) || []

      setProducts(productsWithRatings)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to add items to cart")
      return
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", session.user.id)
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
          user_id: session.user.id,
          product_id: productId,
          quantity: 1,
        })

        if (error) throw error
      }

      toast.success("Product added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Premium Product Catalog</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Discover our curated collection of high-quality products
        </p>
      </motion.div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-300 text-lg">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} onAddToCart={handleAddToCart} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
