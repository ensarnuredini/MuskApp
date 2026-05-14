import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { CartItem } from '../components/CartItem';
import { STORE_WHATSAPP, ORDER_BASE_URL } from '../config';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TN-${result}`;
}

export function Cart() {
  const { items, getTotal, getItemCount, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);

    // Open window immediately before any async code to bypass popup blockers
    const waWindow = window.open('about:blank', '_blank');

    try {
      const orderNumber = generateOrderNumber();
      const total = getTotal();

      // Save to Supabase
      const { error } = await supabase.from('orders').insert({
        order_number: orderNumber,
        items,
        total_price: total,
        status: 'pending'
      });

      if (error) {
        if (waWindow) waWindow.close();
        console.error('Error creating order:', error);
        alert('There was an error creating your order. Please try again.');
        setIsCheckingOut(false);
        return;
      }

      // Construct WhatsApp message
      const orderUrl = `${ORDER_BASE_URL}/order/${orderNumber}`;
      const message = `🌿 Teuhidu Nur — New Order\nOrder #${orderNumber}\n\nView order details:\n${orderUrl}\n\nPlease confirm my order. Thank you!`;
      
      const waUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
      
      // Redirect the opened window to WhatsApp
      if (waWindow) {
        waWindow.location.href = waUrl;
      } else {
        // Fallback if window.open was still blocked
        window.location.href = waUrl;
      }

      // Clear cart
      clearCart();

      // Navigate to order confirmation
      navigate(`/order/${orderNumber}`);
    } catch (err) {
      if (waWindow) waWindow.close();
      console.error(err);
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-serif text-primary mb-4">Your Cart is Empty</h2>
        <p className="text-secondary text-center mb-8">Discover our luxurious collection of fragrances.</p>
        <Link 
          to="/"
          className="bg-accent text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-accent-hover transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
      <div className="p-4 flex items-end justify-between border-b border-white/5 pb-4">
        <h2 className="text-2xl font-serif font-bold text-primary">Your Cart</h2>
        <span className="text-secondary text-sm">{getItemCount()} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
        {items.map(item => (
          <CartItem key={`${item.productId}-${item.type}-${item.size}`} item={item} />
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-white/10 p-4 pb-safe z-40">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-secondary uppercase tracking-widest text-xs font-semibold">Total Amount</span>
            <span className="text-2xl font-serif font-bold text-accent">€{getTotal().toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isCheckingOut}
            className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
          >
            {isCheckingOut ? 'Processing...' : 'Order via WhatsApp'}
          </button>

          <button 
            onClick={clearCart}
            className="text-secondary text-xs hover:text-white transition-colors underline underline-offset-4 text-center"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
