import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { FilterBar } from '../components/FilterBar';

export function Products() {
  const { gender } = useParams<{ gender: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState({
    season: [] as string[],
    scent: [] as string[],
    intensity: [] as string[],
    occasion: [] as string[],
  });

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const targetGender = gender === 'male' ? 'male' : 'female';
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('gender', [targetGender, 'unisex'])
          .eq('in_stock', true);

        if (error) throw error;
        setProducts(data as Product[]);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [gender]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // AND logic between categories, OR logic within category
      const matchSeason = filters.season.length === 0 || 
        product.season?.some(s => filters.season.includes(s));
        
      const matchScent = filters.scent.length === 0 || 
        product.scent_family?.some(s => filters.scent.includes(s));
        
      const matchIntensity = filters.intensity.length === 0 || 
        filters.intensity.includes(product.intensity);
        
      const matchOccasion = filters.occasion.length === 0 || 
        product.occasion?.some(o => filters.occasion.includes(o));

      return matchSeason && matchScent && matchIntensity && matchOccasion;
    });
  }, [products, filters]);

  return (
    <div className="flex-1 flex flex-col relative pb-8">
      <FilterBar filters={filters} setFilters={setFilters} />
      
      <div className="max-w-5xl mx-auto px-4 mt-6 w-full">
        <h2 className="text-2xl font-serif font-bold text-primary capitalize mb-6">
          {gender === 'male' ? 'For Him' : 'For Her'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-card/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-secondary">No products found matching your filters.</p>
            <button 
              onClick={() => setFilters({ season: [], scent: [], intensity: [], occasion: [] })}
              className="mt-4 text-accent hover:underline text-sm font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
