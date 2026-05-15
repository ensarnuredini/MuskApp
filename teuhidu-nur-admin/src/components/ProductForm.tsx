import React, { useState } from 'react'
import type {
  Product,
  ProductPrices,
  Accord,
  Gender,
  Intensity,
} from '../types'
import {
  SCENT_FAMILIES,
  SEASONS,
  INTENSITIES,
} from '../types'
import { supabase } from '../lib/supabase'
import { ImageUpload } from './ImageUpload'

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  onSaved: (savedProduct: Product, isNew: boolean) => void
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSaved }) => {
  const isEditing = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [gender, setGender] = useState<Gender>(product?.gender ?? 'male')
  const [description, setDescription] = useState(product?.description ?? '')
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [scentFamily, setScentFamily] = useState<string[]>(product?.scent_family ?? [])
  const [season, setSeason] = useState<string[]>(product?.season ?? [])
  const [intensity, setIntensity] = useState<Intensity>(product?.intensity ?? 'moderate')

  const [accords, setAccords] = useState<Accord[]>(
    product?.accords ?? [{ name: '', color: '#c9a84c' }]
  )
  const [inStock, setInStock] = useState(product?.in_stock ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New musk sizes: 3ml, 6ml, 9ml
  const [musk3, setMusk3] = useState(product?.prices?.musk?.['3']?.toString() ?? '')
  const [musk6, setMusk6] = useState(product?.prices?.musk?.['6']?.toString() ?? '')
  const [musk9, setMusk9] = useState(product?.prices?.musk?.['9']?.toString() ?? '')
  // Spray sizes: 30ml, 50ml (removed 100ml)
  const [spray30, setSpray30] = useState(product?.prices?.spray?.['30']?.toString() ?? '')
  const [spray50, setSpray50] = useState(product?.prices?.spray?.['50']?.toString() ?? '')

  const toggleArr = (arr: string[], val: string, set: React.Dispatch<React.SetStateAction<string[]>>) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const addAccord = () => setAccords([...accords, { name: '', color: '#c9a84c' }])
  const removeAccord = (i: number) => setAccords(accords.filter((_, idx) => idx !== i))
  const updateAccord = (i: number, field: keyof Accord, val: string) =>
    setAccords(accords.map((a, idx) => (idx === i ? { ...a, [field]: val } : a)))

  const handleSave = async () => {
    if (!name.trim()) { setError('Product name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const prices: ProductPrices = {}
      const mk: Record<string, number> = {}
      if (musk3) mk['3'] = parseFloat(musk3)
      if (musk6) mk['6'] = parseFloat(musk6)
      if (musk9) mk['9'] = parseFloat(musk9)
      if (Object.keys(mk).length > 0) prices.musk = mk

      const sp: Record<string, number> = {}
      if (spray30) sp['30'] = parseFloat(spray30)
      if (spray50) sp['50'] = parseFloat(spray50)
      if (Object.keys(sp).length > 0) prices.spray = sp

      if (!prices.musk && !prices.spray) { setError('At least one price must be set'); setSaving(false); return }

      const validAccords = accords.filter((a) => a.name.trim())
      const data = {
        name: name.trim(), gender, description: description.trim(),
        image_url: imageUrl, scent_family: scentFamily, season, intensity,
        accords: validAccords, prices, in_stock: inStock,
      }

      if (isEditing && product) {
        const { data: updated, error: e } = await supabase.from('products').update(data).eq('id', product.id).select().single()
        if (e) throw e
        onSaved(updated as Product, false)
      } else {
        const { data: created, error: e } = await supabase.from('products').insert(data).select().single()
        if (e) throw e
        onSaved(created as Product, true)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const chipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
      active ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. Aventus" />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          </div>

          {/* Image */}
          <ImageUpload currentUrl={imageUrl} onUpload={setImageUrl} />

          {/* Scent Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scent Family</label>
            <div className="flex flex-wrap gap-2">
              {SCENT_FAMILIES.map((s) => (
                <label key={s} className={chipClass(scentFamily.includes(s))}>
                  <input type="checkbox" className="hidden" checked={scentFamily.includes(s)} onChange={() => toggleArr(scentFamily, s, setScentFamily)} />{s}
                </label>
              ))}
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((s) => (
                <label key={s} className={chipClass(season.includes(s))}>
                  <input type="checkbox" className="hidden" checked={season.includes(s)} onChange={() => toggleArr(season, s, setSeason)} />{s}
                </label>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
            <div className="flex gap-3">
              {INTENSITIES.map((i) => (
                <label key={i} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors border ${intensity === i ? 'bg-amber-600 border-amber-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  <input type="radio" className="hidden" name="intensity" value={i} checked={intensity === i} onChange={() => setIntensity(i)} />{i}
                </label>
              ))}
            </div>
          </div>



          {/* Accords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Accords</label>
              <button type="button" onClick={addAccord} className="text-xs text-amber-600 hover:text-amber-700 font-semibold">+ Add Accord</button>
            </div>
            <div className="space-y-2">
              {accords.map((a, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={a.name} onChange={(e) => updateAccord(i, 'name', e.target.value)} placeholder="Accord name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                  <input type="color" value={a.color} onChange={(e) => updateAccord(i, 'color', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer" />
                  {accords.length > 1 && <button type="button" onClick={() => removeAccord(i)} className="text-red-400 hover:text-red-600 text-lg">✕</button>}
                </div>
              ))}
            </div>
          </div>

          {/* Musk Prices */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Musk Prices (DEN)</label>
            <div className="grid grid-cols-3 gap-3">
              {[{ label: '3ml', val: musk3, set: setMusk3 }, { label: '6ml', val: musk6, set: setMusk6 }, { label: '9ml', val: musk9, set: setMusk9 }].map((p) => (
                <div key={p.label}>
                  <label className="text-xs text-gray-500">{p.label}</label>
                  <input type="number" value={p.val} onChange={(e) => p.set(e.target.value)} min="0" step="0.01" placeholder="—"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Spray Prices */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Spray Prices (DEN)</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: '30ml', val: spray30, set: setSpray30 }, { label: '50ml', val: spray50, set: setSpray50 }].map((p) => (
                <div key={p.label}>
                  <label className="text-xs text-gray-500">{p.label}</label>
                  <input type="number" value={p.val} onChange={(e) => p.set(e.target.value)} min="0" step="0.01" placeholder="—"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              ))}
            </div>
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">In Stock</label>
            <button type="button" onClick={() => setInStock(!inStock)}
              className={`relative w-12 h-6 rounded-full transition-colors ${inStock ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${inStock ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  )
}
