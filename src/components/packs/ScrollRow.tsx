import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PackCard } from './PackCard';
import { ScenePack } from '../../types';

interface ScrollRowProps {
  title: string;
  subtitle?: string;
  packs: ScenePack[];
  onPackClick: (packId: string) => void;
}

export const ScrollRow: React.FC<ScrollRowProps> = ({ title, subtitle, packs, onPackClick }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Trigger check initially & on resize
      checkScroll();
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [packs]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (packs.length === 0) return null;

  return (
    <div className="relative my-8 px-1">
      {/* Row Header Information */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
            <span className="text-[10px] font-mono font-bold bg-white/5 border border-white/5 text-zinc-400 px-1.5 py-0.5 rounded">
              {packs.length} {packs.length === 1 ? 'PACK' : 'PACKS'}
            </span>
          </h2>
          {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Scroll Controls Container */}
      <div className="group/row relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/85 border border-white/10 hover:border-white/20 text-white hover:scale-110 active:scale-95 transition-all shadow-2xl opacity-0 group-hover/row:opacity-100 duration-300 backdrop-blur-md cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/85 border border-white/10 hover:border-white/20 text-white hover:scale-110 active:scale-95 transition-all shadow-2xl opacity-0 group-hover/row:opacity-100 duration-300 backdrop-blur-md cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable track with horizontal mask */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollPadding: '1rem' }}
        >
          {packs.map((pack) => (
            <div 
              key={pack.id} 
              className="w-[190px] md:w-[220px] shrink-0 snap-start"
            >
              <PackCard 
                pack={pack} 
                onClick={() => onPackClick(pack.id)} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
