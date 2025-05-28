"use server"

import type { FlutterwavePaymentData } from "@/lib/flutterwave"

export async function initializePayment(paymentData: FlutterwavePaymentData) {
  try {
    // Initialize payment with Flutterwave API
    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: paymentData.tx_ref,
        amount: paymentData.amount,
        currency: paymentData.currency,
        redirect_url: `${process.env.NEXTAUTH_URL}/payment/callback`,
        customer: paymentData.customer,
        customizations: paymentData.customizations,
        payment_options: "card,banktransfer,ussd",
      }),
    })

    const data = await response.json()

    if (data.status === "success") {
      return {
        success: true,
        payment_link: data.data.link,
        tx_ref: paymentData.tx_ref,
      }
    } else {
      return {
        success: false,
        error: data.message || "Payment initialization failed",
      }
    }
  } catch (error) {
    console.error("Payment initialization error:", error)
    return {
      success: false,
      error: "Failed to initialize payment",
    }
  }
}

export async function verifyPayment(transactionId: string) {
  try {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (data.status === "success" && data.data.status === "successful") {
      return {
        success: true,
        transaction: data.data,
      }
    } else {
      return {
        success: false,
        error: "Payment verification failed",
      }
    }
  } catch (error) {
    console.error("Payment verification error:", error)
    return {
      success: false,
      error: "Failed to verify payment",
    }
  }
}
