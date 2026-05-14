import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  // If product image is missing, we use a placeholder or generic luxury background
  const imageUrl = product.image_url || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop';

  return (
    <button 
      onClick={onClick}
      className="group flex flex-col items-center bg-card rounded-xl overflow-hidden border border-white/5 shadow-xl hover:border-accent/50 transition-all text-left w-full relative"
    >
      <div className="w-full aspect-[4/5] relative bg-background/50 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent opacity-60" />
      </div>
      
      <div className="p-4 w-full flex flex-col flex-1 z-10 -mt-6">
        <h3 className="font-serif text-lg font-semibold text-primary truncate">
          {product.name}
        </h3>
        
        <p className="text-sm text-secondary mt-1 line-clamp-2">
          {product.description || 'Experience the luxurious essence.'}
        </p>

        <div className="mt-4 w-full">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold flex items-center gap-2">
            View Details 
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </button>
  );
}
