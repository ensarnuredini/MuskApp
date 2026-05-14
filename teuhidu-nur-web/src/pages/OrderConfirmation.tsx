import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';
import { CheckCircle2, Clock, XCircle, ChevronLeft } from 'lucide-react';

export function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderNumber) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderNumber)
          .single();

        if (error) throw error;
        setOrder(data as Order);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <p className="text-secondary mb-4">Order not found.</p>
        <Link to="/" className="text-accent hover:underline flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (order.status) {
      case 'completed':
        return <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-full font-semibold"><CheckCircle2 className="w-5 h-5"/> Completed</div>;
      case 'cancelled':
        return <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-full font-semibold"><XCircle className="w-5 h-5"/> Cancelled</div>;
      default:
        return <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-full font-semibold"><Clock className="w-5 h-5"/> Pending</div>;
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-4 flex flex-col">
      <div className="bg-card rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl mt-4">
        <div className="text-center mb-8 border-b border-white/5 pb-8">
          <h2 className="text-secondary text-sm uppercase tracking-widest mb-2">Order Number</h2>
          <h1 className="text-4xl font-serif font-bold text-primary tracking-wider">{order.order_number}</h1>
          <div className="flex justify-center mt-6">
            {getStatusDisplay()}
          </div>
          <p className="text-xs text-secondary mt-4">
            Placed on {(() => {
              const dateStr = order.created_at;
              const date = new Date(dateStr.includes('Z') || dateStr.includes('+') ? dateStr : `${dateStr.replace(' ', 'T')}Z`);
              return date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
              });
            })()}
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="font-serif font-bold text-xl">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-background/50 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-md overflow-hidden shrink-0">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover opacity-80" />}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{item.name}</p>
                    <p className="text-xs text-secondary capitalize">{item.type} • {item.ml}ml • Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} DEN</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-end">
          <span className="text-secondary uppercase tracking-widest text-sm">Total</span>
          <span className="text-3xl font-serif font-bold text-accent">{Number(order.total_price || 0).toFixed(2)} DEN</span>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-secondary hover:text-white transition-colors inline-flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
