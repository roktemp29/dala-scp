import React from 'react';
import { Flame } from 'lucide-react';
import { ScenePack } from '../../types';

interface HeroSectionProps {
  pack: ScenePack;
  onStreamClick: () => void;
  onMoreInfoClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ pack, onStreamClick, onMoreInfoClick }) => {
  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 min-h-[480px] flex items-end mb-8 select-none"
      id="featured-hero-section"
    >
      {/* Background Animated Gradient Fluid Overlay */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent z-10"></div>
        <div className="w-full h-full opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent"></div>
      </div>

      {/* Actual Hero Banner Image with extreme dark blur shadow masks */}
      <div className="absolute inset-0 z-0 flex justify-end">
        <div className="absolute inset-0 bg-[#121212]">
          <img 
            src={pack.banner_url || pack.thumbnail_url} 
            alt={pack.title}
            className="w-full h-full object-cover opacity-35 filter brightness-75 scale-100 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent z-10"></div>
        </div>

        {/* Visual placeholder for a movie frame with play trigger (aligned with design HTML) */}
        <div 
          onClick={onStreamClick}
          className="absolute right-0 top-0 w-2/3 h-full bg-black/15 hidden md:flex items-center justify-center border-l border-white/5 z-20 cursor-pointer group/overlay"
        >
          <div className="w-24 h-24 rounded-full border-4 border-white/20 flex items-center justify-center group-hover/overlay:border-white/50 group-hover/overlay:scale-110 transition-all duration-300 backdrop-blur-sm">
            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1.5 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Core Billboard Content */}
      <div className="relative z-20 p-8 md:p-12 lg:p-16 max-w-2xl text-left flex flex-col gap-4">
        {/* Pack Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-white text-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
            {pack.resolution || '4K HDR'}
          </span>
          <span className="text-red-500 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
            Featured Scenepack
          </span>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded-full uppercase">
            {pack.genre}
          </span>
        </div>

        {/* Big Title Display */}
        <div className="flex flex-col gap-1">
          <span className="text-zinc-500 text-xs md:text-sm font-semibold tracking-widest uppercase font-mono">
            {pack.anime_source}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-1 leading-[1.0] select-text">
            {pack.title.split(':')[0]} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
              {pack.title.split(':').slice(1).join(':') || 'EDITS SELECTION'}
            </span>
          </h1>
        </div>

        {/* Shortened Description */}
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-lg select-text">
          {pack.description}
        </p>

        {/* Specs footer line */}
        <div className="flex items-center gap-5 text-[10px] font-mono text-zinc-500">
          <span>Clips: <strong className="text-zinc-300">{pack.clip_count}</strong></span>
          <span>Size: <strong className="text-zinc-300">{pack.file_size}</strong></span>
          <span>FPS: <strong className="text-zinc-300">{pack.fps}FPS</strong></span>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-wrap gap-4 mt-2">
          <button
            onClick={onStreamClick}
            id="hero-play-stream-btn"
            className="bg-white text-black font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded flex items-center gap-3 hover:bg-zinc-200 transition active:scale-95 cursor-pointer shadow-xl"
          >
            <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-black border-b-4 border-b-transparent"></div>
            Stream Pack
          </button>
          
          <button
            onClick={onMoreInfoClick}
            id="hero-more-info-btn"
            className="bg-white/10 hover:bg-white/20 text-[#E5E5E5] font-bold text-xs uppercase tracking-wider px-6 py-3 rounded backdrop-blur-md border border-white/20 transition active:scale-95 cursor-pointer"
          >
            More Details
          </button>
        </div>
      </div>
    </div>
  );
};
