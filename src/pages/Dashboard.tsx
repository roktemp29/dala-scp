import React, { useState, useMemo } from 'react';
import { 
  Eye, Download, Bookmark, Film, AlertCircle, TrendingUp,
  ShieldCheck, Trophy, Medal, Heart, Crown, Star
} from 'lucide-react';
import { useApp } from '../lib/AppContext';

export const Dashboard: React.FC = () => {
  const { packs, currentUser } = useApp();

  const authorEmail = currentUser?.email || 'dalaaep10@gmail.com';

  // Compute stats for current logged-in uploader Email
  const authorPacks = useMemo(() => {
    return packs.filter(p => p.uploader_email === authorEmail);
  }, [packs, authorEmail]);

  const totalViews = useMemo(() => {
    return authorPacks.reduce((sum, p) => sum + p.view_count, 0);
  }, [authorPacks]);

  const totalDownloads = useMemo(() => {
    return authorPacks.reduce((sum, p) => sum + p.download_count, 0);
  }, [authorPacks]);

  const totalSaves = useMemo(() => {
    return authorPacks.reduce((sum, p) => sum + p.save_count, 0);
  }, [authorPacks]);

  // Compute mock-historical trend values to map into the SVG chart
  const historicalTrendData = useMemo(() => {
    // Distribute overall statistics across past 7 days
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const viewsFactor = totalViews > 0 ? totalViews / 5.2 : 240;
    const dlFactor = totalDownloads > 0 ? totalDownloads / 5.2 : 55;

    return days.map((day, idx) => {
      // Simulate typical traffic wave curve
      const multiplier = (idx % 2 === 0) ? 1.25 : 0.85;
      const vVal = Math.round(viewsFactor * multiplier * ((idx + 2) / 4.5));
      const dVal = Math.round(dlFactor * multiplier * ((idx + 1.5) / 4.5));
      return { day, views: vVal, downloads: dVal };
    });
  }, [totalViews, totalDownloads]);

  // Max stats for scaling the charts safely
  const maxVal = useMemo(() => {
    const vals = [
      ...historicalTrendData.map(d => d.views),
      ...historicalTrendData.map(d => d.downloads)
    ];
    return Math.max(...vals, 100);
  }, [historicalTrendData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-white/5 p-5 md:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between text-left gap-4 select-none">
        <div className="space-y-1.5 flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> creator portal live metrics
          </div>
          <h2 className="text-xl md:text-2xl font-black text-zinc-100 mt-1">Hello, {currentUser?.full_name || 'Creator'}!</h2>
          <p className="text-zinc-400 text-xs md:text-sm">Review active streams, overall zip compilation counts, and clip-action maps in real-time.</p>
        </div>

        {/* Real rank computed from all editors */}
        {(() => {
          const allEditors = Array.from(new Set(packs.filter(p => p.status === 'published').map(p => p.uploader_email)));
          const editorStats = allEditors.map(email => ({
            email,
            total: packs.filter(p => p.uploader_email === email && p.status === 'published').reduce((s, p) => s + p.download_count + p.view_count + (p.like_count || 0), 0)
          })).sort((a, b) => b.total - a.total);
          const myRank = editorStats.findIndex(e => e.email === authorEmail) + 1;
          const myTotal = editorStats.find(e => e.email === authorEmail)?.total || 0;
          const score = myTotal > 0 ? Math.min(99, Math.round(50 + (myTotal / Math.max(editorStats[0]?.total || 1, 1)) * 49)) : 0;
          const grade = score >= 90 ? 'A+' : score >= 75 ? 'A' : score >= 60 ? 'B+' : score >= 50 ? 'B' : 'C';
          return (
            <div className="flex bg-zinc-950 border border-white/5 p-3 rounded-xl gap-6 font-mono text-xs max-w-fit self-start md:self-auto">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block leading-none">Global Rank</span>
                <span className="text-white font-extrabold text-sm block mt-1">
                  {myRank > 0 ? `#${myRank} of ${editorStats.length}` : 'Unranked'}
                </span>
              </div>
              <div className="border-l border-white/5 pl-6">
                <span className="text-[10px] text-zinc-500 uppercase block leading-none">Curation Score</span>
                <span className={`font-extrabold text-sm block mt-1 ${score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-zinc-400'}`}>
                  {score}% {grade}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Grid Bento Cards: Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL PUBLISHED', val: authorPacks.length, unit: 'containers', icon: Film, bg: 'from-amber-600/5 to-zinc-900/40' },
          { label: 'SCENEPLAY STREAMS', val: totalViews, unit: 'pre-buffers', icon: Eye, bg: 'from-blue-600/5 to-zinc-900/40' },
          { label: 'ZIP EXPORT EXTRACTIONS', val: totalDownloads, unit: 'downloads', icon: Download, bg: 'from-red-600/5 to-zinc-900/40' },
          { label: 'COMMUNITY BOOKMARKS', val: totalSaves, unit: 'saves', icon: Bookmark, bg: 'from-emerald-600/5 to-zinc-900/40' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx}
              className={`p-4 rounded-2xl border border-white/5 bg-gradient-to-br ${stat.bg} flex flex-col gap-3 justify-between`}
            >
              <div className="flex items-center justify-between text-zinc-500">
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase leading-none">{stat.label}</span>
                <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
              </div>
              <div className="flex flex-col items-start justify-end mt-1">
                <span className="text-xl md:text-3xl font-black text-white leading-none tracking-tight">{stat.val}</span>
                <span className="text-[9px] font-mono text-zinc-500 mt-1">{stat.unit} tracked</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics SVG Chart Bento - Views vs Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double-Size Card: Traffic waves */}
        <div className="lg:col-span-2 p-5 bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col gap-5 text-left">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 leading-none">
              <TrendingUp className="w-4 h-4 text-red-500" /> Metric Distribution Wave
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Comparing total scene streams (Light Blue) and zip compiling conversions (Orange) over 7 days.</p>
          </div>

          {/* SVG Vector Chart Grid */}
          <div className="relative h-60 w-full bg-zinc-950 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between">
            {/* Background Grid Lines rendering */}
            <div className="absolute inset-0 p-10 flex flex-col justify-between pointer-events-none opacity-40">
              {[1, 2, 3, 4].map(l => (
                <div key={l} className="border-b border-zinc-900 w-full h-px"></div>
              ))}
            </div>

            {/* Custom SVG Nodes Path Mapping */}
            <div className="w-full h-[80%] absolute inset-0 top-3 px-12 z-10">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* 1. Views Fill Curve path */}
                <path
                  d={historicalTrendData.reduce((path, data, idx) => {
                    const x = (idx / (historicalTrendData.length - 1)) * 100;
                    const y = 92 - (data.views / maxVal) * 80;
                    return path + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* 2. Downloads Fill Path */}
                <path
                  d={historicalTrendData.reduce((path, data, idx) => {
                    const x = (idx / (historicalTrendData.length - 1)) * 100;
                    const y = 92 - (data.downloads / maxVal) * 80;
                    return path + `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '')}
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Dots overlay for data coordinates */}
                {historicalTrendData.map((data, idx) => {
                  const x = (idx / (historicalTrendData.length - 1)) * 100;
                  const yViews = 92 - (data.views / maxVal) * 80;
                  const yDLs = 92 - (data.downloads / maxVal) * 80;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={yViews} r="1.5" fill="#3b82f6" className="animate-pulse" />
                      <circle cx={x} cy={yDLs} r="1.5" fill="#ea580c" className="animate-pulse" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Chart X Legend indicators */}
            <div className="mt-auto pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500 w-full z-10 bg-zinc-950 border-t border-white/5 py-1.5 px-10 rounded-b-xl">
              {historicalTrendData.map(d => (
                <span key={d.day}>{d.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Global Editor Leaderboard */}
        <div className="p-5 bg-zinc-950/40 border border-white/5 rounded-2xl flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-white leading-none">Top Editors Leaderboard</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Ranked by downloads + views + likes across all published packs.</p>
            </div>
          </div>

          {(() => {
            const publishedPacks = packs.filter(p => p.status === 'published');
            const editorMap: Record<string, { name: string; downloads: number; views: number; likes: number; packs: number }> = {};
            publishedPacks.forEach(p => {
              if (!editorMap[p.uploader_email]) {
                editorMap[p.uploader_email] = { name: p.uploader_name, downloads: 0, views: 0, likes: 0, packs: 0 };
              }
              editorMap[p.uploader_email].downloads += p.download_count;
              editorMap[p.uploader_email].views += p.view_count;
              editorMap[p.uploader_email].likes += p.like_count || 0;
              editorMap[p.uploader_email].packs += 1;
            });

            const leaderboard = Object.entries(editorMap)
              .map(([email, stats]) => ({ email, ...stats, score: stats.downloads + stats.views + stats.likes }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 10);

            const rankIcons = [
              <Crown className="w-3.5 h-3.5 text-amber-400" />,
              <Medal className="w-3.5 h-3.5 text-zinc-300" />,
              <Medal className="w-3.5 h-3.5 text-amber-700" />
            ];

            if (leaderboard.length === 0) return (
              <div className="py-10 bg-[#0c0c0e]/20 border border-white/5 rounded-xl text-center text-zinc-500 flex flex-col items-center justify-center">
                <AlertCircle className="w-8 h-8 text-zinc-800 mb-1" />
                <p className="text-[10px] font-mono">No published packs yet.</p>
              </div>
            );

            return (
              <div className="space-y-2 flex-1 max-h-[280px] overflow-y-auto pr-1">
                {leaderboard.map((editor, idx) => {
                  const isMe = editor.email === authorEmail;
                  return (
                    <div
                      key={editor.email}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isMe
                          ? 'bg-red-500/5 border-red-500/20 ring-1 ring-red-500/10'
                          : 'bg-zinc-950 border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                          {idx < 3 ? rankIcons[idx] : (
                            <span className="text-[10px] font-mono font-bold text-zinc-600">#{idx + 1}</span>
                          )}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold truncate ${isMe ? 'text-red-400' : 'text-zinc-200'}`}>
                              {editor.name}
                            </span>
                            {isMe && <span className="text-[8px] font-mono bg-red-500/20 text-red-400 px-1 rounded shrink-0">YOU</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[9px] font-mono text-zinc-500">
                            <span>{editor.packs} packs</span>
                            <span className="flex items-center gap-0.5"><Download className="w-2.5 h-2.5" />{editor.downloads}</span>
                            <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5 text-pink-500" />{editor.likes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[10px] font-mono font-bold text-amber-500">{editor.score.toLocaleString()}</span>
                        <span className="text-[8px] font-mono text-zinc-600 block">pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

      </div>
    </div>
  );
};