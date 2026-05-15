import { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState({
    season: [] as string[],
    scent: [] as string[],
    intensity: [] as string[],
  });

  const handleClearAll = () => {
    setSearchQuery('');
    setFilters({ season: [], scent: [], intensity: [] });
  };

  const hasActiveFilters = useMemo(() => 
    filters.season.length > 0 || filters.scent.length > 0 || filters.intensity.length > 0
  , [filters]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const targetGender = gender === 'male' ? 'male' : 'female';
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('gender', [targetGender, 'unisex']);

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
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

      // AND logic between categories, OR logic within category
      const matchSeason = filters.season.length === 0 || 
        product.season?.some(s => filters.season.includes(s));
        
      const matchScent = filters.scent.length === 0 || 
        product.scent_family?.some(s => filters.scent.includes(s));
        
      const matchIntensity = filters.intensity.length === 0 || 
        filters.intensity.includes(product.intensity);

      return matchSearch && matchSeason && matchScent && matchIntensity;
    });
  }, [products, filters, searchQuery]);

  return (
    <div className="flex-1 flex flex-col relative pb-8">
      {/* Sticky Search Bar */}
      <div className="w-full sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-white/5 py-3 px-4">
        <div className="max-w-5xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-white/10 rounded-xl py-3 pl-11 pr-10 text-primary placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary hover:text-primary flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

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
              onClick={handleClearAll}
              className="mt-4 text-accent hover:underline text-sm font-semibold"
            >
              {searchQuery && hasActiveFilters ? 'Clear all search and filters' : 
               searchQuery ? 'Clear search' : 'Clear filters'}
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
