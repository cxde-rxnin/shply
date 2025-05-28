import { CheckoutForm } from "@/components/checkout/checkout-form"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { Home, ShoppingBag, User } from "lucide-react"

const navItems = [
  { name: "Home", link: "/", icon: <Home className="h-4 w-4" /> },
  { name: "Products", link: "/products", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Cart", link: "/cart", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Profile", link: "/profile", icon: <User className="h-4 w-4" /> },
]

// Mock cart items for demonstration
const mockCartItems = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    quantity: 1,
  },
  {
    id: "2",
    name: "Smart Fitness Watch",
    price: 199.99,
    quantity: 2,
  },
]

export default function CheckoutPage() {
  const totalAmount = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <FloatingNav navItems={navItems} />
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
          <CheckoutForm totalAmount={totalAmount} items={mockCartItems} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
