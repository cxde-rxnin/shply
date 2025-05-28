export interface FlutterwavePaymentData {
  tx_ref: string
  amount: number
  currency: string
  customer: {
    email: string
    name: string
  }
  customizations: {
    title: string
    description: string
    logo: string
  }
}

export interface FlutterwaveResponse {
  status: string
  tx_ref: string
  transaction_id: string
}
