import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Download, CheckSquare, Square, Film, Sparkles, AlertCircle, 
  Play, Volume2, VolumeX, X, Loader2, ArrowRightLeft, Maximize2, VideoOff 
} from 'lucide-react';
import { Clip, ScenePack } from '../../types';
import { ClipRow } from './ClipRow';

interface ClipListProps {
  pack: ScenePack;
  clips: Clip[];
}

export const ClipList: React.FC<ClipListProps> = ({ pack, clips }) => {
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [activePreviewClip, setActivePreviewClip] = useState<Clip | null>(null);
  const [isPreviewMuted, setIsPreviewMuted] = useState(true); // Start muted — browsers require muted for autoplay
  const [isZipping, setIsZipping] = useState(false);
  const [zippingProgress, setZippingProgress] = useState('');
  const [zippingError, setZippingError] = useState('');

  const isAllSelected = clips.length > 0 && selectedClipIds.length === clips.length;

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedClipIds([]);
    } else {
      setSelectedClipIds(clips.map(c => c.id));
    }
  };

  const handleClipSelectToggle = (clipId: string) => {
    setSelectedClipIds(prev => 
      prev.includes(clipId) 
        ? prev.filter(id => id !== clipId) 
        : [...prev, clipId]
    );
  };

  // Client-Side Batch Clip Download using JSZip!
  const handleBatchDownload = async () => {
    if (selectedClipIds.length === 0) return;
    setIsZipping(true);
    setZippingError('');
    setZippingProgress('Initializing ZIP construction...');

    try {
      const zip = new JSZip();
      const folderName = `${pack.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_clips`;
      const clipsFolder = zip.folder(folderName);

      const selectedClips = clips.filter(c => selectedClipIds.includes(c.id));

      for (let i = 0; i < selectedClips.length; i++) {
        const clip = selectedClips[i];
        setZippingProgress(`Fetching clip ${i + 1}/${selectedClips.length}: "${clip.name}"...`);

        try {
          const response = await fetch(clip.sample_url);
          if (!response.ok) throw new Error(`HTTP error ${response.status}`);
          const blob = await response.blob();
          const fileName = `${clip.position}_${clip.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
          
          if (clipsFolder) {
            clipsFolder.file(fileName, blob);
          }
        } catch (fetchErr) {
          console.error(`Failed to fetch video stream for clip ${clip.name}:`, fetchErr);
          // If fetch fails, we can add a text fallback file inside zip to avoid crashing entire queue
          if (clipsFolder) {
            clipsFolder.file(
              `${clip.position}_error_log.txt`, 
              `Failed to download clip: ${clip.name}.\nSource Stream URL: ${clip.sample_url}\nError message: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
            );
          }
        }
      }

      setZippingProgress('Compressing clip container client-side...');
      const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZippingProgress(`Compressing pack: ${Math.round(metadata.percent)}%`);
      });

      setZippingProgress('Triggering system download dialog...');
      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}_package.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setZippingProgress('ZIP Compilation successful!');
      setTimeout(() => setIsZipping(false), 1500);
    } catch (err) {
      console.error('ZIP compilation error:', err);
      setZippingError('Failed to build ZIP archive. Some source streams may have CORS restrictions. Please stream individually.');
      setTimeout(() => setIsZipping(false), 5000);
    }
  };

  return (
    <div className="relative mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            <span>Individual Clip Extracts</span>
            <span className="text-xs font-mono font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/10">
              CORS-Safe Stream Previews
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Pre-extracted individual high-quality cuts. Select multiple to batch export as a custom ZIP package.
          </p>
        </div>

        {/* Selected Counter & Batch Action */}
        {selectedClipIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="text-xs font-mono text-zinc-300">
              Selected <span className="font-extrabold text-red-500">{selectedClipIds.length}</span> clips
            </span>
            <button
              onClick={handleBatchDownload}
              disabled={isZipping}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-lg text-xs font-semibold tracking-wide flex items-center gap-2 shadow-lg shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
            >
              {isZipping ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>{isZipping ? 'Compiling ZIP...' : 'Download Selected (.ZIP)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ZIP Packaging Loader Backdrop */}
      {isZipping && (
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 mb-5 flex items-center justify-between text-zinc-200 text-xs font-mono select-none">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
            <span className="text-zinc-300 font-semibold">{zippingProgress}</span>
          </div>
          <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-white/5 uppercase">
            Client-Side Compilation
          </span>
        </div>
      )}

      {zippingError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 mb-5 flex items-start gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Notice regarding batch downloads:</span> {zippingError}
          </div>
        </div>
      )}

      {/* Clip Table List */}
      <div className="overflow-x-auto bg-[#0a0a0c]/40 border border-white/5 rounded-xl">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-mono text-zinc-400 font-bold tracking-widest uppercase">
              <th className="py-3 pl-4 w-12 text-center">
                <button 
                  onClick={handleSelectAllToggle}
                  className="p-1 rounded text-zinc-500 hover:text-white transition"
                  title={isAllSelected ? "Deselect All" : "Select All"}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-red-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 pr-3 w-12 text-center">#</th>
              <th className="py-3 pr-4 w-32 md:w-40">Micro Player Preview</th>
              <th className="py-3 px-2">Clip Details</th>
              <th className="py-3 px-2 hidden sm:table-cell w-24">Resolution</th>
              <th className="py-3 px-2 hidden md:table-cell text-center w-28">Versions Available</th>
              <th className="py-3 pr-4 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {clips.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-zinc-500">
                    <Film className="w-8 h-8 text-zinc-700 mb-2" />
                    <p className="text-xs font-mono font-medium">No clip segments extracted for this pack yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              clips
                .sort((a,b) => a.position - b.position)
                .map((clip) => (
                  <ClipRow 
                    key={clip.id}
                    clip={clip}
                    isSelected={selectedClipIds.includes(clip.id)}
                    onSelectToggle={() => handleClipSelectToggle(clip.id)}
                    onPreviewClick={(c) => setActivePreviewClip(c)}
                  />
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Advanced Clip Preview Full Screen / Custom Overlay Modal */}
      {activePreviewClip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          {/* Backing Dismiss Layer */}
          <div className="absolute inset-0" onClick={() => setActivePreviewClip(null)}></div>
          
          <div className="relative w-full max-w-3xl bg-[#0d0d11] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-zinc-950 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase bg-red-600 px-2 py-0.5 rounded text-white tracking-widest mr-2 shadow">
                  NOW PREVIEWING
                </span>
                <span className="text-zinc-400 text-xs font-mono">
                  Clip {activePreviewClip.position} of {clips.length}
                </span>
                <h4 className="font-bold text-sm text-white mt-1 leading-none">
                  {activePreviewClip.name}
                </h4>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                  className="p-2 bg-white/5 border border-white/5 hover:border-white/15 rounded-lg text-zinc-300 hover:text-white transition"
                  title={isPreviewMuted ? "Unmute Preview" : "Mute Preview"}
                >
                  {isPreviewMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setActivePreviewClip(null)}
                  className="p-2 bg-white/5 border border-white/5 hover:border-red-500/20 text-zinc-400 hover:text-red-500 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Premium Video Area */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {activePreviewClip.sample_url ? (
                <video
                  key={activePreviewClip.id}
                  src={activePreviewClip.sample_url}
                  autoPlay
                  controls
                  loop
                  muted={isPreviewMuted}
                  playsInline
                  preload="auto"
                  className="w-full h-full object-contain"
                  onError={(e) => console.error('Preview video error:', e.currentTarget.error)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-600">
                  <VideoOff className="w-10 h-10 mb-2" />
                  <span className="text-xs font-mono">No video stream linked</span>
                </div>
              )}
            </div>

            {/* Metadata Footer */}
            <div className="p-4 bg-[#0a0a0c] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-4 text-zinc-400">
                <span className="flex items-center gap-1.5">
                  Duration: <strong className="text-white">{(activePreviewClip.duration)}s</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  Format: <strong className="text-white">MP4 (H.264)</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  Resolution: <strong className="text-white">{activePreviewClip.resolution || '1080p'}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const idx = clips.findIndex(c => c.id === activePreviewClip.id);
                    if (idx > 0) setActivePreviewClip(clips[idx - 1]);
                  }}
                  disabled={clips.findIndex(c => c.id === activePreviewClip.id) === 0}
                  className="px-2.5 py-1.5 bg-zinc-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-800 text-zinc-300 font-semibold rounded text-[11px] border border-white/5"
                >
                  PREV CLIP
                </button>
                <button
                  onClick={() => {
                    const idx = clips.findIndex(c => c.id === activePreviewClip.id);
                    if (idx < clips.length - 1) setActivePreviewClip(clips[idx + 1]);
                  }}
                  disabled={clips.findIndex(c => c.id === activePreviewClip.id) === clips.length - 1}
                  className="px-2.5 py-1.5 bg-zinc-900 disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-800 text-zinc-300 font-semibold rounded text-[11px] border border-white/5"
                >
                  NEXT CLIP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};