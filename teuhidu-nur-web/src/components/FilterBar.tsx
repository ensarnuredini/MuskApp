
interface FilterBarProps {
  filters: {
    season: string[];
    scent: string[];
    intensity: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    season: string[];
    scent: string[];
    intensity: string[];
  }>>;
}

const CATEGORIES = {
  season: ['spring', 'summer', 'autumn', 'winter'],
  scent: ['oud', 'floral', 'woody', 'fresh', 'oriental', 'citrus', 'musky'],
  intensity: ['light', 'moderate', 'strong'],
};

export function FilterBar({ filters, setFilters }: FilterBarProps) {
  const toggleFilter = (category: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  return (
    <div className="w-full bg-background/95 border-b border-white/5 pb-2">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3">
        {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map(category => (
          <div key={category} className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-semibold text-secondary uppercase tracking-widest min-w-[5rem]">
              {category}
            </span>
            <div className="flex gap-2">
              {CATEGORIES[category].map(option => {
                const isActive = filters[category].includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleFilter(category, option)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                      isActive 
                        ? 'border-accent bg-accent/10 text-accent' 
                        : 'border-white/10 text-secondary hover:border-white/30 bg-card'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
