import React, { useState, useRef } from 'react';
import { Play, Check, Film, Tv, VideoOff, Volume2, VolumeX, Flame } from 'lucide-react';
import { Clip } from '../../types';

interface ClipRowProps {
  clip: Clip;
  isSelected: boolean;
  onSelectToggle: () => void;
  onPreviewClick: (clip: Clip) => void;
}

export const ClipRow: React.FC<ClipRowProps> = ({ clip, isSelected, onSelectToggle, onPreviewClick }) => {
  const [inlinePlaying, setInlinePlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleInlineHoverEnter = () => {
    setInlinePlaying(true);
    const v = videoRef.current;
    if (!v) return;
    // If already loaded enough, play immediately; otherwise wait for canplay
    if (v.readyState >= 3) {
      v.play().catch(() => {});
    } else {
      v.load();
      const onCanPlay = () => {
        v.play().catch(() => {});
        v.removeEventListener('canplay', onCanPlay);
      };
      v.addEventListener('canplay', onCanPlay);
    }
  };

  const handleInlineHoverLeave = () => {
    setInlinePlaying(false);
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <tr 
      className={`group border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
        isSelected ? 'bg-red-500/5' : ''
      }`}
      id={`clip-row-${clip.id}`}
    >
      {/* Checkbox for Batch Selection */}
      <td className="py-4 pl-4 text-center">
        <label className="relative flex items-center justify-center cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={onSelectToggle}
            className="sr-only peer"
          />
          <div className="w-4 h-4 bg-zinc-900 border border-zinc-700 peer-checked:bg-red-500 peer-checked:border-red-500 rounded flex items-center justify-center transition-all">
            <Check className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" />
          </div>
        </label>
      </td>

      {/* Position ID */}
      <td className="py-4 pr-3 text-center text-xs font-mono text-zinc-500">
        {clip.position < 10 ? `0${clip.position}` : clip.position}
      </td>

      {/* Inline Preview / Thumbnail */}
      <td className="py-3 pr-4">
        <div 
          onMouseEnter={handleInlineHoverEnter}
          onMouseLeave={handleInlineHoverLeave}
          onClick={() => onPreviewClick(clip)}
          className="relative w-28 md:w-36 aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-white/5 cursor-pointer shadow-inner shrink-0"
        >
          {/* Static Backdrop */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-zinc-950 to-zinc-900">
            <Film className="w-5 h-5 text-zinc-700 group-hover:text-red-500/75 transition-colors" />
            <Play className="absolute w-6 h-6 text-white/40 group-hover:text-red-500 group-hover:scale-110 transition-all z-10" />
          </div>

          {/* Inline Video Player Stream */}
          {clip.sample_url && (
            <video
              ref={videoRef}
              src={clip.sample_url}
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                inlinePlaying ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {/* Quick volume control inside micro preview */}
          {inlinePlaying && (
            <button
              onClick={toggleMute}
              className="absolute bottom-1.5 right-1.5 z-20 p-1 rounded bg-black/80 hover:bg-black text-zinc-300 hover:text-white transition"
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          )}

          {/* Running time badge */}
          <span className="absolute bottom-1 left-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[9px] text-zinc-300 font-mono tracking-wide">
            {formatDuration(clip.duration)}
          </span>
        </div>
      </td>

      {/* Clip Name */}
      <td className="py-4 px-2">
        <div className="flex flex-col gap-1">
          <span onClick={() => onPreviewClick(clip)} className="text-sm font-semibold text-zinc-100 hover:text-red-400 cursor-pointer line-clamp-1 transition-colors">
            {clip.name}
          </span>
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Tv className="w-3.5 h-3.5" />
            VFX Scenepack Clip #{clip.position}
          </span>
        </div>
      </td>

      {/* Resolution */}
      <td className="py-4 px-2 hidden sm:table-cell text-xs font-mono text-zinc-300 shrink-0">
        <span className="bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-400">
          {clip.resolution || '1080p'}
        </span>
      </td>

      {/* Version Badges: RAW, Graded */}
      <td className="py-4 px-2 hidden md:table-cell text-center">
        <div className="flex items-center gap-1.5 justify-center">
          {clip.has_raw ? (
            <span className="text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded">
              RAW
            </span>
          ) : (
            <span className="text-[9px] text-zinc-600 px-1.5">—</span>
          )}
          {clip.has_graded ? (
            <span className="text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 px-1.5 py-0.5 rounded">
              Graded
            </span>
          ) : (
            <span className="text-[9px] text-zinc-600 px-1.5">—</span>
          )}
        </div>
      </td>

      {/* Play Action button */}
      <td className="py-4 pr-4 text-right">
        <button
          onClick={() => onPreviewClick(clip)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-white/5 hover:border-red-500/30 text-xs font-semibold text-zinc-300 hover:text-white rounded-lg hover:bg-red-500/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Play className="w-3 h-3 text-red-500 fill-red-500" />
          <span>Stream</span>
        </button>
      </td>
    </tr>
  );
};