import { ShoppingCartComponent } from "@/components/cart/shopping-cart"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Home, ShoppingBag, User } from "lucide-react"

const navItems = [
  { name: "Home", link: "/", icon: <Home className="h-4 w-4" /> },
  { name: "Products", link: "/products", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Cart", link: "/cart", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Profile", link: "/profile", icon: <User className="h-4 w-4" /> },
]

export default function CartPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <FloatingNav navItems={navItems} />
        <ShoppingCartComponent />
      </div>
    </ProtectedRoute>
  )
}
