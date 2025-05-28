export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "admin"
  created_at: string
  updated_at: string
  address?: string
  phone?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image_url?: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  image_url?: string
  category_id?: string
  stock_quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
  reviews?: Review[]
  average_rating?: number
  review_count?: number
  in_wishlist?: boolean
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  product?: Product
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_reference?: string
  shipping_address?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  product?: Product
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  order_id: string
  rating: number
  comment?: string
  created_at: string
  updated_at: string
  user?: User
}
