import { ShoppingCartComponent } from "@/components/cart/shopping-cart"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

export default function CartPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <ShoppingCartComponent />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
