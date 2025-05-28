"use client"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyPayment, clearCart, createOrder } from "@/app/actions/payment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [transactionData, setTransactionData] = useState<any>(null)

  useEffect(() => {
    const transactionId = searchParams.get("transaction_id")
    const txRef = searchParams.get("tx_ref")

    if (transactionId && user?.id) {
      handlePaymentVerification(transactionId)
    } else {
      setStatus("failed")
    }
  }, [searchParams, user])

  const handlePaymentVerification = async (transactionId: string) => {
    try {
      const result = await verifyPayment(transactionId)

      if (result.success && user?.id) {
        // Get cart items before clearing
        const { data: cartItems } = await supabase
          .from("cart")
          .select(`
            *,
            product:products(price)
          `)
          .eq("user_id", user.id)

        if (cartItems && cartItems.length > 0) {
          // Create order
          const orderData = {
            user_id: user.id,
            total_amount: result.transaction.amount,
            payment_reference: result.transaction.tx_ref,
            cart_items: cartItems.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.product?.price || 0,
            })),
          }

          const orderResult = await createOrder(orderData)

          if (orderResult.success) {
            // Clear cart after successful order creation
            await clearCart(user.id)
            setStatus("success")
            setTransactionData(result.transaction)
          } else {
            setStatus("failed")
          }
        } else {
          setStatus("failed")
        }
      } else {
        setStatus("failed")
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      setStatus("failed")
    }
  }

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
            <h2 className="text-xl font-semibold mb-2 text-white">Verifying Payment</h2>
            <p className="text-gray-300">Please wait while we confirm your payment...</p>
          </div>
        )

      case "success":
        return (
          <div className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h2>
            <p className="text-gray-300 mb-4">Your payment has been processed successfully.</p>
            {transactionData && (
              <div className="bg-gray-900 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2 text-white">Transaction Details:</h3>
                <p className="text-gray-300">
                  <strong>Transaction ID:</strong> {transactionData.id}
                </p>
                <p className="text-gray-300">
                  <strong>Amount:</strong> {transactionData.currency} {transactionData.amount}
                </p>
                <p className="text-gray-300">
                  <strong>Reference:</strong> {transactionData.tx_ref}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={() => router.push("/profile")} className="w-full bg-purple-600 hover:bg-purple-700">
                View Orders
              </Button>
              <Button variant="outline" onClick={() => router.push("/products")} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </div>
        )

      case "failed":
        return (
          <div className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Payment Failed</h2>
            <p className="text-gray-300 mb-6">We couldn't process your payment. Please try again.</p>
            <div className="space-y-2">
              <Button onClick={() => router.push("/cart")} className="w-full bg-purple-600 hover:bg-purple-700">
                Return to Cart
              </Button>
              <Button variant="outline" onClick={() => router.push("/products")} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-center text-white">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>{renderContent()}</CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
