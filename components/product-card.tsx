"use client"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-neutral-900 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="aspect-square overflow-hidden">
        <Image
          src={product.image_url || "/placeholder.svg?height=300&width=300"}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${product.price.toFixed(2)}</span>

          <Button
            onClick={() => onAddToCart(product.id)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={product.stock_quantity === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
