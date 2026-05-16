export type Gender = 'male' | 'female' | 'unisex'
export type Intensity = 'light' | 'moderate' | 'strong'
export type ScentFamily = 'oud' | 'floral' | 'woody' | 'fresh' | 'oriental' | 'citrus' | 'musky'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export interface Accord {
  name: string
  color: string
}

export interface ProductPrices {
  musk?: Record<string, number>
  spray?: Record<string, number>
}

export interface Product {
  id: string
  name: string
  gender: Gender
  image_url: string
  description: string
  in_stock: boolean
  scent_family: ScentFamily[]
  season: Season[]
  intensity: Intensity
  accords: Accord[]
  prices: ProductPrices
  created_at: string
}

export interface CartItem {
  product: Product
  type: 'musk' | 'spray'
  ml: number
  price: number
  quantity: number
}

export interface OrderItem {
  name: string
  type: 'musk' | 'spray'
  ml: number
  price: number
  quantity: number
  image_url: string
}

export interface Order {
  id: string
  order_number: string
  items: OrderItem[]
  total_price: number
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
}
