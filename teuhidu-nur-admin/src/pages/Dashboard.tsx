import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import { ProductTable } from '../components/ProductTable'
import { ProductForm } from '../components/ProductForm'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/login')
  }, [navigate])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
    fetchProducts()
  }, [checkAuth, fetchProducts])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-wide">Teuhidu Nur</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Products ({products.length})
          </h2>
          <button
            onClick={handleAddNew}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Add Product
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading products...</div>
          ) : (
            <ProductTable products={products} onEdit={handleEdit} onRefresh={fetchProducts} />
          )}
        </div>
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSaved={fetchProducts}
        />
      )}
    </div>
  )
}
