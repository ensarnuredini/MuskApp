import React from 'react';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';

interface OrderTableProps {
  orders: Order[];
  onRefresh: () => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, onRefresh }) => {
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      onRefresh();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    }
  };

  if (orders.length === 0) {
    return <div className="p-8 text-center text-gray-500">No orders found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
          <tr>
            <th className="px-6 py-4">Order Number</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Items</th>
            <th className="px-6 py-4">Total</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-bold text-gray-900">{order.order_number}</td>
              <td className="px-6 py-4">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </td>
              <td className="px-6 py-4 max-w-xs">
                <div className="flex flex-col gap-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <span className="truncate">{item.quantity}x {item.name} ({item.ml}ml)</span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 font-semibold text-gray-900">€{order.total_price?.toFixed(2)}</td>
              <td className="px-6 py-4">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={`text-sm rounded-lg px-3 py-1.5 border font-semibold outline-none cursor-pointer ${
                    order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
