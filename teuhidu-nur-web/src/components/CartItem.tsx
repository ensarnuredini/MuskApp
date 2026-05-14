import { Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore, type CartItem as CartItemType } from '../store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCartStore();

  return (
    <div className="flex gap-4 p-4 bg-card rounded-2xl border border-white/5 relative">
      <div className="w-20 h-24 bg-background rounded-xl overflow-hidden shrink-0">
        <img 
          src={item.productImage} 
          alt={item.productName} 
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif font-bold text-primary text-lg truncate pr-8">{item.productName}</h3>
          <p className="text-sm text-secondary capitalize">{item.type} • {item.size}ml</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="font-serif font-bold text-accent">{(item.price * item.quantity).toFixed(2)} DEN</p>
          
          <div className="flex items-center gap-3 bg-background rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => updateQuantity(item.productId, item.type, item.size, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center text-secondary hover:text-primary"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-primary text-sm font-semibold w-4 text-center">{item.quantity}</span>
            <button 
              onClick={() => updateQuantity(item.productId, item.type, item.size, item.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center text-secondary hover:text-primary"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={() => removeFromCart(item.productId, item.type, item.size)}
        className="absolute top-4 right-4 text-secondary hover:text-red-400 transition-colors p-1"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
