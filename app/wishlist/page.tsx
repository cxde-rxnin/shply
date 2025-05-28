import { WishlistComponent } from "@/components/wishlist/wishlist"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <WishlistComponent />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
