import React, { useState, useRef, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, 
  Volume2, VolumeX, ArrowLeft, MoreHorizontal, Download, 
  ArrowRightLeft, Gauge, HelpCircle, Film, Minimize2, Maximize2 
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { Clip } from '../types';

interface PlayerProps {
  packId: string;
  onClose: () => void;
}

export const Player: React.FC<PlayerProps> = ({ packId, onClose }) => {
  const { packs, clips } = useApp();
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [aspectMode, setAspectMode] = useState<'contain' | 'cover' | 'reel' | 'square'>('contain');
  const [isMuted, setIsMuted] = useState(false);
  const [loopCurrent, setLoopCurrent] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Safely find the pack details and its clips database
  const pack = packs.find(p => p.id === packId);
  const packClips = clips
    .filter(c => c.scenepack_id === packId)
    .sort((a, b) => a.position - b.position);

  const activeClip: Clip | undefined = packClips[activeClipIndex];

  // Initialize playback state when active index increments
  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeClipIndex]);

  // Adjust playback speed rates
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  if (!pack || packClips.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center text-center p-4">
        <Film className="w-12 h-12 text-zinc-800 mb-4" />
        <h3 className="text-white text-lg font-bold">No streamable clips</h3>
        <p className="text-zinc-500 text-xs mt-1">This scenepack doesn\'t contain any individual clip files to stream.</p>
        <button onClick={onClose} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg text-xs">
          Return to Details
        </button>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipNext = () => {
    if (activeClipIndex < packClips.length - 1) {
      setActiveClipIndex(prev => prev + 1);
    } else {
      // Loop to beginning if continuous playback matches
      setActiveClipIndex(0);
    }
  };

  const skipPrev = () => {
    if (activeClipIndex > 0) {
      setActiveClipIndex(prev => prev - 1);
    } else {
      setActiveClipIndex(packClips.length - 1);
    }
  };

  const handleVideoEnded = () => {
    if (loopCurrent) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    } else {
      skipNext();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVal = parseFloat(e.target.value);
    setCurrentTime(targetVal);
    if (videoRef.current) {
      videoRef.current.currentTime = targetVal;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Convert aspect ratios to classes
  const getAspectClass = () => {
    switch (aspectMode) {
      case 'cover': return 'object-cover w-full h-full';
      case 'reel': return 'object-cover aspect-[9/16] h-[90%] max-w-sm rounded-xl border border-white/10 shadow-2xl shadow-black/80';
      case 'square': return 'object-cover aspect-square h-[85%] max-w-md rounded-xl border border-white/10 shadow-2xl shadow-black/80';
      case 'contain':
      default:
        return 'object-contain w-full h-full';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-300">
      
      {/* 1. Header Control Bar */}
      <div className="p-4 bg-gradient-to-b from-[#000]/70 to-transparent flex items-center justify-between text-left z-20">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onClose}
            className="p-2 bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 rounded-xl text-zinc-300 hover:text-white transition active:scale-95 cursor-pointer"
            id="player-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">{pack.anime_source}</span>
            <h2 className="text-sm font-extrabold text-white leading-none mt-1">{pack.title}</h2>
          </div>
        </div>

        {/* Counter state indicators */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-full text-xs font-mono text-zinc-400">
          <span className="text-white font-bold">CLIP INDEX:</span>
          <span>{activeClipIndex + 1} / {packClips.length}</span>
        </div>
      </div>

      {/* 2. Primary Showcase Video Panel */}
      <div className="flex-1 relative flex items-center justify-center bg-black/40">
        
        {/* Left Arrow trigger overlay */}
        <button
          onClick={skipPrev}
          className="absolute left-4 z-25 p-3 rounded-full bg-black/70 hover:bg-zinc-950 text-zinc-400 hover:text-white border border-white/5 shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer"
          title="Previous clip"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Arrow trigger overlay */}
        <button
          onClick={skipNext}
          className="absolute right-4 z-25 p-3 rounded-full bg-black/70 hover:bg-zinc-950 text-zinc-400 hover:text-white border border-white/5 shadow-2xl hover:scale-105 active:scale-95 transition cursor-pointer"
          title="Next clip"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Active playback device container */}
        <div className="w-full h-full flex items-center justify-center bg-transparent">
          {activeClip ? (
            <video
              ref={videoRef}
              src={activeClip.sample_url}
              autoPlay={isPlaying}
              loop={loopCurrent}
              muted={isMuted}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className={`transition-all duration-300 ${getAspectClass()}`}
            />
          ) : (
            <div className="text-zinc-600 font-mono text-xs flex flex-col items-center gap-2">
              <Film className="w-10 h-10 mb-1" />
              <span>No clip payload loaded</span>
            </div>
          )}
        </div>

        {/* Vertical social guidelines layout indicator overlays */}
        {aspectMode === 'reel' && (
          <div className="absolute pointer-events-none z-10 bottom-24 text-center px-4">
            <span className="text-[10px] font-mono bg-zinc-950/80 border border-red-500/20 text-red-400 px-2 py-1 rounded">
              VERTICAL 9:16 SOCIAL RATIO PRESET
            </span>
          </div>
        )}
      </div>

      {/* 3. Footer Control Deck (Seek bar & Parameters) */}
      <div className="p-4 lg:p-6 bg-gradient-to-t from-[#000]/95 via-[#000]/85 to-transparent flex flex-col gap-4 z-20">
        
        {/* Time Progress Seek Bar */}
        <div className="flex items-center gap-3.5 text-xs font-mono text-zinc-400 mb-1 w-full">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleProgressBarChange}
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control Buttons Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Active Clip Title & Spec */}
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold bg-zinc-900 border border-white/5 text-zinc-400 px-1.5 py-0.5 rounded">
                CLIP #{activeClip?.position}
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                Res: {activeClip?.resolution || '1080p'}
              </span>
            </div>
            <h4 className="font-bold text-xs md:text-sm text-zinc-100 line-clamp-1 leading-none mt-0.5">
              {activeClip?.name || 'Untitled Segment'}
            </h4>
          </div>

          {/* Center Playback Trigger Row */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={skipPrev}
              className="p-1.5 text-zinc-400 hover:text-white transition active:scale-90"
              title="Previous scene"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-full transition active:scale-95 shadow-md shadow-red-600/10 cursor-pointer"
              title={isPlaying ? "Pause clip" : "Play clip"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white text-white" /> : <Play className="w-5 h-5 fill-white text-white" />}
            </button>

            <button
              onClick={skipNext}
              className="p-1.5 text-zinc-400 hover:text-white transition active:scale-90"
              title="Next scene"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Parameters (Speed, Crop Aspect, Loop, Volume) */}
          <div className="flex items-center justify-end flex-wrap gap-2.5">
            {/* Speed Rate Toggle */}
            <div className="flex bg-zinc-950 p-0.5 border border-white/5 rounded-lg text-[9px] font-mono">
              {[0.5, 1, 1.5, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  className={`px-1.5 py-1 font-bold rounded transition ${
                    playbackRate === speed 
                      ? 'bg-red-600 text-white' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Aspect Scale Adjuster */}
            <div className="flex bg-zinc-950 p-0.5 border border-white/5 rounded-lg text-[9px] font-mono">
              {[
                { id: 'contain', label: '16:9' },
                { id: 'cover', label: 'FILL' },
                { id: 'reel', label: '9:16' },
                { id: 'square', label: '1:1' }
              ].map(aspect => (
                <button
                  key={aspect.id}
                  onClick={() => setAspectMode(aspect.id as any)}
                  className={`px-1.5 py-1 rounded transition ${
                    aspectMode === aspect.id 
                      ? 'bg-zinc-800 text-white font-extrabold' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title={`Set crop to: ${aspect.label}`}
                >
                  {aspect.label}
                </button>
              ))}
            </div>

            {/* Repeat loop selector */}
            <button
              onClick={() => setLoopCurrent(!loopCurrent)}
              className={`px-2 py-1.5 bg-zinc-950 border border-white/5 rounded-lg text-[10px] font-mono transition font-bold ${
                loopCurrent ? 'text-emerald-500 border-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Loops the current video clip continuously"
            >
              {loopCurrent ? 'LOOPING' : 'AUTO-PLAY'}
            </button>

            {/* Volume toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-zinc-950 border border-white/5 hover:border-white/12 rounded-lg text-zinc-400 hover:text-white transition"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
