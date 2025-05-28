import { CheckoutForm } from "@/components/checkout/checkout-form"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthenticatedLayout } from "@/components/layout/authenticated-layout"

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
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
          <CheckoutForm totalAmount={totalAmount} items={mockCartItems} />
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}
