import { HeroSection } from "@/components/ui/hero-section"
import { FeaturesSection } from "@/components/ui/features-section"
import { CTASection } from "@/components/ui/cta-section"
import { FloatingNav } from "@/components/ui/floating-navbar"
import { Home, ShoppingBag, User, Settings } from "lucide-react"

const navItems = [
  { name: "Home", link: "/", icon: <Home className="h-4 w-4" /> },
  { name: "Products", link: "/products", icon: <ShoppingBag className="h-4 w-4" /> },
  { name: "Sign In", link: "/auth/signin", icon: <User className="h-4 w-4" /> },
  { name: "Admin", link: "/admin", icon: <Settings className="h-4 w-4" /> },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <FloatingNav navItems={navItems} />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  )
}
