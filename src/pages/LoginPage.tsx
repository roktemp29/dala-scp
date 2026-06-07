import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Play, Film, Users, Download } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ packs: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: packCount } = await supabase
        .from('scene_packs')
        .select('*', { count: 'exact', head: true });
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      setStats({ packs: packCount || 0, users: userCount || 0 });
    };
    fetchStats();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden flex flex-col">

      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          src="https://isbvtqzecysxqwzyfceb.supabase.co/storage/v1/object/public/assets/Promo%20video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Dark overlays for readability */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      </div>

      {/* Navbar strip */}
      <div className="relative z-10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="https://isbvtqzecysxqwzyfceb.supabase.co/storage/v1/object/public/assets/logo.png"
            alt="Logo"
            className="w-9 h-9 rounded-xl object-cover"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-wider text-white leading-none flex items-center gap-1.5">
              DALA.AEP
              <span className="text-red-500 text-[7px] font-extrabold uppercase tracking-wider bg-red-500/10 border border-red-500/25 px-1.5 py-0.5 rounded-md">SCP</span>
            </span>
            <span className="text-[8px] text-zinc-400 font-mono tracking-widest leading-none mt-0.5 uppercase">Scenepack Center</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm"
        >
          Sign In
        </button>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pb-32">

        {/* Big logo above badge */}
        <img
          src="https://isbvtqzecysxqwzyfceb.supabase.co/storage/v1/object/public/assets/logo.png"
          alt="DALA.AEP Logo"
          className="w-24 h-24 rounded-2xl object-cover mb-6 shadow-2xl shadow-black/50 border border-white/10"
        />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Tamil Cinema Scenepack Platform
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none mb-4">
          DALA<span className="text-red-500">.</span>AEP
          <br />
          <span className="text-3xl md:text-5xl font-extrabold text-zinc-300 tracking-widest">SCENEPACK HUB</span>
        </h1>

        {/* Description */}
        <p className="text-zinc-300 text-sm md:text-base max-w-xl mt-6 leading-relaxed font-light">
          The ultimate platform for Tamil cinema editors. Browse, download, and share
          premium 4K scenepacks, raw clip reels, and graded footage collections.
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-10 mb-12">
          <div className="flex flex-col items-center">
            <span className="text-white font-black text-2xl">{stats.users}</span>
            <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest mt-0.5 flex items-center gap-1">
              <Users className="w-3 h-3" /> Editors
            </span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-white font-black text-2xl">{stats.packs}</span>
            <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-widest mt-0.5 flex items-center gap-1">
              <Film className="w-3 h-3" /> Scenepacks
            </span>
          </div>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="group flex items-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-black py-4 px-8 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-2xl shadow-black/50 text-sm"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {error && (
          <div className="mt-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <p className="text-zinc-600 text-[10px] mt-5 font-mono">
          Tamil cinema editors only · Free to join · No credit card required
        </p>
      </div>

      {/* Bottom fade + footer */}
      <div className="relative z-10 px-8 py-4 flex items-center justify-center border-t border-white/5">
        <div className="flex items-center gap-1.5 text-zinc-600 text-[10px] font-mono tracking-widest uppercase">
          <Shield className="w-3 h-3" />
          <span>Dala AEP SCP Platform · All rights reserved</span>
        </div>
      </div>

    </div>
  );
};