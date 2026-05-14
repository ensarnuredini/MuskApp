import React from 'react'
import type { Product } from '../types'
import { supabase } from '../lib/supabase'

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onRefresh: () => void
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onRefresh }) => {
  const toggleStock = async (product: Product) => {
    await supabase.from('products').update({ in_stock: !product.in_stock }).eq('id', product.id)
    onRefresh()
  }

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    await supabase.from('products').delete().eq('id', product.id)
    onRefresh()
  }

  const getTypeBadges = (product: Product) => {
    const badges: string[] = []
    if (product.prices.musk && Object.keys(product.prices.musk).length > 0) badges.push('Musk')
    if (product.prices.spray && Object.keys(product.prices.spray).length > 0) badges.push('Spray')
    return badges
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No products yet</p>
        <p className="text-sm mt-1">Add your first product to get started</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Image</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Gender</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Types</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">In Stock</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-12 h-14 object-cover rounded-lg" />
                ) : (
                  <div className="w-12 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No img</div>
                )}
              </td>
              <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.gender === 'male' ? 'bg-blue-50 text-blue-700' : product.gender === 'female' ? 'bg-pink-50 text-pink-700' : 'bg-purple-50 text-purple-700'}`}>
                  {product.gender === 'male' ? '♂ Male' : product.gender === 'female' ? '♀ Female' : '⚥ Unisex'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-1">
                  {getTypeBadges(product).map((badge) => (
                    <span key={badge} className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">{badge}</span>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4">
                <button onClick={() => toggleStock(product)} className={`relative w-10 h-5 rounded-full transition-colors ${product.in_stock ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow ${product.in_stock ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(product)} className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">Edit</button>
                  <button onClick={() => handleDelete(product)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
