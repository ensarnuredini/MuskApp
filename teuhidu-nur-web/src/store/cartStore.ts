import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  type: 'musk' | 'spray';
  size: number;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string, type: string, size: number) => void;
  updateQuantity: (productId: string, type: string, size: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.productId === item.productId && i.type === item.type && i.size === item.size
          );

          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += item.quantity || 1;
            return { items: newItems };
          }

          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
        });
      },
      removeFromCart: (productId, type, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.type === type && i.size === size)
          ),
        }));
      },
      updateQuantity: (productId, type, size, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) => !(i.productId === productId && i.type === type && i.size === size)
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId && i.type === type && i.size === size
                ? { ...i, quantity }
                : i
            ),
          };
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'teuhidu-nur-cart',
    }
  )
);
