import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Order } from '../types'

export const PublicOrder: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return

      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderNumber)
          .single()

        if (fetchError) throw fetchError
        setOrder(data as Order)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Order not found')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderNumber])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-6">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-gray-400 text-center">
          We couldn't find an order matching this number. Please check the link and try again.
        </p>
      </div>
    )
  }

  const statusClass =
    order.status === 'completed'
      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
      : order.status === 'cancelled'
        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-amber-500/30">
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-20">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-amber-500 text-3xl mb-4 opacity-80">✦</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-widest uppercase mb-2">
            Teuhidu Nur
          </h1>
          <p className="text-gray-500 tracking-widest text-sm uppercase">
            Order Confirmation
          </p>
        </div>

        {/* Order Card */}
        <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Number</p>
              <p className="text-lg font-bold tracking-wide">{order.order_number}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${statusClass}`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="px-6 py-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-16 h-20 object-cover rounded-lg bg-[#111]" />
                ) : (
                  <div className="w-16 h-20 bg-[#111] rounded-lg flex items-center justify-center text-xs text-gray-600">
                    No img
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">
                    {item.type === 'musk' ? 'Musk' : 'Spray'} · {item.ml}ml
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">€{item.price * item.quantity}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer & Total */}
          <div className="bg-[#111111] px-6 py-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">Date Ordered</p>
              <p className="text-sm font-medium text-gray-300">
                {(() => {
                  const dateStr = order.created_at;
                  const date = new Date(dateStr.includes('Z') || dateStr.includes('+') ? dateStr : `${dateStr.replace(' ', 'T')}Z`);
                  return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                })()}
              </p>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto">
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-amber-500">€{Number(order.total_price || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Support Note */}
        <p className="text-center text-gray-500 text-sm mt-12">
          If you have any questions about your order, please reply to our WhatsApp chat.
        </p>

      </div>
    </div>
  )
}
