export interface ScenePack {
  id: string;
  title: string;
  anime_source: string; // Used as Source Movie / Show name
  genre: 'Action' | 'Drama' | 'Romance' | 'Thriller' | 'Comedy' | 'Horror' | 'Mass' | 'Slow-Mo' | 'Aesthetic' | 'Vintage' | 'RAW' | 'Graded' | 'Dance';
  year: number;
  resolution: '4K' | '1080p' | '720p' | '480p';
  fps: number;
  clip_count: number;
  description: string;
  tags: string[];
  gradient_from: string; // Hex color e.g., "#FF007F"
  gradient_to: string;   // Hex color e.g., "#7F00FF"
  thumbnail_url: string; // 2:3 ratio poster image
  banner_url: string;    // 16:9 banner image
  preview_url: string;   // Youtube or direct mp4 url
  trailer_url?: string;  // Explicit trailer url for hover previews and background cinema streams
  download_link: string; // External full pack link (MediaFire, Pixeldrain, Mega, etc.)
  file_size: string;     // e.g., "1.8 GB"
  format: string;        // e.g., "MP4"
  status: 'draft' | 'in_review' | 'published' | 'taken_down';
  visibility: 'public' | 'unlisted' | 'private';
  uploader_name: string;
  uploader_email: string;
  download_count: number;
  view_count: number;
  save_count: number;
  rating: number;
  created_at: string;
}

export interface Clip {
  id: string;
  scenepack_id: string;
  name: string;
  position: number;
  duration: number; // in seconds
  resolution: string;
  has_raw: boolean;
  has_graded: boolean;
  sample_url: string; // Direct video stream play link or Youtube link
}

export interface SavedPack {
  id: string;
  scenepack_id: string;
  user_email: string;
  saved_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  owner_email: string;
  pack_ids: string[];
  is_public: boolean;
  created_at: string;
}

export interface UserProfile {
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  joined_at: string;
  bio?: string;
}
