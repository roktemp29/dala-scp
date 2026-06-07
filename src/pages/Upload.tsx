import React, { useState, useEffect } from 'react';
import { 
  FileVideo, Sliders, Palette, UploadCloud, Plus, Trash2, 
  Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Lightbulb, 
  AlertCircle, FileSpreadsheet, Loader2, Play 
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { ScenePack, Clip } from '../types';
import { supabase } from '../lib/supabase';

// Helper to get draft value
const getDraft = (key: string, fallback: any) => {
  try {
    const saved = localStorage.getItem('dala_upload_draft');
    if (saved) return JSON.parse(saved)[key] ?? fallback;
  } catch {}
  return fallback;
};

interface UploadProps {
  onSuccess: (packId: string) => void;
}

export const Upload: React.FC<UploadProps> = ({ onSuccess }) => {
  const { addPack, addClip, currentUser } = useApp();

  // Wizard active step (1 to 4)
  const [step, setStep] = useState(1);

  // Form Field States – now lazy‑initialised from localStorage draft
  const [title, setTitle] = useState(() => getDraft('title', ''));
  const [animeSource, setAnimeSource] = useState(() => getDraft('animeSource', ''));
  const [genre, setGenre] = useState<ScenePack['genre']>(() => getDraft('genre', 'Action'));
  const [year, setYear] = useState(() => getDraft('year', 2024));
  const [resolution, setResolution] = useState<ScenePack['resolution']>(() => getDraft('resolution', '4K'));
  const [fps, setFps] = useState(() => getDraft('fps', 60));
  const [clipCount, setClipCount] = useState(() => getDraft('clipCount', 0));          // added as requested
  const [description, setDescription] = useState(() => getDraft('description', ''));
  const [tags, setTags] = useState(() => getDraft('tags', []));                        // changed from tagsInput to array
  const [gradientFrom, setGradientFrom] = useState(() => getDraft('gradientFrom', '#1e3c72'));
  const [gradientTo, setGradientTo] = useState(() => getDraft('gradientTo', '#2a5298'));
  const [thumbnailUrl, setThumbnailUrl] = useState(() => getDraft('thumbnailUrl', 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600'));
  const [bannerUrl, setBannerUrl] = useState(() => getDraft('bannerUrl', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200'));
  const [previewUrl, setPreviewUrl] = useState(() => getDraft('previewUrl', ''));

  // Additional states that were not listed – kept as before
  const [downloadLink, setDownloadLink] = useState('');
  const [tagsInput, setTagsInput] = useState('');      // kept for backward compatibility with UI
  const [fileSize, setFileSize] = useState('1.2 GB');

  // Step 3 Clip Segment States
  const [clipInputText, setClipInputText] = useState('');
  const [clipsList, setClipsList] = useState<Array<{
    name: string;
    duration: number;
    resolution: string;
    has_raw: boolean;
    has_graded: boolean;
    sample_url: string;
    file_object?: File;
  }>>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);

  // Auto-save draft to localStorage – now includes the new keys
  useEffect(() => {
    const draft = {
      title,
      animeSource,
      genre,
      year,
      resolution,
      fps,
      clipCount: clipsList.length,
      description,
      tags,
      gradientFrom,
      gradientTo,
      thumbnailUrl,
      bannerUrl,
      previewUrl,
      // keep existing fields that are not in the lazy‑initialised list
      movieSource: animeSource,   // for backward compatibility
      tagsInput,
      fileSize,
      downloadLink,
    };
    localStorage.setItem('dala_upload_draft', JSON.stringify(draft));
  }, [title, animeSource, genre, year, resolution, fps, description, tags, gradientFrom, gradientTo, thumbnailUrl, bannerUrl, previewUrl, clipsList.length, tagsInput, fileSize, downloadLink]);

  // Restore draft on mount – now only for fields that were not lazy‑initialised, but kept for safety
  useEffect(() => {
    const saved = localStorage.getItem('dala_upload_draft');
    if (!saved) return;
    try {
      const d = JSON.parse(saved);
      if (d.title) setTitle(d.title);
      if (d.animeSource) setAnimeSource(d.animeSource);
      if (d.genre) setGenre(d.genre);
      if (d.year) setYear(d.year);
      if (d.resolution) setResolution(d.resolution);
      if (d.fps) setFps(d.fps);
      if (d.description) setDescription(d.description);
      if (d.tags) setTags(d.tags);
      if (d.gradientFrom) setGradientFrom(d.gradientFrom);
      if (d.gradientTo) setGradientTo(d.gradientTo);
      if (d.thumbnailUrl) setThumbnailUrl(d.thumbnailUrl);
      if (d.bannerUrl) setBannerUrl(d.bannerUrl);
      if (d.previewUrl) setPreviewUrl(d.previewUrl);
      // Legacy fields
      if (d.tagsInput) setTagsInput(d.tagsInput);
      if (d.fileSize) setFileSize(d.fileSize);
      if (d.downloadLink) setDownloadLink(d.downloadLink);
    } catch (e) { console.warn('Failed to restore draft', e); }
  }, []);

  // Warn before leaving if there is unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (title || description || animeSource || clipsList.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [title, description, animeSource, clipsList.length]);

  // Preset thumbnails for easy clicking
  const THUMBNAIL_PRESETS = [
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=600',
    'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=600',
    'https://images.unsplash.com/photo-1542204172-e70528091b50?q=80&w=600',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600'
  ];

  const GRADIENT_PRESETS = [
    { from: '#800000', to: '#111111', name: 'Dark Ruby' },
    { from: '#1e3c72', to: '#2a5298', name: 'Thala Blue' },
    { from: '#e65c00', to: '#f9d423', name: 'Thunder' },
    { from: '#3e2723', to: '#050505', name: 'Sepia Grain' },
    { from: '#02aab0', to: '#00cdac', name: 'Emerald Wave' }
  ];

  const handleNext = () => {
    if (step < 4) setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  // Paste Text and split by lines to import clips in batch
  const handleBatchTextImport = () => {
    if (!clipInputText.trim()) return;
    const lines = clipInputText.split('\n').filter(line => line.trim() !== '');
    
    const newClips = lines.map((line, idx) => {
      let name = line.trim();
      let duration = 12;
      
      const durationMatch = line.match(/\((\d+)s\)/);
      if (durationMatch) {
         duration = parseInt(durationMatch[1]);
         name = line.replace(/\((\d+)s\)/, '').trim();
      }

      return {
        name,
        duration,
        resolution: String(resolution),
        has_raw: true,
        has_graded: false,
        sample_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
      };
    });

    setClipsList(prev => [...prev, ...newClips]);
    setClipInputText('');
    setClipCount(clipsList.length + newClips.length);
  };

  // Local File Drag & Drop / Upload handler
  const handleLocalVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const filesArray = Array.from(files) as File[];

    filesArray.forEach((file, index) => {
      const clipId = `file-${Date.now()}-${index}`;
      setUploadProgress(prev => ({ ...prev, [clipId]: 0 }));

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          const videoUrlBlob = URL.createObjectURL(file);
          
          setClipsList(prev => {
            const newList = [
              ...prev,
              {
                name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
                duration: 15,
                resolution: String(resolution),
                has_raw: true,
                has_graded: false,
                sample_url: videoUrlBlob,
                file_object: file
              }
            ];
            setClipCount(newList.length);
            return newList;
          });

          setTimeout(() => {
            setUploadProgress(prev => {
              const cp = { ...prev };
              delete cp[clipId];
              return cp;
            });
            setIsUploading(false);
          }, 1000);
        } else {
          setUploadProgress(prev => ({ ...prev, [clipId]: progress }));
        }
      }, 350);
    });
  };

  const handleRemoveClip = (index: number) => {
    setClipsList(prev => {
      const newList = prev.filter((_, i) => i !== index);
      setClipCount(newList.length);
      return newList;
    });
  };

  // Submit and Save the full Scenepack to state
  const handlePublish = () => {
    if (!title || !animeSource) return;

    const packId = `pack-${Date.now()}`;
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');

    const publishStatus: ScenePack['status'] = currentUser?.role === 'admin' ? 'published' : 'in_review';

    addPack({
      id: packId,
      title,
      anime_source: animeSource,
      genre,
      year: Number(year),
      resolution,
      fps: Number(fps),
      clip_count: clipsList.length,
      description,
      tags: tagsArray,
      gradient_from: gradientFrom,
      gradient_to: gradientTo,
      thumbnail_url: thumbnailUrl,
      banner_url: bannerUrl,
      preview_url: previewUrl || (clipsList[0]?.sample_url || 'https://www.youtube.com/watch?v=S0Tbyu61b3A'),
      trailer_url: previewUrl || (clipsList[0]?.sample_url || 'https://www.youtube.com/watch?v=S0Tbyu61b3A'),
      download_link: downloadLink || 'https://pixeldrain.com/u/fallback-link',
      file_size: fileSize,
      format: 'MP4',
      status: publishStatus,
      visibility: 'public',
      uploader_name: currentUser?.full_name || 'Anonymous Creator',
      uploader_email: currentUser?.email || 'guest@scenepack.com'
    });

    clipsList.forEach((c, idx) => {
      addClip({
        scenepack_id: packId,
        name: c.name,
        position: idx + 1,
        duration: c.duration,
        resolution: c.resolution,
        has_raw: c.has_raw,
        has_graded: c.has_graded,
        sample_url: c.sample_url
      });
    });

    // Clear draft on successful publish
    localStorage.removeItem('dala_upload_draft');
    onSuccess(packId);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 text-left">
      {/* Draft indicator */}
      {localStorage.getItem('dala_upload_draft') && (
        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono uppercase tracking-widest mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Draft Auto-Saved
        </div>
      )}

      {/* Step Progress Tracker Layout */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5 mb-8 text-xs font-mono">
        {[
          { num: 1, label: 'Pack Details', icon: Sliders },
          { num: 2, label: 'Branding Colors', icon: Palette },
          { num: 3, label: 'Batch Clip Import', icon: UploadCloud },
          { num: 4, label: 'Confirm Publish', icon: CheckCircle2 }
        ].map(s => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isCurrent = step === s.num;
          return (
            <div 
              key={s.label}
              className={`flex items-center gap-2 ${
                isDone ? 'text-emerald-500 font-bold' : isCurrent ? 'text-red-500 font-bold animate-pulse' : 'text-zinc-600'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg font-mono font-bold flex items-center justify-center text-[10px] ${
                isDone ? 'bg-emerald-500/10 border border-emerald-500/30' : isCurrent ? 'bg-red-500/10 border border-red-500/30' : 'bg-zinc-900 border border-white/5'
              }`}>
                {s.num}
              </span>
              <Icon className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="hidden md:inline">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Pack Information */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 p-4 rounded-xl mb-2">
            <Lightbulb className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white leading-none mb-1">Create a Movie Scenepack Container</h4>
              <p className="text-xs text-zinc-400">Specify details about your movie scene collection. Video editors search primarily by Movie source, Genre, and Resolution.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">PACK NAME *</label>
              <input
                type="text"
                placeholder="e.g. Thalapathy Vijay Leo Swag & Closeups Set"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-600 rounded-xl border border-white/5 focus:border-red-500 outline-none transition"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">SOURCE MOVIE / ANIME *</label>
              <input
                type="text"
                placeholder="e.g. Mangatha (Tamil) or Jujutsu Kaisen"
                value={animeSource}
                onChange={(e) => setAnimeSource(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-600 rounded-xl border border-white/5 focus:border-red-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">GENRE TYPE</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-zinc-300 rounded-xl border border-white/5 focus:border-red-500 outline-none transition font-sans"
              >
                {['Action', 'Drama', 'Romance', 'Thriller', 'Comedy', 'Horror', 'Mass', 'Slow-Mo', 'Aesthetic', 'Vintage', 'RAW', 'Graded', 'Dance'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">RESOLUTION</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-zinc-300 rounded-xl border border-white/5 focus:border-red-500 outline-none transition font-sans"
              >
                {['4K', '1080p', '720p', '480p'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">FRAME RATE (FPS)</label>
              <input
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white rounded-xl border border-white/5 focus:border-red-500 outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">RELEASE YEAR</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white rounded-xl border border-white/5 focus:border-red-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">FULL FILE DOWNLOAD LINK (MediaFire, Mega, Pixeldrain)*</label>
              <input
                type="url"
                placeholder="https://pixeldrain.com/u/yourpackid"
                value={downloadLink}
                onChange={(e) => setDownloadLink(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-600 rounded-xl border border-white/5 focus:border-red-500 outline-none transition"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">APPROX FILE SIZE (e.g. 1.8 GB)*</label>
              <input
                type="text"
                placeholder="e.g. 2.4 GB"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-600 rounded-xl border border-white/5 focus:border-red-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 font-bold flex items-center gap-1.5">
              TRAILER / HOVER PREVIEW VIDEO URL 
              <span className="text-[9px] font-mono font-medium text-red-500 uppercase bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded ml-1">Netflix Hover Concept</span>
            </label>
            <input
              type="url"
              placeholder="e.g. https://www.youtube.com/watch?v=coD_N_91jXo or direct MP4 stream URL"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-600 rounded-xl border border-white/5 focus:border-red-500 outline-none transition"
            />
            <p className="text-[10px] text-zinc-500 tracking-wide mt-1 leading-relaxed">
              Provides the video streams for the **Hover-to-Play** card previews on indices. Paste a YouTube link or a direct high-speed video path (.mp4/.mkv).
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 font-bold">DESCRIPTION & CURATION NOTES</label>
            <textarea
              rows={4}
              placeholder="Explain the footage included. Highlight elements like slow-motion entrances, grading options or After Effects track capabilities."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-600 rounded-xl border border-white/5 focus:border-red-500 outline-none transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-400 font-bold">TAGS (COMMAS SEPARATED)</label>
            <input
              type="text"
              placeholder="e.g. Ajith Kumar, Yuvan, Mass, 1080p, AE, Sony Alpha"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-600 rounded-xl border border-white/5 focus:border-red-500 outline-none transition"
            />
          </div>
        </div>
      )}

      {/* STEP 2: Custom branding & Identity Colors */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-zinc-950/40 p-4 border border-white/5 rounded-2xl flex flex-col gap-4">
            <h3 className="text-zinc-200 text-sm font-bold flex items-center gap-1.5 leading-none">
              <Palette className="w-4 h-4 text-red-500" /> Specify Visual branding Identifiers
            </h3>
            <p className="text-xs text-zinc-500">Every scenepack can have its own colored backlight glow, vertical poster image, and widescreen detail banner to customize the user-experience.</p>
          </div>

          <div className="space-y-4 text-left">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              STEP 2.1 — COVER POSTER IMAGES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Thumbnail field with upload and preview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-500">THUMBNAIL POSTER (2:3 aspect)</label>
                
                {/* Preview */}
                {thumbnailUrl && (
                  <img src={thumbnailUrl} alt="Thumbnail Preview" className="w-20 h-28 rounded-lg object-cover border border-white/10" referrerPolicy="no-referrer" />
                )}

                <label className={`flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-red-500/50 bg-[#0a0a0c] cursor-pointer transition ${thumbnailUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB'); return; }
                      setThumbnailUploading(true);
                      const ext = file.name.split('.').pop();
                      const path = `thumbnails/${Date.now()}.${ext}`;
                      const { error } = await supabase.storage.from('pack-images').upload(path, file, { upsert: true });
                      if (error) { alert('Upload failed: ' + error.message); }
                      else {
                        const { data } = supabase.storage.from('pack-images').getPublicUrl(path);
                        setThumbnailUrl(data.publicUrl);
                      }
                      setThumbnailUploading(false);
                    }}
                  />
                  <span className="text-xs text-zinc-400">
                    {thumbnailUploading ? '⏳ Uploading...' : '📁 Upload Thumbnail (JPG, PNG, WEBP · max 10MB)'}
                  </span>
                </label>

                {/* Preset Row */}
                <div className="flex gap-2.5 mt-1">
                  {THUMBNAIL_PRESETS.map((p) => (
                    <img
                      key={p}
                      onClick={() => setThumbnailUrl(p)}
                      src={p}
                      alt="Preset"
                      className={`w-10 h-14 rounded object-cover cursor-pointer border hover:border-white/20 transition ${
                        thumbnailUrl === p ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/5'
                      }`}
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
              </div>

              {/* Banner field with upload and preview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-zinc-500">WIDESCREEN DETAIL BANNER</label>

                {/* Preview */}
                {bannerUrl && (
                  <img src={bannerUrl} alt="Banner Preview" className="w-full h-20 rounded-lg object-cover border border-white/10" referrerPolicy="no-referrer" />
                )}

                <label className={`flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl border border-dashed border-white/20 hover:border-red-500/50 bg-[#0a0a0c] cursor-pointer transition ${bannerUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 10 * 1024 * 1024) { alert('Image must be under 10MB'); return; }
                      setBannerUploading(true);
                      const ext = file.name.split('.').pop();
                      const path = `banners/${Date.now()}.${ext}`;
                      const { error } = await supabase.storage.from('pack-images').upload(path, file, { upsert: true });
                      if (error) { alert('Upload failed: ' + error.message); }
                      else {
                        const { data } = supabase.storage.from('pack-images').getPublicUrl(path);
                        setBannerUrl(data.publicUrl);
                      }
                      setBannerUploading(false);
                    }}
                  />
                  <span className="text-xs text-zinc-400">
                    {bannerUploading ? '⏳ Uploading...' : '📁 Upload Banner (JPG, PNG, WEBP · max 10MB)'}
                  </span>
                </label>
                <span className="text-[9px] font-mono text-zinc-500">Wide banner shown on the pack detail page. Leave empty for auto-generated banner.</span>
              </div>
            </div>
          </div>

          {/* Color Gradients Customizer */}
          <div className="space-y-4 text-left">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              STEP 2.2 — PALETTE GRADIENT PORTRAIT
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Color Picks */}
              <div className="space-y-3 sm:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-zinc-500">COLOR FROM</span>
                    <div className="flex gap-1.5 items-center">
                      <input 
                        type="color" 
                        value={gradientFrom} 
                        onChange={(e) => setGradientFrom(e.target.value)}
                        className="w-8 h-8 rounded border border-white/10 shrink-0 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={gradientFrom} 
                        onChange={(e) => setGradientFrom(e.target.value)}
                        className="w-full px-2 py-1.5 bg-[#0a0a0c] font-mono text-[10px] text-zinc-300 border border-white/5 rounded-lg text-center"
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-zinc-500">COLOR TO</span>
                    <div className="flex gap-1.5 items-center">
                      <input 
                        type="color" 
                        value={gradientTo} 
                        onChange={(e) => setGradientTo(e.target.value)}
                        className="w-8 h-8 rounded border border-white/10 shrink-0 cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={gradientTo} 
                        onChange={(e) => setGradientTo(e.target.value)}
                        className="w-full px-2 py-1.5 bg-[#0a0a0c] font-mono text-[10px] text-zinc-300 border border-white/5 rounded-lg text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {GRADIENT_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        setGradientFrom(p.from);
                        setGradientTo(p.to);
                      }}
                      className="px-2.5 py-1 bg-zinc-900 border border-white/5 rounded text-[9px] text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shadow"
                        style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
                      ></span>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rendering Real-Time Preview Container Card to see colors! */}
              <div className="sm:col-span-2">
                <div className="p-4 bg-zinc-950 border border-white/5 rounded-2xl flex flex-col items-center">
                  <span className="text-[9px] font-mono text-zinc-500 mb-2 block uppercase">LIVE APP CARD GLOW PREVIEW</span>
                  
                  {/* Miniature Card Container */}
                  <div 
                    className="relative w-48 bg-[#0d0d10] border border-white/5 p-3 rounded-xl overflow-hidden select-none"
                    style={{
                      boxShadow: `0 10px 40px -15px ${gradientFrom}`
                    }}
                  >
                    {/* Glowing backlight overlay */}
                    <div 
                      className="absolute inset-0 opacity-10 blur-2xl pointer-events-none"
                      style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
                    ></div>

                    <div className="relative aspect-[3/4] bg-zinc-900 rounded-lg mb-2 overflow-hidden">
                      <img src={thumbnailUrl} className="w-full h-full object-cover opacity-80" alt="Card Preview" referrerPolicy="no-referrer" />
                      <div 
                        className="absolute h-1 inset-x-0 top-0"
                        style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase leading-none block">{animeSource || 'Source movie'}</span>
                    <h5 className="font-bold text-xs text-white max-w-full truncate">{title || 'Scenepack Title Heading'}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Batch Clip Import with Auto-Upload! */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input Options 1: Batch paste text names */}
            <div className="p-4 border border-white/5 bg-[#0a0a0c]/40 rounded-2xl flex flex-col gap-3">
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-zinc-200">Option A: Quick Batch Name pasting</span>
                <span className="text-[10px] text-zinc-500 mt-1">Paste multiple names (one per line) to instantly generate multiple clips in order. Optionally add duration in parenthesis!</span>
              </div>

              <textarea
                rows={6}
                placeholder={"e.g.\nCinematic Fight Walk (14s)\nRolex Dialogue close-up (9s)\nDouble katana clash (15s)"}
                value={clipInputText}
                onChange={(e) => setClipInputText(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 text-xs text-zinc-300 rounded-lg border border-white/5 font-mono leading-relaxed resize-none focus:border-red-500 outline-none"
              />

              <button
                onClick={handleBatchTextImport}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-semibold rounded-lg text-xs active:scale-95 transition cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-red-500" />
                <span>Parse pasted lines</span>
              </button>
            </div>

            {/* Input Option 2: Drag & Drop Auto-upload files! */}
            <div className="p-4 border-2 border-dashed border-zinc-800 hover:border-red-500/30 bg-[#0a0a0c]/20 hover:bg-red-500/[0.01] rounded-2xl flex flex-col items-center justify-center text-center group cursor-pointer transition relative">
              <input 
                type="file" 
                multiple 
                accept="video/*"
                onChange={handleLocalVideoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <FileVideo className="w-10 h-10 text-zinc-600 group-hover:text-red-500 group-hover:scale-105 transition mb-3" />
              <h5 className="font-bold text-zinc-200 text-xs">Option B: Drag & Drop Real MP4 Files</h5>
              <p className="text-[10px] text-zinc-500 mt-1 max-w-xs">
                Select your pre-sliced video files to upload them. They convert to local browser blob streams playable in the streaming app inline players!
              </p>
              <button className="mt-4 px-3 py-1.5 bg-zinc-950 border border-white/5 text-[10px] font-mono text-zinc-400 rounded-lg shadow pointer-events-none">
                SELECT VIDEO FILES
              </button>
            </div>
          </div>

          {/* Simulated File upload progress meters */}
          {isUploading && Object.keys(uploadProgress).length > 0 && (
            <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 animate-in duration-200 text-left">
              <span className="text-[9px] font-mono font-bold text-zinc-500 block uppercase">AUTO-UPLOADING FILE STREAMS...</span>
              {Object.entries(uploadProgress).map(([cid, pct]) => (
                <div key={cid} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 text-red-500 animate-spin" /> Stream compression queuing
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 rounded overflow-hidden">
                    <div className="h-full bg-red-600 rounded transition-all duration-300" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Created Clips Database list */}
          <div className="space-y-3.5 text-left">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              CLIPS PREPARED FOR THE PACK CONTAINER ({clipsList.length} CLIPS)
            </span>

            {clipsList.length === 0 ? (
              <div className="py-12 bg-zinc-950/20 border border-white/5 rounded-2xl text-center text-zinc-500">
                <FileSpreadsheet className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                <p className="text-xs font-mono">No clip segments configured. Use Option A or Option B above to begin.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {clipsList.map((clip, index) => (
                  <div 
                    key={`${clip.name}-${index}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-zinc-950 border border-white/5 rounded-xl text-xs gap-3"
                  >
                    <div className="flex items-center gap-3.5 text-left">
                      <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-900 w-6 h-6 rounded flex items-center justify-center border border-white/5 shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-white leading-tight">{clip.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-500 mt-1 leading-none">
                          <span>Duration: <strong>{clip.duration}s</strong></span>
                          <span>Format: <strong>MP4</strong></span>
                          <span>Source: <strong>{clip.file_object ? 'Local Attachment' : 'Pre-Render Link'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3 self-end sm:self-auto">
                      {/* RAW Toggle */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-400 font-mono select-none">
                        <input 
                          type="checkbox" 
                          checked={clip.has_raw}
                          onChange={(e) => {
                            const updated = [...clipsList];
                            updated[index].has_raw = e.target.checked;
                            setClipsList(updated);
                          }}
                          className="rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                        />
                        <span>RAW</span>
                      </label>

                      {/* Graded Toggle */}
                      <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-zinc-400 font-mono select-none">
                        <input 
                          type="checkbox" 
                          checked={clip.has_graded}
                          onChange={(e) => {
                            const updated = [...clipsList];
                            updated[index].has_graded = e.target.checked;
                            setClipsList(updated);
                          }}
                          className="rounded border-zinc-700 bg-zinc-900 text-red-600 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                        />
                        <span>GRADED</span>
                      </label>

                      <button
                        onClick={() => handleRemoveClip(index)}
                        className="p-1.5 bg-zinc-900 border border-white/5 text-zinc-500 hover:text-red-500 rounded-lg transition hover:scale-105 active:scale-95 shrink-0 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: Summary / Confirmation */}
      {step === 4 && (
        <div className="p-6 bg-zinc-950 border border-white/5 rounded-2xl space-y-6 animate-in fade-in duration-300 text-left">
          <div className="text-center space-y-2 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce mt-1" />
            <h3 className="text-white text-lg font-black tracking-tight leading-none">Ready to Publish</h3>
            <p className="text-zinc-500 text-xs max-w-sm">Almost there! Review your scenepack specifications before sending it live for moderation review.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-zinc-400 pt-3 border-t border-white/5 bg-[#0a0a0c]/20 p-4 rounded-xl">
            <span>PACK CONTAINER NAME: <strong className="text-white font-sans">{title}</strong></span>
            <span>SOURCE MOVIE: <strong className="text-white font-sans">{animeSource}</strong></span>
            <span>GENRE CATEGORY: <strong className="text-amber-500 uppercase font-sans font-bold">{genre}</strong></span>
            <span>SPECIFICATIONS: <strong className="text-white font-sans">{resolution} @ {fps}FPS ({year})</strong></span>
            <span>TOTAL CLIPS COMMITTED: <strong className="text-white font-sans">{clipsList.length} extracts</strong></span>
            <span>FILE CONTAINER SIZE: <strong className="text-white font-sans">{fileSize}</strong></span>
            <span>MODERATION ROUTE: <strong className="text-red-500 font-bold uppercase">{currentUser?.role === 'admin' ? 'AUTO-APPROVED (ADMIN)' : 'PENDING APPROVAL'}</strong></span>
          </div>

          {clipsList.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-4 flex items-start gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Caution:</span> You have not configured any individual clip extracts for previews. Standard users can still download your full mega-pack file, but won't be able to preview or stream individual cuts in their browser.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wizard Footer Navigation Controls */}
      <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={handlePrev}
            className="px-4 py-2.5 bg-zinc-900 border border-white/5 hover:border-white/12 text-zinc-300 hover:text-white rounded-xl text-xs font-bold leading-none flex items-center gap-1.5 transition select-none cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div></div>
        )}

        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={(step === 1 && (!title || !animeSource))}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold leading-none flex items-center gap-1.5 transition select-none cursor-pointer active:scale-95"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handlePublish}
            id="wizard-complete-publish-btn"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold leading-none flex items-center gap-1.5 transition select-none cursor-pointer active:scale-95 shadow-lg shadow-red-600/10"
          >
            <span>Complete & Request Publish</span>
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};