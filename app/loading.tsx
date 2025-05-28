"use client"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center"
        >
          <ShoppingBag className="h-8 w-8 text-white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-600 dark:text-gray-300"
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  )
}
