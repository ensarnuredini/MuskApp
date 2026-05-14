export type Gender = 'male' | 'female' | 'unisex'
export type Intensity = 'light' | 'moderate' | 'strong'
export type ScentFamily = 'oud' | 'floral' | 'woody' | 'fresh' | 'oriental' | 'citrus' | 'musky'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type Occasion = 'daily' | 'evening' | 'special'
export type OrderStatus = 'pending' | 'completed' | 'cancelled'

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
  occasion: Occasion[]
  accords: Accord[]
  prices: ProductPrices
  created_at: string
}

export const MUSK_SIZES_ML = [3, 6, 9] as const
export const SPRAY_SIZES_ML = [30, 50] as const
export const CURRENCY = 'DEN'

export const SCENT_FAMILIES: ScentFamily[] = ['oud', 'floral', 'woody', 'fresh', 'oriental', 'citrus', 'musky']
export const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']
export const OCCASIONS: Occasion[] = ['daily', 'evening', 'special']
export const INTENSITIES: Intensity[] = ['light', 'moderate', 'strong']

export interface OrderItem {
  id?: string
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
  status: OrderStatus
  created_at: string
}
