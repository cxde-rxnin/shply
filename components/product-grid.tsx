"use client"
import { useEffect, useState } from "react"
import type { Product } from "@/lib/types"
import { ProductCard } from "./product-card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function ProductGrid() {
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
          category:categories(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      // For now, we'll just show a success message
      // In a real app, you'd check authentication and add to cart
      toast.success("Product added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
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
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Featured Products</h2>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-300 text-lg">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  )
}
