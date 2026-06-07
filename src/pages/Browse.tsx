import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, SlidersHorizontal, Grid, List, X, Flame, ChevronRight, 
  Settings2, Download, Eye, ListCollapse, HelpCircle 
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { PackCard } from '../components/packs/PackCard';
import { ScenePack } from '../types';

interface BrowseProps {
  onPackClick: (packId: string) => void;
  defaultGenre?: string;
  defaultSearch?: string;
}

const GENRES = [
  'All', 'Action', 'Drama', 'Romance', 'Thriller', 'Comedy', 
  'Horror', 'Mass', 'Slow-Mo', 'Aesthetic', 'Vintage', 'RAW', 'Graded', 'Dance'
];

const RESOLUTIONS = ['All', '4K', '1080p', '720p', '480p'];

export const Browse: React.FC<BrowseProps> = ({ onPackClick, defaultGenre = 'All', defaultSearch = '' }) => {
  const { packs } = useApp();

  // Search, Genre, Resolution, Sorting, and Layout States
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [selectedGenre, setSelectedGenre] = useState(defaultGenre);
  const [selectedResolution, setSelectedResolution] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'clips' | 'alphabetical' | 'views'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Sync default inputs from router / external trigger clicks
  useEffect(() => {
    if (defaultGenre) setSelectedGenre(defaultGenre);
    if (defaultSearch) setSearchQuery(defaultSearch);
  }, [defaultGenre, defaultSearch]);

  // Filtering Logic
  const filteredPacks = useMemo(() => {
    return packs
      .filter(p => p.status === 'published' && p.visibility === 'public')
      .filter(p => {
        // Genre filter check
        if (selectedGenre !== 'All' && p.genre !== selectedGenre) return false;
        
        // Resolution filter check
        if (selectedResolution !== 'All' && p.resolution !== selectedResolution) return false;

        // Search text matching
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(query);
          const matchSource = p.anime_source.toLowerCase().includes(query);
          const matchGenre = p.genre.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          const matchTags = p.tags.some(t => t.toLowerCase().includes(query));
          return matchTitle || matchSource || matchGenre || matchDesc || matchTags;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'downloads') {
          return b.download_count - a.download_count;
        }
        if (sortBy === 'views') {
          return b.view_count - a.view_count;
        }
        if (sortBy === 'clips') {
          return b.clip_count - a.clip_count;
        }
        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [packs, searchQuery, selectedGenre, selectedResolution, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Search and Core Filter Header */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between bg-zinc-950/40 border border-white/5 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search movie pack, actor (Ajith, Vijay), anime (Zenitsu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-[#0a0a0c] hover:bg-zinc-900/60 focus:bg-[#0c0c0f] text-xs text-white placeholder-zinc-500 rounded-xl border border-white/5 focus:border-red-500/50 outline-none transition-all"
            id="browse-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Display modifiers triggers */}
        <div className="flex items-center gap-2">
          {/* Quick filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none ${
              selectedResolution !== 'All' || showFilters
                ? 'bg-red-500/10 border-red-500/30 text-white'
                : 'bg-zinc-900 border-white/5 text-zinc-300 hover:text-white hover:border-white/10'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
            <span>Resolution / Sort</span>
          </button>

          {/* View Mode Grid/List toggle toggle */}
          <div className="flex bg-zinc-90 w-fit p-1 bg-zinc-900 border border-white/5 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' 
                  ? 'bg-white/10 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Grid Layout"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'list' 
                  ? 'bg-white/10 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Compact Row Layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Drawer Filters (Resolution / Sort By) */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-[#0b0b0e] border border-white/5 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300"
          id="advanced-filters-block"
        >
          {/* Resolutions Filter */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
              FILTER BY RESOLUTION
            </span>
            <div className="flex flex-wrap gap-2">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res}
                  onClick={() => setSelectedResolution(res)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition cursor-pointer select-none ${
                    selectedResolution === res
                      ? 'bg-red-500/10 border border-red-500/40 text-red-400'
                      : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By Filter */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
              SORT SPECIFICATIONS
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'newest', label: 'Newest first' },
                { id: 'downloads', label: 'Max DLs' },
                { id: 'views', label: 'Max Views' },
                { id: 'clips', label: 'Max Clips' },
                { id: 'alphabetical', label: 'Alphabetical' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortBy(option.id as any)}
                  className={`px-1.5 py-2 rounded-lg text-xs font-medium text-center truncate transition cursor-pointer select-none ${
                    sortBy === option.id
                      ? 'bg-red-500/10 border border-red-500/40 text-red-500 font-bold'
                      : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Horizontal genre scroll slider (scrolling category capsules) */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {GENRES.map((g) => {
            const isActive = selectedGenre === g;
            return (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-full tracking-wide select-none transition cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/10'
                    : 'bg-zinc-900/80 border border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Title Area */}
      <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase tracking-widest">
        <span>CURRENT SELECTIONS</span>
        <span>FOUND {filteredPacks.length} MATCHING PACKS</span>
      </div>

      {/* Grid or List list representation */}
      <AnimatePresence mode="popLayout">
        {filteredPacks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="py-24 text-center bg-zinc-950/20 border border-white/5 rounded-2xl flex flex-col items-center justify-center placeholder-block"
            id="search-empty-state"
          >
            <Settings2 className="w-12 h-12 text-zinc-800 mb-4 animate-spin duration-1000" />
            <h4 className="text-zinc-200 text-base font-bold uppercase tracking-wider">No matching scenepacks</h4>
            <p className="text-zinc-500 text-xs mt-1.5 max-w-sm">No results with these configuration parameters. Try adjusting filters or resetting search input.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('All');
                setSelectedResolution('All');
              }}
              className="mt-6 px-4 py-2 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl text-xs active:scale-95 transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"
            id="browse-grid-container"
          >
            {filteredPacks.map((pack) => (
              <motion.div
                key={pack.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <PackCard pack={pack} onClick={() => onPackClick(pack.id)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="flex flex-col gap-3"
            id="browse-list-container"
          >
            {filteredPacks.map((pack) => (
              <motion.div
                key={pack.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={() => onPackClick(pack.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0e0e11] hover:bg-zinc-900/40 border border-white/5 hover:border-white/12 rounded-xl transition cursor-pointer select-none"
              >
                <div className="flex items-center gap-4 text-left">
                  <img 
                    src={pack.thumbnail_url} 
                    alt={pack.title}
                    className="w-12 h-16 rounded object-cover border border-white/5 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[9px] font-mono font-bold text-red-500 uppercase">{pack.anime_source}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5 leading-tight">{pack.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 mt-1.5 leading-none">
                      <span className="text-zinc-400 bg-zinc-950 border border-white/5 px-1.5 py-0.5 rounded capitalize">{pack.genre}</span>
                      <span>{pack.clip_count} clips</span>
                      <span>{pack.resolution}</span>
                      <span>{pack.fps}FPS</span>
                      <span className="text-zinc-600">|</span>
                      <span>By {pack.uploader_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-3 sm:mt-0 justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-2.5 sm:pt-0">
                  <div className="flex gap-5 text-zinc-500 font-mono text-[10px]">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {pack.view_count}</span>
                    <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-zinc-400" /> {pack.download_count}</span>
                  </div>
                  <span className="text-zinc-400 text-xs font-mono font-bold shrink-0 bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-white/5">
                    {pack.file_size}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
