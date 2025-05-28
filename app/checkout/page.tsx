import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { CheckoutForm } from "@/components/checkout/checkout-form"

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

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const totalAmount = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
        <CheckoutForm totalAmount={totalAmount} items={mockCartItems} />
      </div>
    </div>
  )
}
