"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, MessageCircle } from "lucide-react"

interface EnhancedProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: EnhancedProductCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden relative">
        <Image
          src={product.image_url || "/placeholder.svg?height=300&width=300"}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {product.stock_quantity < 10 && product.stock_quantity > 0 && (
          <Badge className="absolute top-3 left-3 bg-orange-500 hover:bg-orange-600">
            Only {product.stock_quantity} left
          </Badge>
        )}

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{product.description}</p>

        {/* Rating and Reviews */}
        {product.review_count && product.review_count > 0 ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">{renderStars(product.average_rating || 0)}</div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {product.average_rating?.toFixed(1)} ({product.review_count})
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">No reviews yet</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</span>
            {product.category && <span className="text-xs text-gray-500">{product.category.name}</span>}
          </div>

          <Button
            onClick={() => onAddToCart(product.id)}
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
}
