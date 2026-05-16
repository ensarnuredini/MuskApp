import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Order, Product } from '../types'
import { ProductTable } from '../components/ProductTable'
import { ProductForm } from '../components/ProductForm'
import { OrderTable } from '../components/OrderTable'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('orders')
  const [searchQuery, setSearchQuery] = useState('')

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) navigate('/login')
  }, [navigate])

  const fetchData = useCallback(async () => {
    setLoading(true)

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    setProducts((productsData as Product[]) ?? [])
    setOrders((ordersData as Order[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [checkAuth, fetchData])

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

  // SPA state update handlers — no page refresh needed
  const handleProductSaved = (savedProduct: Product, isNew: boolean) => {
    if (isNew) {
      setProducts(prev => [savedProduct, ...prev])
    } else {
      setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p))
    }
  }

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
  }

  const handleProductDeleted = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
  }

  // Order status updates also without refresh
  const handleOrderRefresh = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders((ordersData as Order[]) ?? [])
  }

  const handleOrderDeleted = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'orders' 
                ? 'border-amber-600 text-amber-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'products' 
                ? 'border-amber-600 text-amber-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Products ({products.length})
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {activeTab === 'orders' ? 'Manage Orders' : 'Manage Products'}
          </h2>
          
          <div className="flex flex-1 max-w-md gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={activeTab === 'orders' ? "Search order #..." : "Search products..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {activeTab === 'products' && (
              <button
                onClick={handleAddNew}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                + Add Product
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-400">Loading...</div>
          ) : activeTab === 'products' ? (
            <ProductTable
              products={filteredProducts}
              onEdit={handleEdit}
              onProductUpdated={handleProductUpdated}
              onProductDeleted={handleProductDeleted}
            />
          ) : (
            <OrderTable orders={filteredOrders} onRefresh={handleOrderRefresh} onOrderDeleted={handleOrderDeleted} />
          )}
        </div>
      </main>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSaved={handleProductSaved}
        />
      )}
    </div>
  )
}
