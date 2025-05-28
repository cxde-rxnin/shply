"use client"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { verifyPayment } from "@/app/actions/payment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [transactionData, setTransactionData] = useState<any>(null)

  useEffect(() => {
    const transactionId = searchParams.get("transaction_id")
    const txRef = searchParams.get("tx_ref")

    if (transactionId) {
      handlePaymentVerification(transactionId)
    } else {
      setStatus("failed")
    }
  }, [searchParams])

  const handlePaymentVerification = async (transactionId: string) => {
    try {
      const result = await verifyPayment(transactionId)

      if (result.success) {
        setStatus("success")
        setTransactionData(result.transaction)
        // Here you would typically:
        // 1. Create the order in your database
        // 2. Clear the cart
        // 3. Send confirmation email
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
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )

      case "success":
        return (
          <div className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
            {transactionData && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">Transaction Details:</h3>
                <p>
                  <strong>Transaction ID:</strong> {transactionData.id}
                </p>
                <p>
                  <strong>Amount:</strong> {transactionData.currency} {transactionData.amount}
                </p>
                <p>
                  <strong>Reference:</strong> {transactionData.tx_ref}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Button onClick={() => router.push("/orders")} className="w-full">
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
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">We couldn't process your payment. Please try again.</p>
            <div className="space-y-2">
              <Button onClick={() => router.push("/cart")} className="w-full">
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Payment Status</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  )
}
