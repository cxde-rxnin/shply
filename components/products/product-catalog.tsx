"use client"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"
import { CompactProductCard } from "./compact-product-card"
import { ProductSearch } from "./product-search"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

export function ProductCatalog() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [user])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [products, searchQuery])

  const fetchProducts = async () => {
    try {
      const query = supabase
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

      const { data, error } = await query

      if (error) throw error

      // Calculate average rating for each product
      let productsWithRatings =
        data?.map((product) => ({
          ...product,
          average_rating:
            product.reviews?.length > 0
              ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
              : 0,
          review_count: product.reviews?.length || 0,
        })) || []

      // If user is logged in, check wishlist status
      if (user?.id) {
        const { data: wishlistItems } = await supabase.from("wishlist").select("product_id").eq("user_id", user.id)

        if (wishlistItems) {
          const wishlistProductIds = new Set(wishlistItems.map((item) => item.product_id))
          productsWithRatings = productsWithRatings.map((product) => ({
            ...product,
            in_wishlist: wishlistProductIds.has(product.id),
          }))
        }
      }

      setProducts(productsWithRatings)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
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

      toast.success("Product added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">Premium Product Catalog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-6">
          Discover our curated collection of high-quality products
        </p>

        <div className="max-w-md mx-auto">
          <ProductSearch
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Search products, categories..."
          />
        </div>

        {searchQuery && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for "{searchQuery}"
            </p>
          </div>
        )}
      </motion.div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {searchQuery ? "No products found matching your search." : "No products available at the moment."}
          </p>
          {searchQuery && (
            <button onClick={handleClearSearch} className="text-purple-600 hover:text-purple-800 mt-2 underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <CompactProductCard product={product} onAddToCart={handleAddToCart} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
