import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Volume2, VolumeX, Download, Bookmark, Share2, 
  Play, Calendar, Maximize2, Monitor, Cpu, HardDrive, 
  Eye, Check, ListPlus, ChevronDown, ChevronUp, Clock, HelpCircle, AlertCircle
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { ClipList } from '../components/packs/ClipList';
import { ScenePack } from '../types';

interface PackDetailProps {
  packId: string;
  onBack: () => void;
  onStreamClick: (packId: string) => void;
  onViewProfileEmail: (email: string) => void;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: (() => void) | undefined;
    YT: any;
  }
}

export const PackDetail: React.FC<PackDetailProps> = ({ packId, onBack, onStreamClick, onViewProfileEmail }) => {
  const { 
    packs, clips, savedPacks, toggleSavePack, playlists, 
    addPackToPlaylist, incrementViewCount, incrementDownloadCount, currentUser 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [readMore, setReadMore] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [isPlayingMuted, setIsPlayingMuted] = useState(true);

  // YouTube Player Ref
  const ytPlayerRef = useRef<any>(null);
  const ytContainerId = `yt-player-${packId}`;

  // Find current pack details safely
  const pack = packs.find(p => p.id === packId);

  // Automatically increment view counter on mount
  useEffect(() => {
    if (packId) {
      incrementViewCount(packId);
    }
  }, [packId]);

  // Parse YouTube video ID helper
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const finalVideoUrl = pack ? (pack.trailer_url || pack.preview_url || '') : '';
  const ytVideoId = getYouTubeId(finalVideoUrl);
  const isDirectVideo = finalVideoUrl ? (
    finalVideoUrl.endsWith('.mp4') || 
    finalVideoUrl.includes('.mp4?') || 
    finalVideoUrl.endsWith('.webm') || 
    finalVideoUrl.includes('.webm?')
  ) : false;

  // Initialize YouTube IFrame API script dynamically
  useEffect(() => {
    if (!ytVideoId || isDirectVideo) return;

    // Load API script
    const loadYTAPI = () => {
      if (window.YT && window.YT.Player) {
        initYTPlayer();
        return;
      }

      // If already loading
      if (document.getElementById('yt-api-script')) {
        const checkReady = setInterval(() => {
          if (window.YT && window.YT.Player) {
            initYTPlayer();
            clearInterval(checkReady);
          }
        }, 100);
        return;
      }

      const tag = document.createElement('script');
      tag.id = 'yt-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initYTPlayer();
      };
    };

    const initYTPlayer = () => {
      try {
        if (ytPlayerRef.current) {
          ytPlayerRef.current.destroy();
        }
        
        ytPlayerRef.current = new window.YT.Player(ytContainerId, {
          videoId: ytVideoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            loop: 1,
            playlist: ytVideoId, // Required for loops
            scrolling: 'no',
            playsinline: 1,
            iv_load_policy: 3
          },
          events: {
            onReady: (event: any) => {
              event.target.playVideo();
              if (isPlayingMuted) {
                event.target.mute();
              } else {
                event.target.unmute();
                event.target.setVolume(100);
              }
            }
          }
        });
      } catch (err) {
        console.error('Failed to initialize YouTube IFrame Player:', err);
      }
    };

    loadYTAPI();

    return () => {
      // Cleanup player
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [packId, ytVideoId, isDirectVideo]);

  if (!pack) {
    return (
      <div className="py-24 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-white text-lg font-bold">Scenepack not found</h3>
        <p className="text-zinc-500 text-xs mt-1">This collect may have been deleted, unlisted, or taken down by moderation.</p>
        <button onClick={onBack} className="mt-6 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs text-white">
          Back to Browse
        </button>
      </div>
    );
  }

  // FIX 3: Sort clips by position to ensure correct order
  const associatedClips = clips
    .filter(c => c.scenepack_id === pack.id)
    .sort((a, b) => a.position - b.position);

  const isSaved = savedPacks.some(s => s.scenepack_id === pack.id && s.user_email === currentUser?.email);

  const gradFrom = pack.gradient_from || '#1F1F1F';
  const gradTo = pack.gradient_to || '#111111';

  // Toggle Mute without restarting stream!
  const toggleMute = () => {
    const targetState = !isPlayingMuted;
    setIsPlayingMuted(targetState);

    // YouTube API toggle
    if (ytPlayerRef.current && typeof ytPlayerRef.current.mute === 'function') {
      if (targetState) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unmute();
        if (typeof ytPlayerRef.current.setVolume === 'function') {
          ytPlayerRef.current.setVolume(100);
        }
      }
    }

    // Native HTML5 video toggle
    const html5Video = document.getElementById('native-hero-video') as HTMLVideoElement;
    if (html5Video) {
      html5Video.muted = targetState;
    }
  };

  const handleShare = () => {
    const packUrl = `${window.location.origin}/pack/${pack.id}`;
    navigator.clipboard.writeText(packUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrimaryPackDownload = () => {
    incrementDownloadCount(pack.id);
    if (pack.download_link) {
      window.open(pack.download_link, '_blank');
    }
  };

  return (
    <div className="relative pb-16 animate-in fade-in duration-300 text-left">
      {/* 1. Large Hero Video Background Billboard */}
      <div 
        className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden bg-zinc-950 flex flex-col justify-between"
        id="detail-hero-banner"
      >
        {/* Absolute image/video background */}
        <div className="absolute inset-0 z-0">
          {isDirectVideo ? (
            <video
              id="native-hero-video"
              src={finalVideoUrl}
              autoPlay
              muted={isPlayingMuted}
              loop
              playsInline
              className="w-full h-full object-cover scale-102 transform duration-700"
            />
          ) : ytVideoId ? (
            /* YouTube IFrame Placeholder Frame */
            <div className="w-full h-full pointer-events-none scale-110 overflow-hidden relative">
              <div id={ytContainerId} className="w-full h-full absolute inset-0"></div>
              {/* Overlay covering youtube to block clicking on it */}
              <div className="absolute inset-0 bg-transparent"></div>
            </div>
          ) : (
            /* Fallback static poster image if no preview is attached */
            <img 
              src={pack.banner_url || pack.thumbnail_url} 
              alt={pack.title}
              className="w-full h-full object-cover opacity-35"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Premium Ambient Underlay Gradient */}
          <div 
            className="absolute inset-0 mix-blend-multiply opacity-25"
            style={{
              background: `linear-gradient(to right, ${gradFrom}, ${gradTo})`
            }}
          ></div>

          {/* Master Shrouds overlay to protect card detail lines */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/45 to-transparent"></div>
          <div className="absolute inset-y-0 left-0 w-full md:w-[60%] bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/35 to-transparent"></div>
        </div>

        {/* Floating Controls Row (Back & Mute) */}
        <div className="relative z-10 p-4 lg:p-8 flex items-center justify-between pointer-events-auto">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-black border border-white/5 hover:border-white/10 text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer backdrop-blur-md"
            id="detail-go-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold pr-1.5">Back</span>
          </button>

          {(ytVideoId || isDirectVideo) && (
            <button
              onClick={toggleMute}
              className="p-2.5 rounded-xl bg-black/60 hover:bg-black border border-white/5 hover:border-white/10 text-white flex items-center gap-2 transition active:scale-95 cursor-pointer backdrop-blur-md"
              id="detail-audio-toggle-btn"
            >
              {isPlayingMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-xs font-mono">UNMUTE SNEAK PREVIEW</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span className="text-xs font-mono font-bold">MUTE PREVIEW AUDIO</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Content Page Structure (Negative Margin Overlap) */}
      <div className="relative z-10 px-4 lg:px-8 max-w-7xl mx-auto -mt-16 md:-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Film Poster Miniature (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#0a0a0c] border border-white/10 shadow-2xl">
              <img 
                src={pack.thumbnail_url} 
                alt={pack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div 
                className="absolute bottom-0 inset-x-0 h-1.5"
                style={{
                  background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`
                }}
              ></div>
            </div>
            
            {/* Short Uploader Info card under poster */}
            <div className="mt-4 p-4 bg-zinc-950/40 border border-white/5 rounded-xl text-xs space-y-2.5">
              <span className="text-[9px] font-mono font-bold text-zinc-500 block uppercase">PACK CREATOR</span>
              <div 
                onClick={() => onViewProfileEmail(pack.uploader_email)}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition"
              >
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center font-black text-white text-[11px] uppercase">
                  {pack.uploader_name.slice(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-200">{pack.uploader_name}</span>
                  <span className="text-[10px] text-zinc-500">{pack.uploader_email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Metadata Panels and Clip Listings */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Title Block */}
            <div className="space-y-2.5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white bg-red-600 px-2.5 py-0.5 rounded border border-red-500/10">
                  {pack.genre}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded">
                  {pack.resolution}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded">
                  {pack.fps}FPS
                </span>
                
                {/* Admin moderation badge */}
                {pack.status === 'in_review' && (
                  <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded animate-pulse">
                    IN REVIEW MODERATION
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-zinc-400 font-mono text-xs md:text-sm tracking-widest uppercase">
                  {pack.anime_source}
                </span>
                <h2 className="text-xl md:text-3xl font-black text-white tracking-tight mt-1 leading-tight drop-shadow-md">
                  {pack.title}
                </h2>
              </div>
            </div>

            {/* Core Statistics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-y border-white/5 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-zinc-500" /> Views: <strong className="text-white">{pack.view_count}</strong></span>
              <span className="flex items-center gap-1.5"><Download className="w-4 h-4 text-red-500" /> Downloads: <strong className="text-white">{pack.download_count}</strong></span>
              <span className="flex items-center gap-1.5"><Bookmark className="w-4 h-4 text-amber-500" /> Bookmarks: <strong className="text-white">{pack.save_count}</strong></span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-500" /> Clips: <strong className="text-white">{pack.clip_count} items</strong></span>
            </div>

            {/* Call To Actions Block */}
            <div className="flex flex-wrap items-center gap-3 w-full">
              
              {/* Stream Full Pack */}
              <button
                onClick={() => onStreamClick(pack.id)}
                id="detail-stream-main-btn"
                className="px-5 py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 active:scale-95 transition shadow-lg shadow-white/5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-zinc-950 text-zinc-950" />
                <span>Stream Clips</span>
              </button>

              {/* Download Full Scene Pack External Link */}
              {pack.download_link && (
                <button
                  onClick={handlePrimaryPackDownload}
                  id="detail-download-pack-btn"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 active:scale-95 transition shadow-lg shadow-red-600/15 cursor-pointer"
                  title="Increments download metrics & opens host"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Pack ({pack.file_size})</span>
                </button>
              )}

              {/* Bookmark Toggle */}
              <button
                onClick={() => toggleSavePack(pack.id)}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                  isSaved 
                    ? 'bg-[#181115] border-red-500/20 text-red-500' 
                    : 'bg-zinc-900 border-white/5 text-zinc-300 hover:text-white hover:border-white/10'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                <span>{isSaved ? "Bookmarked!" : "Add Bookmark"}</span>
              </button>

              {/* Share pack */}
              <button
                onClick={handleShare}
                className="px-3.5 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/12 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Copied link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Share Link</span>
                  </>
                )}
              </button>

              {/* Add to Playlist trigger */}
              {playlists.length > 0 && (
                <div className="relative">
                  <button 
                    onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                    className="px-3.5 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/12 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                  >
                    <ListPlus className="w-4 h-4" />
                    <span>Add to Playlist</span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>

                  {showPlaylistMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowPlaylistMenu(false)}></div>
                      <div className="absolute left-0 mt-1.5 w-56 bg-zinc-950 border border-white/10 rounded-xl p-1.5 text-zinc-200 z-20 shadow-2xl animate-in duration-200 text-left">
                        <span className="text-[9px] font-mono text-zinc-500 px-2 py-1.5 block border-b border-white/5 mb-1 bg-zinc-900/10 rounded">
                          SELECT PLAYLIST CONTAINER
                        </span>
                        {playlists.map(pl => {
                          const alreadyIn = pl.pack_ids.includes(pack.id);
                          return (
                            <button
                              key={pl.id}
                              onClick={() => {
                                addPackToPlaylist(pl.id, pack.id);
                                setShowPlaylistMenu(false);
                              }}
                              disabled={alreadyIn}
                              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg text-left"
                            >
                              <span>{pl.name}</span>
                              {alreadyIn && <span className="text-[9px] text-emerald-500 font-mono">ADDED</span>}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Description card */}
            <div className="p-4 bg-zinc-950/25 border border-white/5 rounded-2xl relative text-left">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                OVERVIEW
              </span>
              <p className={`text-zinc-300 text-xs md:text-sm leading-relaxed ${readMore ? '' : 'line-clamp-3'}`}>
                {pack.description}
              </p>
              
              {/* Expand Toggle */}
              {pack.description && pack.description.length > 200 && (
                <button
                  onClick={() => setReadMore(!readMore)}
                  className="mt-2.5 text-xs text-red-500 font-bold hover:text-red-400 flex items-center gap-0.5 shadow-none hover:underline"
                >
                  {readMore ? (
                    <>Collapse Details <ChevronUp className="w-3.5 h-3.5" /></>
                  ) : (
                    <>Read Full Description <ChevronDown className="w-3.5 h-3.5" /></>
                  )}
                </button>
              )}

              {/* Keywords Pills */}
              {pack.tags && pack.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {pack.tags.map((tag, idx) => (
                    <span 
                      key={`${tag}-${idx}`} 
                      className="text-[10px] font-mono text-zinc-400 bg-zinc-900/85 border border-white/5 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Clip Extracts list rendering */}
            <ClipList pack={pack} clips={associatedClips} />

          </div>
        </div>
      </div>
    </div>
  );
};