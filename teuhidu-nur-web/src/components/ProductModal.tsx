import { cn } from '../lib/utils';
import { X, Minus, Plus } from 'lucide-react';
import type { Product } from '../types';
import { useState, useMemo } from 'react';
import { useCartStore } from '../store/cartStore';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [type, setType] = useState<'musk' | 'spray'>(product.prices.musk ? 'musk' : 'spray');
  
  const availableSizes = useMemo(() => {
    const pricesObj = product.prices[type];
    if (!pricesObj) return [];
    return Object.keys(pricesObj).map(Number).sort((a, b) => a - b);
  }, [product, type]);

  const [size, setSize] = useState<number>(availableSizes[0] || 0);
  const [quantity, setQuantity] = useState(1);

  const currentPrice = useMemo(() => {
    return product.prices[type]?.[size.toString()] || 0;
  }, [product, type, size]);

  const addToCart = useCartStore((state) => state.addToCart);

  // If type changes, reset size to the first available for that type
  const handleTypeChange = (newType: 'musk' | 'spray') => {
    setType(newType);
    const newSizes = Object.keys(product.prices[newType] || {}).map(Number).sort((a, b) => a - b);
    if (newSizes.length > 0) {
      setSize(newSizes[0]);
    }
  };

  const imageUrl = product.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop';

  const handleAddToCart = () => {
    if (size && currentPrice) {
      addToCart({
        productId: product.id,
        productName: product.name,
        productImage: product.image_url,
        type,
        size,
        price: currentPrice,
        quantity,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl relative border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/80 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto flex-1 pb-safe">
          <div className="w-full h-64 sm:h-80 relative bg-black">
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
          
          <div className="p-5 -mt-10 relative z-10">
            <div className="mb-6">
              <h2 className="text-3xl font-serif font-bold text-primary mb-2">{product.name}</h2>
              <p className="text-secondary text-sm leading-relaxed">{product.description}</p>
            </div>

            {/* Accords */}
            {product.accords && product.accords.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest text-secondary mb-3">Main Accords</h3>
                <div className="flex flex-wrap gap-2">
                  {product.accords.map((accord, idx) => (
                    <div 
                      key={idx} 
                      className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{ backgroundColor: accord.color, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {accord.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selectors */}
            <div className="space-y-5">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-secondary mb-3">Formulation</h3>
                <div className="flex gap-3">
                  {(['musk', 'spray'] as const).map(t => {
                    const hasPrices = product.prices[t] && Object.keys(product.prices[t] || {}).length > 0;
                    if (!hasPrices) return null;
                    return (
                      <button
                        key={t}
                        onClick={() => handleTypeChange(t)}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-colors capitalize",
                          type === t 
                            ? "border-accent bg-accent/10 text-accent" 
                            : "border-white/10 text-secondary hover:border-white/30"
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {availableSizes.length > 0 && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-secondary mb-3">Size (ml)</h3>
                  <div className="flex gap-3 flex-wrap">
                    {availableSizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={cn(
                          "flex-1 min-w-[4rem] py-3 px-2 rounded-xl border text-sm font-semibold transition-colors text-center",
                          size === s 
                            ? "border-accent bg-accent/10 text-accent" 
                            : "border-white/10 text-secondary hover:border-white/30"
                        )}
                      >
                        {s}ml
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-4 bg-background rounded-xl p-2 border border-white/5">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-primary font-semibold w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-secondary hover:text-primary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-xs text-secondary mb-1">Total</p>
                  <p className="text-2xl font-serif font-bold text-accent">€{(currentPrice * quantity).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-card/90 backdrop-blur-md pb-safe">
          <button 
            onClick={handleAddToCart}
            disabled={!size || !currentPrice || !product.in_stock}
            className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
          >
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
