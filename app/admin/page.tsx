import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Home, Package, ShoppingBag, Users, BarChart3 } from "lucide-react"

const navItems = [
  { name: "Home", link: "/", icon: <Home className="h-4 w-4" /> },
  { name: "Products", link: "/admin/products", icon: <Package className="h-4 w-4" /> },
  { name: "Orders", link: "/admin/orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Users", link: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { name: "Analytics", link: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
]

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <FloatingNav navItems={navItems} />
        <AdminDashboard />
      </div>
    </ProtectedRoute>
  )
}
