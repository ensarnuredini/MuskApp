import React from 'react'
import type { Order, OrderStatus } from '../types'
import { supabase } from '../lib/supabase'

interface OrderTableProps {
  orders: Order[]
  onRefresh: () => void
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusClasses: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const formatMoney = (value: number) => `EUR ${Number(value || 0).toFixed(2)}`

export const OrderTable: React.FC<OrderTableProps> = ({ orders, onRefresh }) => {
  const updateStatus = async (order: Order, status: OrderStatus) => {
    if (order.status === status) return

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', order.id)

    if (error) {
      alert(`Could not update order ${order.order_number}: ${error.message}`)
    } else {
      onRefresh()
    }
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No orders yet</p>
        <p className="text-sm mt-1">New WhatsApp orders will appear here.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Order</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Items</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Total</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Date</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Change Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const previewItems = order.items.slice(0, 2)
            const extraItems = order.items.length - previewItems.length

            return (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                <td className="py-4 px-4">
                  <a
                    href={`/order/${order.order_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-gray-900 hover:text-amber-700"
                  >
                    {order.order_number}
                  </a>
                  <p className="text-xs text-gray-400 mt-1">{order.items.length} item{order.items.length === 1 ? '' : 's'}</p>
                </td>
                <td className="py-4 px-4 min-w-72">
                  <div className="space-y-2">
                    {previewItems.map((item, index) => (
                      <div key={`${order.id}-${item.id ?? item.name}-${index}`} className="flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-10 h-12 rounded-md object-cover bg-gray-100" />
                        ) : (
                          <div className="w-10 h-12 rounded-md bg-gray-100 text-[10px] text-gray-400 flex items-center justify-center">No img</div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 capitalize">
                            {item.type} - {item.ml}ml - Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {extraItems > 0 && (
                      <p className="text-xs text-gray-500">+ {extraItems} more item{extraItems === 1 ? '' : 's'}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 font-semibold text-gray-900 whitespace-nowrap">
                  {formatMoney(order.total_price)}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                  {(() => {
                    const dateStr = order.created_at;
                    const date = new Date(dateStr.includes('Z') || dateStr.includes('+') ? dateStr : `${dateStr.replace(' ', 'T')}Z`);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                  })()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
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
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
