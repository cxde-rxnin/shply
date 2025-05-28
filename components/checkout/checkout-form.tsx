"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { initializePayment } from "@/app/actions/payment"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CheckoutFormProps {
  totalAmount: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

export function CheckoutForm({ totalAmount, items }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    address: "",
  })
  const router = useRouter()

  const handlePayment = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const paymentData = {
        tx_ref: `tx_${Date.now()}`,
        amount: totalAmount,
        currency: "USD",
        customer: {
          email: customerInfo.email,
          name: customerInfo.name,
        },
        customizations: {
          title: "E-commerce Store",
          description: "Payment for your order",
          logo: "/logo.png",
        },
      }

      const result = await initializePayment(paymentData)

      if (result.success && result.payment_link) {
        // Redirect to Flutterwave payment page
        window.location.href = result.payment_link
      } else {
        toast.error(result.error || "Payment initialization failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="address">Shipping Address</Label>
              <Input
                id="address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your shipping address"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-1">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 font-bold">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            {loading ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
