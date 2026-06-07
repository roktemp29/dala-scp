import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, HelpCircle, Film, ArrowUpRight, Plus, Download } from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { HeroSection } from '../components/packs/HeroSection';
import { ScrollRow } from '../components/packs/ScrollRow';

interface HomeProps {
  onPackClick: (packId: string) => void;
  onStreamClick: (packId: string) => void;
  onTabChange: (tabId: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onPackClick, onStreamClick, onTabChange }) => {
  const { packs } = useApp();

  // Filter only published and public packs
  const publishedPacks = useMemo(() => {
    return packs.filter(p => p.status === 'published' && p.visibility === 'public');
  }, [packs]);

  // Derive specialized groupings client-side
  const featuredPack = useMemo(() => {
    // Prefer Leo Pack or whatever has the most downloads
    if (publishedPacks.length === 0) return null;
    return [...publishedPacks].sort((a,b) => b.download_count - a.download_count)[0];
  }, [publishedPacks]);

  const newUploads = useMemo(() => {
    return [...publishedPacks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);
  }, [publishedPacks]);

  const top10ThisWeek = useMemo(() => {
    return [...publishedPacks].sort((a, b) => b.download_count - a.download_count).slice(0, 10);
  }, [publishedPacks]);

  const trendingNow = useMemo(() => {
    return [...publishedPacks].sort((a, b) => b.view_count - a.view_count).slice(0, 15);
  }, [publishedPacks]);

  const massPacks = useMemo(() => publishedPacks.filter(p => p.genre === 'Mass'), [publishedPacks]);
  const actionPacks = useMemo(() => publishedPacks.filter(p => p.genre === 'Action'), [publishedPacks]);
  const aestheticPacks = useMemo(() => publishedPacks.filter(p => p.genre === 'Aesthetic'), [publishedPacks]);
  const rawPacks = useMemo(() => publishedPacks.filter(p => p.genre === 'RAW'), [publishedPacks]);

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 text-left">
      {/* Featured Hero Banner */}
      {featuredPack ? (
        <HeroSection 
          pack={featuredPack}
          onStreamClick={() => onStreamClick(featuredPack.id)}
          onMoreInfoClick={() => onPackClick(featuredPack.id)}
        />
      ) : (
        <div className="py-20 text-center bg-zinc-950 rounded-2xl border border-white/5 mx-2.5">
          <Film className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">No scenepacks published yet</h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">Be the pioneer! Upload your first Tamil movie or Anime scene collections right now.</p>
          <button
            onClick={() => onTabChange('upload')}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold tracking-wide shadow-lg shadow-red-600/10 active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Upload Scenepack</span>
          </button>
        </div>
      )}

      {/* Main Rows Layout */}
      {publishedPacks.length > 0 && (
        <div className="space-y-6">
          
          {/* Newest Collections */}
          <ScrollRow 
            title="Newly Uploaded Scenepacks" 
            subtitle="The latest direct extract scene packs from fresh Tamil movies and visual anime series"
            packs={newUploads}
            onPackClick={onPackClick}
          />

          {/* Trending Scene Packs */}
          <ScrollRow 
            title="Trending Now" 
            subtitle="Most viewed scene collections and dialogue sequences this week by creators"
            packs={trendingNow}
            onPackClick={onPackClick}
          />

          {/* Netflix Top 10 with Giant Rank Badges */}
          {top10ThisWeek.length > 0 && (
            <div className="relative my-8 px-1 text-left">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Top 10 Most Downloaded Collections
                <span className="text-[10px] font-mono bg-red-500/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded">
                  STATS LIVE
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Direct downloads from high-speed external hosts (Mega, MediaFire, Pixeldrain)</p>

              <div className="flex gap-4 overflow-x-auto pt-6 pb-4 scrollbar-none snap-x snap-mandatory">
                {top10ThisWeek.map((pack, idx) => {
                  const num = idx + 1;
                  return (
                    <div 
                      key={`top-${pack.id}`}
                      onClick={() => onPackClick(pack.id)}
                      className="group relative flex items-end pl-12 md:pl-16 min-w-[240px] md:min-w-[280px] shrink-0 snap-start cursor-pointer transition select-none"
                    >
                      {/* Giant Number Label underlay */}
                      <span className="absolute left-0 bottom-[-10px] md:bottom-[-20px] text-7xl md:text-9xl font-black text-zinc-900/90 group-hover:text-red-600/40 select-none leading-none tracking-tighter transition-colors z-0">
                        {num}
                      </span>

                      {/* Small Overlay Pack Miniature Block */}
                      <div className="relative aspect-[3/4] w-28 md:w-36 bg-[#0c0c0e] hover:scale-105 rounded-lg overflow-hidden border border-white/5 hover:border-white/15 shadow-2xl z-10 transition-all duration-300">
                        <img 
                          src={pack.thumbnail_url} 
                          alt={pack.title} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute top-1 right-1 bg-black/75 px-1 rounded text-[8px] font-mono text-zinc-300">
                          {pack.resolution}
                        </div>
                        <div className="absolute bottom-1.5 inset-x-1.5 flex flex-col justify-end text-left">
                          <span className="text-[9px] font-mono text-zinc-400 leading-none truncate">{pack.anime_source}</span>
                          <span className="text-[10px] font-bold text-white leading-tight line-clamp-1 mt-0.5">{pack.title}</span>
                        </div>
                      </div>

                      {/* Floating Statistics label */}
                      <div className="absolute bottom-2 left-[125px] md:left-[160px] text-[10px] font-mono bg-zinc-950 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 shadow-2xl z-20 pointer-events-none text-zinc-400">
                        <Download className="w-3 h-3 text-red-500" />
                        <span>{pack.download_count} DL</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mass Tamil rows */}
          {massPacks.length > 0 && (
            <ScrollRow 
              title="Mass Swag Sequences (Mangattha, Jailer...)" 
              subtitle="Slow motion walk, cigarette flare, sunglasses adjustments, and alpha entrance clips"
              packs={massPacks}
              onPackClick={onPackClick}
            />
          )}

          {/* High Action raw tracks */}
          {actionPacks.length > 0 && (
            <ScrollRow 
              title="High-Bitrate Cine Action Clips" 
              subtitle="Sword fights, cage matches, heavy weapon syncs and impact frame moments"
              packs={actionPacks}
              onPackClick={onPackClick}
            />
          )}

          {/* RAW Clips */}
          {rawPacks.length > 0 && (
            <ScrollRow 
              title="Ungraded Log / RAW Scenepacks" 
              subtitle="Raw profile captures for editors looking to practice their unique LUT and curves calibrations"
              packs={rawPacks}
              onPackClick={onPackClick}
            />
          )}

          {/* Aesthetic Anime Rows */}
          {aestheticPacks.length > 0 && (
            <ScrollRow 
              title="Aesthetic & Neon Cyber Clips" 
              subtitle="High frame rate cybernetic glows, twilight backgrounds, and neon lightning effects"
              packs={aestheticPacks}
              onPackClick={onPackClick}
            />
          )}

        </div>
      )}
    </div>
  );
};
