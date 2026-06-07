import React, { useState, useEffect } from 'react';
import { Eye, Download, Bookmark, Film, ListCollapse } from 'lucide-react';
import { ScenePack } from '../../types';
import { useApp } from '../../lib/AppContext';

interface PackCardProps {
  pack: ScenePack;
  onClick: () => void;
}

export const PackCard: React.FC<PackCardProps> = ({ pack, onClick }) => {
  const { savedPacks, toggleSavePack, currentUser } = useApp();
  const isSaved = savedPacks.some(s => s.scenepack_id === pack.id && s.user_email === currentUser?.email);

  const [isHovered, setIsHovered] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);

  // Parse color variables safely
  const gradFrom = pack.gradient_from || '#1e3c72';
  const gradTo = pack.gradient_to || '#2a5298';

  const cardStyle = {
    '--hover-glow': `linear-gradient(135deg, ${gradFrom}df, ${gradTo}df)`
  } as React.CSSProperties;

  // Extract YouTube ID safely
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId(pack.preview_url);

  // Trigger video stream after hovering for 150ms (debounced and fast)
  useEffect(() => {
    if (!isHovered) {
      setShouldPlay(false);
      return;
    }
    const timer = setTimeout(() => {
      setShouldPlay(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [isHovered]);

  return (
    <div 
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-[#0f0f13] rounded-xl overflow-hidden hover:-translate-y-1.5 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer shadow-xl select-none"
      id={`pack-card-${pack.id}`}
    >
      {/* Glow Backing Overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none blur-3xl rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`
        }}
      ></div>

      {/* Main Image Aspect Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 border-b border-white/5">
        <img 
          src={pack.thumbnail_url} 
          alt={pack.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Hover Trailer Autoplayer (Netflix-style stream) */}
        {shouldPlay && (
          <div className="absolute inset-0 bg-[#0A0A0A] z-20 pointer-events-none animate-in fade-in duration-300 overflow-hidden">
            {youtubeId ? (
              <iframe 
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`}
                className="absolute inset-0 w-[148%] h-[148%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none scale-105 z-20"
                allow="autoplay; encrypted-media"
                title={pack.title}
                referrerPolicy="no-referrer"
              />
            ) : (
              <video 
                src={pack.preview_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
              />
            )}
            
            {/* Live stream pill */}
            <div className="absolute bottom-2.5 right-2 text-zinc-100 font-mono text-[8px] bg-red-600/90 font-black px-1.5 py-0.5 rounded tracking-widest uppercase z-30 pointer-events-none shadow-md shadow-black/40">
              TRAILER PREVIEW
            </div>
          </div>
        )}

        {/* Gradient Shadow Shroud */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

        {/* Custom Solid Palette Stripe indicating Brand Colors */}
        <div 
          className="absolute top-0 inset-x-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`
          }}
        ></div>

        {/* Floating Top Indicators */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-auto">
          {/* Genre Badge */}
          <span className="text-[10px] font-bold tracking-wider uppercase text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
            {pack.genre}
          </span>
          
          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSavePack(pack.id);
            }}
            className={`p-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 ${
              isSaved 
                ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20 scale-105' 
                : 'bg-black/60 border-white/10 hover:border-white/25 text-zinc-400 hover:text-white hover:scale-105'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Bottom Hover Statistics */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-zinc-300 text-[10px] font-semibold leading-none">
          <div className="flex items-center gap-1.5 bg-black/65 backdrop-blur-sm px-2 py-1 rounded border border-white/5">
            <Eye className="w-3 h-3 text-zinc-400" />
            <span>{pack.view_count}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/65 backdrop-blur-sm px-2 py-1 rounded border border-white/5">
            <Download className="w-3 h-3 text-red-500" />
            <span>{pack.download_count}</span>
          </div>
        </div>

        {/* Quick Spec Badge Overlays inside container */}
        <div className="absolute top-[38%] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center gap-2 pointer-events-none">
          <span className="bg-red-600/90 text-white font-extrabold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
            VIEW PACK
          </span>
        </div>
      </div>

      {/* Description / Metadata Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-mono text-zinc-500 tracking-wider flex items-center gap-1 uppercase truncate mb-1">
            <Film className="w-3 h-3 text-red-500 shrink-0" />
            <span>{pack.anime_source}</span>
          </div>
          
          <h3 className="font-bold text-sm text-zinc-100 group-hover:text-white tracking-tight line-clamp-2 leading-tight transition-colors">
            {pack.title}
          </h3>
        </div>

        <div className="mt-3.5 pt-2 py-0.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span className="flex items-center gap-1 font-bold">
            <ListCollapse className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-white">{pack.clip_count}</span> CLIPS
          </span>
          <div className="flex gap-1.5">
            <span className="bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">{pack.resolution}</span>
            <span className="bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5 text-zinc-300">{pack.fps}FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
