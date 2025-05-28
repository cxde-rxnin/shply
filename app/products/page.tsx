import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ProductCatalog } from "@/components/products/product-catalog"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { Home, ShoppingBag, User } from "lucide-react"

const navItems = [
  { name: "Home", link: "/", icon: <Home className="h-4 w-4" /> },
  { name: "Products", link: "/products", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Cart", link: "/cart", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Profile", link: "/profile", icon: <User className="h-4 w-4" /> },
]

export default async function ProductsPage() {
  let session

  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.error("Session error:", error)
    redirect("/auth/signin")
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <FloatingNav navItems={navItems} />
      <ProductCatalog />
    </div>
  )
}
