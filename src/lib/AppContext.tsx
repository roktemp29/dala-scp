import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScenePack, Clip, SavedPack, Playlist, UserProfile } from '../types';
import { supabase } from './supabase';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  packs: ScenePack[];
  setPacks: React.Dispatch<React.SetStateAction<ScenePack[]>>;
  clips: Clip[];
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
  savedPacks: SavedPack[];
  playlists: Playlist[];
  loading: boolean;
  toggleSavePack: (packId: string) => void;
  addPack: (pack: Omit<ScenePack, 'download_count' | 'view_count' | 'save_count' | 'rating' | 'created_at'>) => void;
  deletePack: (packId: string) => void;
  addClip: (clip: Omit<Clip, 'id'>) => void;
  incrementViewCount: (packId: string) => void;
  incrementDownloadCount: (packId: string) => void;
  createPlaylist: (name: string, description: string, isPublic: boolean) => string;
  addPackToPlaylist: (playlistId: string, packId: string) => void;
  removePackFromPlaylist: (playlistId: string, packId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  updatePackStatus: (packId: string, status: ScenePack['status']) => void;
  switchUserRole: (role: 'admin' | 'user') => void;
  clearDatabase: () => void;
  restoreInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  // User stays in localStorage (no auth system yet)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('dala_user');
    if (stored) return JSON.parse(stored);
    const defaultUser: UserProfile = {
      email: 'dalaaep10@gmail.com',
      full_name: 'Dala AEP',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      joined_at: '2026-01-10T00:00:00Z',
      bio: 'Professional Tamil movie and Anime editor | After Effects maven | 4K 60FPS clip curator.'
    };
    localStorage.setItem('dala_user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [packs, setPacks] = useState<ScenePack[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [savedPacks, setSavedPacks] = useState<SavedPack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Save user to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dala_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Load all data from Supabase on startup
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [packsRes, clipsRes, savedRes, playlistsRes] = await Promise.all([
          supabase.from('scene_packs').select('*').order('created_at', { ascending: false }),
          supabase.from('clips').select('*').order('position', { ascending: true }),
          supabase.from('saved_packs').select('*'),
          supabase.from('playlists').select('*').order('created_at', { ascending: false }),
        ]);

        if (packsRes.data) setPacks(packsRes.data as ScenePack[]);
        if (clipsRes.data) setClips(clipsRes.data as Clip[]);
        if (savedRes.data) setSavedPacks(savedRes.data as SavedPack[]);
        if (playlistsRes.data) setPlaylists(playlistsRes.data as Playlist[]);
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleSavePack = async (packId: string) => {
    if (!currentUser) return;
    const exists = savedPacks.find(s => s.scenepack_id === packId && s.user_email === currentUser.email);

    if (exists) {
      // Remove save
      await supabase.from('saved_packs').delete().eq('id', exists.id);
      setSavedPacks(prev => prev.filter(s => s.id !== exists.id));
      await supabase.from('scene_packs').update({ save_count: Math.max(0, (packs.find(p => p.id === packId)?.save_count || 1) - 1) }).eq('id', packId);
      setPacks(prev => prev.map(p => p.id === packId ? { ...p, save_count: Math.max(0, p.save_count - 1) } : p));
    } else {
      // Add save
      const newSave: SavedPack = {
        id: `save-${Date.now()}`,
        scenepack_id: packId,
        user_email: currentUser.email,
        saved_at: new Date().toISOString()
      };
      await supabase.from('saved_packs').insert(newSave);
      setSavedPacks(prev => [...prev, newSave]);
      const newCount = (packs.find(p => p.id === packId)?.save_count || 0) + 1;
      await supabase.from('scene_packs').update({ save_count: newCount }).eq('id', packId);
      setPacks(prev => prev.map(p => p.id === packId ? { ...p, save_count: p.save_count + 1 } : p));
    }
  };

  const addPack = async (newPackData: Omit<ScenePack, 'download_count' | 'view_count' | 'save_count' | 'rating' | 'created_at'>) => {
    const fullNewPack: ScenePack = {
      ...newPackData,
      download_count: 0,
      view_count: 0,
      save_count: 0,
      rating: 5.0,
      created_at: new Date().toISOString()
    };
    const { error } = await supabase.from('scene_packs').insert(fullNewPack);
    if (!error) {
      setPacks(prev => [fullNewPack, ...prev]);
    } else {
      console.error('Failed to add pack:', error);
    }
  };

  const deletePack = async (packId: string) => {
    await supabase.from('scene_packs').delete().eq('id', packId);
    setPacks(prev => prev.filter(p => p.id !== packId));
    setClips(prev => prev.filter(c => c.scenepack_id !== packId));
    setSavedPacks(prev => prev.filter(s => s.scenepack_id !== packId));
    setPlaylists(prev => prev.map(pl => ({
      ...pl,
      pack_ids: pl.pack_ids.filter(id => id !== packId)
    })));
  };

  const addClip = async (newClipData: Omit<Clip, 'id'>) => {
    const newClip: Clip = {
      ...newClipData,
      id: `clip-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    const { error } = await supabase.from('clips').insert(newClip);
    if (!error) {
      setClips(prev => [...prev, newClip]);
    } else {
      console.error('Failed to add clip:', error);
    }
  };

  const incrementViewCount = async (packId: string) => {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;
    await supabase.from('scene_packs').update({ view_count: pack.view_count + 1 }).eq('id', packId);
    setPacks(prev => prev.map(p => p.id === packId ? { ...p, view_count: p.view_count + 1 } : p));
  };

  const incrementDownloadCount = async (packId: string) => {
    const pack = packs.find(p => p.id === packId);
    if (!pack) return;
    await supabase.from('scene_packs').update({ download_count: pack.download_count + 1 }).eq('id', packId);
    setPacks(prev => prev.map(p => p.id === packId ? { ...p, download_count: p.download_count + 1 } : p));
  };

  const createPlaylist = (name: string, description: string, isPublic: boolean): string => {
    if (!currentUser) return '';
    const id = `play-${Date.now()}`;
    const newPlaylist: Playlist = {
      id,
      name,
      description,
      owner_email: currentUser.email,
      pack_ids: [],
      is_public: isPublic,
      created_at: new Date().toISOString()
    };
    supabase.from('playlists').insert(newPlaylist);
    setPlaylists(prev => [...prev, newPlaylist]);
    return id;
  };

  const addPackToPlaylist = async (playlistId: string, packId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist || playlist.pack_ids.includes(packId)) return;
    const updated = [...playlist.pack_ids, packId];
    await supabase.from('playlists').update({ pack_ids: updated }).eq('id', playlistId);
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, pack_ids: updated } : p));
  };

  const removePackFromPlaylist = async (playlistId: string, packId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;
    const updated = playlist.pack_ids.filter(id => id !== packId);
    await supabase.from('playlists').update({ pack_ids: updated }).eq('id', playlistId);
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, pack_ids: updated } : p));
  };

  const deletePlaylist = async (playlistId: string) => {
    await supabase.from('playlists').delete().eq('id', playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const updatePackStatus = async (packId: string, status: ScenePack['status']) => {
    await supabase.from('scene_packs').update({ status }).eq('id', packId);
    setPacks(prev => prev.map(p => p.id === packId ? { ...p, status } : p));
  };

  const switchUserRole = (role: 'admin' | 'user') => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, role } : null);
  };

  const clearDatabase = async () => {
    await supabase.from('clips').delete().neq('id', '');
    await supabase.from('saved_packs').delete().neq('id', '');
    await supabase.from('playlists').delete().neq('id', '');
    await supabase.from('scene_packs').delete().neq('id', '');
    setPacks([]);
    setClips([]);
    setSavedPacks([]);
    setPlaylists([]);
  };

  const restoreInitialData = async () => {
    await clearDatabase();
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      packs,
      setPacks,
      clips,
      setClips,
      savedPacks,
      playlists,
      loading,
      toggleSavePack,
      addPack,
      deletePack,
      addClip,
      incrementViewCount,
      incrementDownloadCount,
      createPlaylist,
      addPackToPlaylist,
      removePackFromPlaylist,
      deletePlaylist,
      updatePackStatus,
      switchUserRole,
      clearDatabase,
      restoreInitialData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};