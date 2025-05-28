import { ProductDetails } from "@/components/products/product-details"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <ProductDetails productId={params.id} />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
