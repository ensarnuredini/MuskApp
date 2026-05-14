import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="flex-1 flex flex-col p-4 gap-4 max-w-md mx-auto w-full h-full">
      <Link 
        to="/products/male" 
        className="flex-1 relative rounded-3xl overflow-hidden group border border-white/10 hover:border-accent/50 transition-colors block"
      >
        <img 
          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop" 
          alt="For Him" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 p-6">
          <h2 className="text-4xl font-serif font-bold text-white mb-2 text-center tracking-wide">For Him</h2>
          <p className="text-secondary text-sm text-center max-w-[200px] mb-6">Discover our collection of masculine fragrances</p>
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
            Shop Now
          </span>
        </div>
      </Link>

      <Link 
        to="/products/female" 
        className="flex-1 relative rounded-3xl overflow-hidden group border border-white/10 hover:border-accent/50 transition-colors block"
      >
        <img 
          src="https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000&auto=format&fit=crop" 
          alt="For Her" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 p-6">
          <h2 className="text-4xl font-serif font-bold text-white mb-2 text-center tracking-wide">For Her</h2>
          <p className="text-secondary text-sm text-center max-w-[200px] mb-6">Elegant and captivating feminine scents</p>
          <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
            Shop Now
          </span>
        </div>
      </Link>
    </div>
  );
}
