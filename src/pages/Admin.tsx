import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, CheckCircle2, XCircle, Trash2, ShieldCheck, 
  Search, Sliders, Eye, Download, Info, AlertOctagon, HelpCircle 
} from 'lucide-react';
import { useApp } from '../lib/AppContext';

interface AdminProps {
  onPackClick: (packId: string) => void;
}

export const Admin: React.FC<AdminProps> = ({ onPackClick }) => {
  const { 
    packs, clips, updatePackStatus, deletePack, currentUser
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_review' | 'published' | 'draft'>('all');

  // Safely guard admin controls against unprivileged roles
  const isAdmin = currentUser?.role === 'admin';

  // Compute overall moderation metrics
  const stats = useMemo(() => {
    return {
      total: packs.length,
      pending: packs.filter(p => p.status === 'in_review').length,
      published: packs.filter(p => p.status === 'published').length,
      clips: clips.length
    };
  }, [packs, clips]);

  // Filter lists based on states
  const filteredAdminPacks = useMemo(() => {
    return packs
      .filter(p => {
        if (filterStatus !== 'all' && p.status !== filterStatus) return false;
        
        if (searchTerm.trim() !== '') {
          const q = searchTerm.toLowerCase();
          return p.title.toLowerCase().includes(q) || p.anime_source.toLowerCase().includes(q);
        }
        
        return true;
      })
      .sort((a, b) => {
        // Prioritize "in_review" packs at the very top of lists!
        if (a.status === 'in_review' && b.status !== 'in_review') return -1;
        if (a.status !== 'in_review' && b.status === 'in_review') return 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [packs, searchTerm, filterStatus]);

  if (!isAdmin) {
    return (
      <div className="py-24 text-center max-w-sm mx-auto space-y-4 text-left animate-in fade-in duration-300">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-2 animate-bounce" />
        <h3 className="text-white text-lg font-bold text-center">Unprivileged Access</h3>
        <p className="text-zinc-500 text-xs text-center">
          Moderation console is strictly reserved for Admin accounts. Please use the **Sandbox Role Switcher** inside the upper navigation bar to assume the admin role for assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Moderation Desk Header */}
      <div className="bg-gradient-to-r from-red-950/20 via-zinc-900 to-red-950/10 border border-red-950/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between text-left gap-4 select-none">
        <div className="space-y-1.5 flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-red-500" /> Platform Moderation HQ
          </div>
          <h2 className="text-xl md:text-2xl font-black text-rose-100 mt-1">Audit Desk</h2>
          <p className="text-zinc-400 text-xs md:text-sm">Approve pending community uploads, unlist low quality packs, or initiate cascading deletes.</p>
        </div>

        {/* Administration quick stat display cubes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[10px] max-w-lg">
          <div className="bg-zinc-950 border border-white/5 p-2 rounded-lg text-center shrink-0">
            <span className="text-zinc-500 block leading-none">TOTAL RECORDS</span>
            <span className="text-white font-extrabold text-sm block mt-1">{stats.total}</span>
          </div>
          <div className="bg-[#1a120c] border border-amber-500/10 p-2 rounded-lg text-center shrink-0">
            <span className="text-amber-500 font-bold block leading-none animate-pulse">PENDING REVIEW</span>
            <span className="text-amber-400 font-extrabold text-sm block mt-1">{stats.pending}</span>
          </div>
          <div className="bg-[#0b140f] border border-emerald-500/10 p-2 rounded-lg text-center shrink-0">
            <span className="text-emerald-500 block leading-none">PUBLISHED PORT</span>
            <span className="text-emerald-400 font-extrabold text-sm block mt-1">{stats.published}</span>
          </div>
          <div className="bg-zinc-950 border border-white/5 p-2 rounded-lg text-center shrink-0">
            <span className="text-zinc-500 block leading-none">CHILD CLIPS</span>
            <span className="text-white font-extrabold text-sm block mt-1">{stats.clips}</span>
          </div>
        </div>
      </div>



      {/* Audit control search bars */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between min-w-full">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter by title or movie name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-950 text-xs text-white placeholder-zinc-500 rounded-xl border border-white/5 outline-none focus:border-red-500 transition"
            id="admin-search-input"
          />
        </div>

        {/* Status filtering capsules */}
        <div className="flex bg-zinc-950 p-1 border border-white/5 rounded-xl text-xs font-mono">
          {[
            { id: 'all', label: 'ALL PACKS' },
            { id: 'in_review', label: 'PENDING' },
            { id: 'published', label: 'APPROVED' },
            { id: 'draft', label: 'DRAFTS' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilterStatus(s.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer select-none ${
                filterStatus === s.id 
                  ? 'bg-zinc-900 border border-white/5 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table-Audit Ledger List */}
      <div className="w-full bg-[#08080b]/60 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-zinc-950/80 border-b border-white/5 flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase tracking-widest leading-none">
          <span>CURATOR TARGET REGISTER</span>
          <span>RESULT COUNT: {filteredAdminPacks.length}</span>
        </div>

        {filteredAdminPacks.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            <AlertOctagon className="w-10 h-10 text-zinc-800 mx-auto mb-2" />
            <p className="text-xs font-mono">No packs found matching current search queries.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredAdminPacks.map((pack) => {
              const clipsCount = clips.filter(c => c.scenepack_id === pack.id).length;
              const isReviewState = pack.status === 'in_review';

              return (
                <div 
                  key={pack.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0a0d]/20 hover:bg-[#0e0e12]/40 transition text-left"
                >
                  <div 
                    onClick={() => onPackClick(pack.id)}
                    className="flex gap-4 items-center flex-1 cursor-pointer hover:opacity-85"
                  >
                    <img 
                      src={pack.thumbnail_url} 
                      alt={pack.title}
                      className="w-10 h-14 object-cover rounded border border-white/5 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-900 border border-white/5 px-1.5 py-0.5 rounded capitalize">
                          {pack.genre}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {pack.resolution} | {clipsCount} clips | By {pack.uploader_name}
                        </span>
                        
                        {/* Life-cycle badges */}
                        {pack.status === 'in_review' ? (
                          <span className="text-[8px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded uppercase animate-pulse">
                            Needs Audit
                          </span>
                        ) : pack.status === 'published' ? (
                          <span className="text-[8px] font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded uppercase">
                            Approved
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono font-bold text-zinc-500 bg-zinc-500/10 border border-zinc-500/20 px-1 py-0.5 rounded uppercase">
                            Draft / Trash
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-sm text-white line-clamp-1 leading-tight">{pack.title}</h4>
                      <p className="text-[10px] text-zinc-500 line-clamp-1">{pack.description || 'No description notes attached.'}</p>
                    </div>
                  </div>

                  {/* Moderation Controls Actions Column */}
                  <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                    {/* Approve button */}
                    {isReviewState && (
                      <button
                        onClick={() => updatePackStatus(pack.id, 'published')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold leading-none flex items-center gap-1.5 transition select-none cursor-pointer active:scale-95 shadow"
                        id={`admin-btn-approve-${pack.id}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {/* Unlist / Revoke */}
                    {pack.status === 'published' && (
                      <button
                        onClick={() => updatePackStatus(pack.id, 'in_review')}
                        className="px-3 py-1.5 bg-zinc-90 w-fit text-[11px] font-semibold bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white rounded-lg leading-none transition select-none cursor-pointer active:scale-95"
                        id={`admin-btn-unlist-${pack.id}`}
                        title="Draft/audit mode"
                      >
                        <span>Unlist Pack</span>
                      </button>
                    )}

                    {/* Delete Pack trigger calling cascading deletion */}
                    <button
                      onClick={() => {
                        if (confirm(`Cascading Deletion: Are you sure you want to permanently delete "${pack.title}" and all ${clipsCount} associated child clip extracts from our database?`)) {
                          deletePack(pack.id);
                        }
                      }}
                      className="p-2 bg-zinc-950 border border-white/5 text-zinc-500 hover:text-red-500 hover:border-red-500/10 rounded-lg transition hover:scale-103 active:scale-95"
                      id={`admin-btn-delete-${pack.id}`}
                      title="Permanently purges pack and child entries"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};