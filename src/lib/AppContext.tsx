import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScenePack, Clip, SavedPack, Playlist, UserProfile } from '../types';
import { INITIAL_SCENEPACKS, INITIAL_CLIPS } from '../data/initialData';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  packs: ScenePack[];
  setPacks: React.Dispatch<React.SetStateAction<ScenePack[]>>;
  clips: Clip[];
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
  savedPacks: SavedPack[];
  playlists: Playlist[];
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
  // Try loading from localStorage first, fallback to initial data
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('dala_user');
    if (stored) return JSON.parse(stored);
    
    // Default logged in user based on the current user metadata
    const defaultUser: UserProfile = {
      email: 'dalaaep10@gmail.com',
      full_name: 'Dala AEP',
      role: 'admin', // Make them admin so they can test both Creator, Visitor, and Admin panels!
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      joined_at: '2026-01-10T00:00:00Z',
      bio: 'Professional Tamil movie and Anime editor | After Effects maven | 4K 60FPS clip curator.'
    };
    localStorage.setItem('dala_user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [packs, setPacks] = useState<ScenePack[]>(() => {
    const stored = localStorage.getItem('dala_packs');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Auto-purge old simulated demo/sample rows
      if (parsed.some((p: any) => p.id === 'pack-mangatha-ajith' || p.id === 'pack-leo-vijay' || p.id === 'pack-vikram-rolex')) {
        localStorage.removeItem('dala_packs');
        localStorage.removeItem('dala_clips');
        localStorage.removeItem('dala_saved');
        localStorage.removeItem('dala_playlists');
        return [];
      }
      return parsed;
    }
    return INITIAL_SCENEPACKS;
  });

  const [clips, setClips] = useState<Clip[]>(() => {
    const stored = localStorage.getItem('dala_clips');
    if (stored) return JSON.parse(stored);
    return INITIAL_CLIPS;
  });

  const [savedPacks, setSavedPacks] = useState<SavedPack[]>(() => {
    const stored = localStorage.getItem('dala_saved');
    if (stored) return JSON.parse(stored);
    return [];
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const stored = localStorage.getItem('dala_playlists');
    if (stored) return JSON.parse(stored);
    return [];
  });

  // Sync to localStorage on status changes
  useEffect(() => {
    localStorage.setItem('dala_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dala_packs', JSON.stringify(packs));
  }, [packs]);

  useEffect(() => {
    localStorage.setItem('dala_clips', JSON.stringify(clips));
  }, [clips]);

  useEffect(() => {
    localStorage.setItem('dala_saved', JSON.stringify(savedPacks));
  }, [savedPacks]);

  useEffect(() => {
    localStorage.setItem('dala_playlists', JSON.stringify(playlists));
  }, [playlists]);

  const toggleSavePack = (packId: string) => {
    if (!currentUser) return;
    setSavedPacks(prev => {
      const exists = prev.find(s => s.scenepack_id === packId && s.user_email === currentUser.email);
      let updated: SavedPack[];
      if (exists) {
        updated = prev.filter(s => !(s.scenepack_id === packId && s.user_email === currentUser.email));
        // decrement save_count
        setPacks(p => p.map(pack => pack.id === packId ? { ...pack, save_count: Math.max(0, pack.save_count - 1) } : pack));
      } else {
        const newSave: SavedPack = {
          id: `save-${Date.now()}`,
          scenepack_id: packId,
          user_email: currentUser.email,
          saved_at: new Date().toISOString()
        };
        updated = [...prev, newSave];
        // increment save_count
        setPacks(p => p.map(pack => pack.id === packId ? { ...pack, save_count: pack.save_count + 1 } : pack));
      }
      return updated;
    });
  };

  const addPack = (newPackData: Omit<ScenePack, 'download_count' | 'view_count' | 'save_count' | 'rating' | 'created_at'>) => {
    const fullNewPack: ScenePack = {
      ...newPackData,
      download_count: 0,
      view_count: 0,
      save_count: 0,
      rating: 5.0,
      created_at: new Date().toISOString()
    };
    setPacks(prev => [fullNewPack, ...prev]);
  };

  const deletePack = (packId: string) => {
    // Cascading Pack Deletion: "Clips belonging to a pack are cascade deleted when the pack is deleted."
    setPacks(prev => prev.filter(p => p.id !== packId));
    setClips(prev => prev.filter(c => c.scenepack_id !== packId));
    setSavedPacks(prev => prev.filter(s => s.scenepack_id !== packId));
    setPlaylists(prev => prev.map(pl => ({
      ...pl,
      pack_ids: pl.pack_ids.filter(id => id !== packId)
    })));
  };

  const addClip = (newClipData: Omit<Clip, 'id'>) => {
    const newClip: Clip = {
      ...newClipData,
      id: `clip-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setClips(prev => [...prev, newClip]);
  };

  const incrementViewCount = (packId: string) => {
    setPacks(prev => prev.map(p => p.id === packId ? { ...p, view_count: p.view_count + 1 } : p));
  };

  const incrementDownloadCount = (packId: string) => {
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
    setPlaylists(prev => [...prev, newPlaylist]);
    return id;
  };

  const addPackToPlaylist = (playlistId: string, packId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.pack_ids.includes(packId)) return p;
        return { ...p, pack_ids: [...p.pack_ids, packId] };
      }
      return p;
    }));
  };

  const removePackFromPlaylist = (playlistId: string, packId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return { ...p, pack_ids: p.pack_ids.filter(id => id !== packId) };
      }
      return p;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const updatePackStatus = (packId: string, status: ScenePack['status']) => {
    setPacks(prev => prev.map(p => p.id === packId ? { ...p, status } : p));
  };

  const switchUserRole = (role: 'admin' | 'user') => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, role } : null);
  };

  const clearDatabase = () => {
    setPacks([]);
    setClips([]);
    setSavedPacks([]);
    setPlaylists([]);
    localStorage.removeItem('dala_packs');
    localStorage.removeItem('dala_clips');
    localStorage.removeItem('dala_saved');
    localStorage.removeItem('dala_playlists');
  };

  const restoreInitialData = () => {
    setPacks([]);
    setClips([]);
    setSavedPacks([]);
    setPlaylists([]);
    localStorage.removeItem('dala_packs');
    localStorage.removeItem('dala_clips');
    localStorage.removeItem('dala_saved');
    localStorage.removeItem('dala_playlists');
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
