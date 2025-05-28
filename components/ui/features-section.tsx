"use client"
import { motion } from "framer-motion"
import { Truck, CreditCard, Star, Shield } from "lucide-react"

const features = [
  {
    icon: Star,
    title: "Premium Shopping Experience",
    description: "Curated products with exceptional quality and customer service that exceeds expectations.",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    icon: CreditCard,
    title: "Integrated Payment",
    description: "Secure and seamless payment processing with Flutterwave integration for global transactions.",
    gradient: "from-blue-400 to-purple-500",
  },
  {
    icon: Truck,
    title: "24 Hour Shipping",
    description: "Lightning-fast delivery service ensuring your orders reach you within 24 hours.",
    gradient: "from-green-400 to-blue-500",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Your data and transactions are protected with enterprise-grade security measures.",
    gradient: "from-purple-400 to-pink-500",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the future of online shopping with our cutting-edge features designed for your convenience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{feature.title}</h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent group-hover:via-gray-400 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
