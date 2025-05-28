import { ProductCatalog } from "@/components/products/product-catalog"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

export default function ProductsPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <ProductCatalog />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
