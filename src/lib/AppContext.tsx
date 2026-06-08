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
  signOut: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [packs, setPacks] = useState<ScenePack[]>([]);
  const [clips, setClips] = useState<Clip[]>([]);
  const [savedPacks, setSavedPacks] = useState<SavedPack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Listen to Supabase Auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadOrCreateProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes (login/logout)
    // Ignore TOKEN_REFRESHED events to prevent unnecessary reloads
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return;

      if (session?.user) {
        loadOrCreateProfile(session.user);
      } else {
        setCurrentUser(null);
        setPacks([]);
        setClips([]);
        setSavedPacks([]);
        setPlaylists([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadOrCreateProfile = async (authUser: any) => {
    // Check if profile exists
    let { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!profile) {
      // Create profile for first time users
      const newProfile = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email,
        avatar_url: authUser.user_metadata?.avatar_url || '',
        role: 'user',
        bio: '',
        joined_at: new Date().toISOString()
      };
      const { data } = await supabase.from('user_profiles').insert(newProfile).select().single();
      profile = data;
    }

    if (profile) {
      setCurrentUser({
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: profile.avatar_url,
        joined_at: profile.joined_at,
        bio: profile.bio
      });
    }

    // Load all data
    await loadData(authUser.email, profile?.role || 'user');
  };

  const loadData = async (userEmail: string, role: string) => {
    setLoading(true);
    try {
      const [packsRes, clipsRes, savedRes, playlistsRes] = await Promise.all([
        supabase.from('scene_packs').select('*').order('created_at', { ascending: false }),
        supabase.from('clips').select('*').order('position', { ascending: true }),
        // Only load THIS user's saved packs
        supabase.from('saved_packs').select('*').eq('user_email', userEmail),
        // Only load THIS user's playlists
        supabase.from('playlists').select('*').eq('owner_email', userEmail).order('created_at', { ascending: false }),
      ]);

      if (packsRes.data) setPacks(packsRes.data as ScenePack[]);
      if (clipsRes.data) setClips(clipsRes.data as Clip[]);
      if (savedRes.data) setSavedPacks(savedRes.data as SavedPack[]);
      if (playlistsRes.data) setPlaylists(playlistsRes.data as Playlist[]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleSavePack = async (packId: string) => {
    if (!currentUser) return;
    const exists = savedPacks.find(s => s.scenepack_id === packId && s.user_email === currentUser.email);

    if (exists) {
      await supabase.from('saved_packs').delete().eq('id', exists.id);
      setSavedPacks(prev => prev.filter(s => s.id !== exists.id));
      const newCount = Math.max(0, (packs.find(p => p.id === packId)?.save_count || 1) - 1);
      await supabase.from('scene_packs').update({ save_count: newCount }).eq('id', packId);
      setPacks(prev => prev.map(p => p.id === packId ? { ...p, save_count: newCount } : p));
    } else {
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
      setPacks(prev => prev.map(p => p.id === packId ? { ...p, save_count: newCount } : p));
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
    if (!error) setPacks(prev => [fullNewPack, ...prev]);
    else console.error('Failed to add pack:', error);
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
    if (!error) setClips(prev => [...prev, newClip]);
    else console.error('Failed to add clip:', error);
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
      id, name, description,
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
    setPacks([]); setClips([]); setSavedPacks([]); setPlaylists([]);
  };

  const restoreInitialData = async () => { await clearDatabase(); };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      packs, setPacks,
      clips, setClips,
      savedPacks, playlists, loading,
      toggleSavePack, addPack, deletePack, addClip,
      incrementViewCount, incrementDownloadCount,
      createPlaylist, addPackToPlaylist, removePackFromPlaylist,
      deletePlaylist, updatePackStatus, switchUserRole,
      clearDatabase, restoreInitialData, signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};