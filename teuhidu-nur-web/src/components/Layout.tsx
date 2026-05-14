import { Link, Outlet } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export function Layout() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <div className="min-h-screen flex flex-col relative pb-safe">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wider text-accent font-serif uppercase">
              Teuhidu Nur
            </h1>
          </Link>

          <Link to="/cart" className="relative p-2 text-primary hover:text-accent transition-colors">
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-accent text-background text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
