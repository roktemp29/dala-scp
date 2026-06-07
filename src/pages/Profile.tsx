import React, { useState } from 'react';
import { 
  Sparkles, Film, Bookmark, FolderHeart, Plus, Trash2, 
  Settings, ChevronRight, Eye, Download, Info, Check, AlertCircle, X
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import { PackCard } from '../components/packs/PackCard';

interface ProfileProps {
  viewEmail?: string; // Optional public email profile lookup
  onPackClick: (packId: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ viewEmail, onPackClick }) => {
  const { 
    currentUser, setCurrentUser, packs, savedPacks, playlists, 
    createPlaylist, deletePlaylist, removePackFromPlaylist,
    clearDatabase, restoreInitialData
  } = useApp();

  // Determine current profile scope
  const targetEmail = viewEmail || currentUser?.email || 'guest@scenepack.com';
  const isOwnProfile = targetEmail === currentUser?.email;

  // Tabs: 'uploads', 'bookmarks', 'playlists'
  const [activeSubTab, setActiveSubTab] = useState<'uploads' | 'bookmarks' | 'playlists'>('uploads');

  // Profile Customizer State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar_url || '');

  // Playlist popup creator state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlayName, setNewPlayName] = useState('');
  const [newPlayDesc, setNewPlayDesc] = useState('');
  const [newPlayPublic, setNewPlayPublic] = useState(true);

  // Compute targeted assets
  const profileUser = isOwnProfile ? currentUser : {
    full_name: 'Dala Guest Creator',
    email: targetEmail,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    bio: 'Avid Tamil film and anime edit designer.',
    joined_at: '2026-03-12T10:00:00Z'
  };

  const userPacks = packs.filter(p => p.uploader_email === targetEmail);
  const userBookmarkedPacks = packs.filter(p => 
    savedPacks.some(s => s.scenepack_id === p.id && s.user_email === targetEmail)
  );
  const userPlaylists = playlists.filter(pl => pl.owner_email === targetEmail);

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayName.trim()) return;
    createPlaylist(newPlayName, newPlayDesc, newPlayPublic);
    setNewPlayName('');
    setNewPlayDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Profile Bio Jumbo Card */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/5 p-6 flex flex-col md:flex-row items-center gap-6 select-none">
        <img 
          src={profileUser?.avatar_url} 
          alt={profileUser?.full_name}
          className="w-20 h-20 rounded-2xl object-cover ring-2 ring-red-500/20 shadow-2xl shrink-0"
          referrerPolicy="no-referrer"
        />

        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h2 className="text-xl md:text-2xl font-extrabold text-white leading-none">{profileUser?.full_name}</h2>
            {isOwnProfile && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase shrink-0">
                {currentUser?.role}
              </span>
            )}
            {isOwnProfile && (
              <button
                onClick={() => {
                  setProfileName(currentUser?.full_name || '');
                  setProfileBio(currentUser?.bio || '');
                  setProfileAvatar(currentUser?.avatar_url || '');
                  setShowEditProfileModal(true);
                }}
                className="text-[9px] uppercase font-mono tracking-widest font-extrabold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/15 hover:border-red-500/30 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer shrink-0"
              >
                Edit Logo & Bio
              </button>
            )}
          </div>
          <span className="text-xs font-mono text-zinc-500">{profileUser?.email}</span>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl md:max-w-2xl leading-relaxed">
            {profileUser?.bio}
          </p>
        </div>
      </div>

      {/* Profile-level Database maintenance system block */}
      {isOwnProfile && (
        <div className="bg-[#0c0c0e]/95 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between text-left gap-3 select-none">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Settings className="w-3.5 h-3.5 text-zinc-400 animate-spin-slow" />
              Reset & Clean Memory Dashboard
            </h4>
            <p className="text-zinc-500 text-[10px] sm:text-xs">
              Clear all uploaded and default scenepacks to simulate a complete fresh database, or restore initial entries.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if (window.confirm('Delete all uploaded scenepacks and clips? This clears out the database completely.')) {
                  clearDatabase();
                }
              }}
              className="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-900/40 text-red-400 border border-red-500/10 hover:border-red-500/30 text-[10px] font-mono tracking-wider uppercase font-bold rounded-lg cursor-pointer transition"
            >
              Clear Database
            </button>
            <button
              onClick={restoreInitialData}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 text-[10px] font-mono tracking-wider uppercase font-bold rounded-lg cursor-pointer transition"
            >
              Restore Defaults
            </button>
          </div>
        </div>
      )}

      {/* Profile Shelf Navigation Subtabs */}
      <div className="flex bg-zinc-950 p-1 bg-[#0a0a0c]/80 border border-white/5 rounded-xl w-full max-w-md">
        {[
          { id: 'uploads', label: 'My Uploads', count: userPacks.length, icon: Film },
          { id: 'bookmarks', label: 'Saved Packs', count: userBookmarkedPacks.length, icon: Bookmark },
          { id: 'playlists', label: 'Playlists', count: userPlaylists.length, icon: FolderHeart }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
                isActive 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.label}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-black/20 text-white' : 'bg-zinc-900 text-zinc-500'}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SHELF VIEWPORTS */}
      
      {/* uploads Viewport */}
      {activeSubTab === 'uploads' && (
        <div className="space-y-5 animate-in fade-in duration-300 text-left">
          {userPacks.length === 0 ? (
            <div className="py-20 text-center bg-zinc-950/20 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <Film className="w-10 h-10 text-zinc-800 mb-2" />
              <h4 className="text-white text-xs font-mono">No uploaded scenepacks yet</h4>
              <p className="text-zinc-500 text-[10px] mt-1 max-w-xs">Upload your curated slow-mo, raw clip reels and action templates on the Upload tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {userPacks.map((pack) => (
                <div key={pack.id} className="relative group/uploads">
                  <PackCard pack={pack} onClick={() => onPackClick(pack.id)} />
                  
                  {/* Floating Status Indicator for Own Uploads */}
                  <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                    {pack.status === 'in_review' ? (
                      <span className="bg-amber-600 text-white text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded shadow">
                        IN REVIEW
                      </span>
                    ) : pack.status === 'draft' ? (
                      <span className="bg-zinc-700 text-white text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded shadow">
                        DRAFT
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks Shelf Viewport */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-5 animate-in fade-in duration-300 text-left">
          {userBookmarkedPacks.length === 0 ? (
            <div className="py-20 text-center bg-zinc-950/20 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <Bookmark className="w-10 h-10 text-zinc-800 mb-2" />
              <h4 className="text-white text-xs font-mono">Your saved/bookmark shelf is empty</h4>
              <p className="text-zinc-500 text-[10px] .mt-1 max-w-xs">Bookmark collections while browsing to pin them on this dedicated workspace shelf.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
              {userBookmarkedPacks.map((pack) => (
                <PackCard key={pack.id} pack={pack} onClick={() => onPackClick(pack.id)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playlists Shelf Viewport */}
      {activeSubTab === 'playlists' && (
        <div className="space-y-5 animate-in fade-in duration-300 text-left">
          
          {/* Header Action Row */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">CUSTOM FOLDER PACKS</span>
            {isOwnProfile && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-805 border border-white/10 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Create Folder Playlist</span>
              </button>
            )}
          </div>

          {userPlaylists.length === 0 ? (
            <div className="py-20 text-center bg-zinc-950/20 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
              <FolderHeart className="w-10 h-10 text-zinc-800 mb-2" />
              <h4 className="text-white text-xs font-mono">No curated folder playlists</h4>
              <p className="text-zinc-500 text-[10px] mt-1 max-w-xs">Group related movie extracts or specific editors into folder playlists to share them broadly.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userPlaylists.map((pl) => {
                // Get actual packs belonging to this playlist
                const plPacks = packs.filter(p => pl.pack_ids.includes(p.id));
                return (
                  <div key={pl.id} className="p-5 bg-zinc-950/40 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between text-left">
                      <div className="space-y-1">
                        <h4 className="text-base font-extrabold text-white flex items-center gap-1.5">
                          {pl.name}
                          <span className="text-[9px] font-mono font-medium text-zinc-500 bg-zinc-90 w-fit px-1.5 py-0.5 bg-zinc-900 border border-white/5 rounded">
                            {pl.is_public ? 'PUBLIC FOLDER' : 'PRIVATE'}
                          </span>
                        </h4>
                        <p className="text-zinc-400 text-xs leading-relaxed max-w-xl">{pl.description || 'No folder description description.'}</p>
                      </div>

                      {/* Delete option */}
                      {isOwnProfile && (
                        <button
                          onClick={() => deletePlaylist(pl.id)}
                          className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-red-500 border border-white/5 hover:border-red-500/10 rounded-xl transition cursor-pointer active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Pack grid inside playlist */}
                    {plPacks.length === 0 ? (
                      <div className="py-8 text-center bg-[#0a0a0c]/20 border border-dashed border-zinc-900 rounded-xl">
                        <p className="text-[10px] font-mono text-zinc-500">No packs added yet. Open pack pages and click "Add to Playlist" to populate.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                        {plPacks.map((p) => (
                          <div key={`pl-pack-${p.id}`} className="relative group/pl-card">
                            {/* Miniature vertical card strip */}
                            <div 
                              onClick={() => onPackClick(p.id)}
                              className="bg-[#0b0b0e] border border-white/5 rounded-xl overflow-hidden aspect-[2/3] relative cursor-pointer group hover:scale-103 transition-transform"
                            >
                              <img src={p.thumbnail_url} className="w-full h-full object-cover" alt={p.title} referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                              <div className="absolute bottom-2.5 left-2 text-left w-[85%]">
                                <span className="text-[8px] font-mono text-red-500 block truncate">{p.anime_source}</span>
                                <span className="text-[10px] font-bold text-white block truncate leading-none mt-0.5">{p.title}</span>
                              </div>
                            </div>

                            {/* Click to remove item from playlist folder */}
                            {isOwnProfile && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePackFromPlaylist(pl.id, p.id);
                                }}
                                className="absolute top-1.5 right-1.5 z-20 p-1.5 bg-black/80 hover:bg-red-600 rounded-lg text-zinc-400 hover:text-white transition scale-0 group-hover/pl-card:scale-100 shadow shadow-black"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Creation Modal popup inside Playlist drawers */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0 animate-fade-in" onClick={() => setShowCreateModal(false)}></div>
          
          <form 
            onSubmit={handleCreatePlaylistSubmit}
            className="relative w-full max-w-md bg-[#0e0e12] border border-white/10 rounded-2xl p-5 text-zinc-300 z-10 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">Curate custom folders</h3>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 px-1.5 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">FOLDER NAME / TITLE *</label>
              <input
                type="text"
                required
                placeholder="e.g. Masterclass slow-mos of 2026"
                value={newPlayName}
                onChange={(e) => setNewPlayName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-700 rounded-lg border border-white/5 outline-none focus:border-red-500 transition"
                id="create-playlist-name-input"
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold">SHORT OBJECTIVE DIRECTIVE</label>
              <textarea
                rows={3}
                placeholder="Briefly state target footage scope inside folder..."
                value={newPlayDesc}
                onChange={(e) => setNewPlayDesc(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-700 rounded-lg border border-white/5 outline-none resize-none focus:border-red-500 transition"
              />
            </div>

            <div className="flex items-center justify-between py-2 text-xs">
              <span className="font-semibold text-white">Publicly Visible</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={newPlayPublic} 
                  onChange={(e) => setNewPlayPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-950 border border-zinc-800 peer-checked:bg-red-600 peer-checked:border-red-500 rounded-full transition-all peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition active:scale-95 shadow cursor-pointer text-center"
              id="confirm-playlist-create-btn"
            >
              Add folder to database
            </button>
          </form>
        </div>
      )}

      {/* 4. Edit Profile Bio & custom Brand Logo Modal overlay */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!currentUser) return;
              const updated = {
                ...currentUser,
                full_name: profileName,
                bio: profileBio,
                avatar_url: profileAvatar
              };
              setCurrentUser(updated);
              localStorage.setItem('dala_user', JSON.stringify(updated));
              setShowEditProfileModal(false);
            }}
            className="w-full max-w-md bg-[#0e0e0f] border border-white/5 rounded-2xl p-6 space-y-4 select-none shadow-2xl animate-in zoom-in duration-150 text-left"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5 uppercase tracking-wide">
                <Settings className="w-4 h-4 text-red-500" /> Custom Brand Settings
              </h3>
              <button 
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="p-1 px-1.5 hover:bg-white/5 rounded text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">CREATOR OR PAGE LOGO URL *</label>
              <input
                type="url"
                required
                placeholder="Paste your custom uploaded logo banner/emblem URL..."
                value={profileAvatar}
                onChange={(e) => setProfileAvatar(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-700 rounded-lg border border-white/5 outline-none focus:border-red-500 transition"
              />
              <span className="text-[9px] font-mono text-zinc-500 mt-0.5">Use any direct image link. This becomes the primary brand asset on the top Navbar.</span>
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">CREATOR / NICKNAME</label>
              <input
                type="text"
                required
                placeholder="e.g. DALA.AEP"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-700 rounded-lg border border-white/5 outline-none focus:border-red-500 transition"
              />
            </div>

            <div className="space-y-1 flex flex-col">
              <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">CREATOR BIO SECTION</label>
              <textarea
                rows={3}
                placeholder="Write your custom creator background bio..."
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0a0c] text-xs text-white placeholder-zinc-700 rounded-lg border border-white/5 outline-none resize-none focus:border-red-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow cursor-pointer text-center"
            >
              Save Brand Configuration
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
