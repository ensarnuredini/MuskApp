import { create } from 'zustand'
import { CartItem, Product } from '../types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, type: 'musk' | 'spray', ml: number, price: number) => void
  removeItem: (productId: string, type: 'musk' | 'spray', ml: number) => void
  incrementItem: (productId: string, type: 'musk' | 'spray', ml: number) => void
  decrementItem: (productId: string, type: 'musk' | 'spray', ml: number) => void
  clearCart: () => void
  totalPrice: () => number
  totalItems: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product, type, ml, price) => {
    const existing = get().items.find(
      (i) => i.product.id === product.id && i.type === type && i.ml === ml
    )
    if (existing) {
      set((state) => ({
        items: state.items.map((i) =>
          i.product.id === product.id && i.type === type && i.ml === ml
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      }))
    } else {
      set((state) => ({
        items: [...state.items, { product, type, ml, price, quantity: 1 }],
      }))
    }
  },

  removeItem: (productId, type, ml) =>
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.product.id === productId && i.type === type && i.ml === ml)
      ),
    })),

  incrementItem: (productId, type, ml) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId && i.type === type && i.ml === ml
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    })),

  decrementItem: (productId, type, ml) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.product.id === productId && i.type === type && i.ml === ml && i.quantity > 1
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    })),

  clearCart: () => set({ items: [] }),

  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}))
