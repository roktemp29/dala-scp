import React, { useState, useEffect } from 'react';
import { AppProvider } from './lib/AppContext';
import { useApp } from './lib/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { PackDetail } from './pages/PackDetail';
import { Player } from './pages/Player';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';
import { LoginPage } from './pages/LoginPage';
import { ShieldCheck } from 'lucide-react';
import { supabase } from './lib/supabase';

function BaseLayout() {
  const { currentUser, loading, signOut } = useApp();
  // Parse initial pack ID from URL (handles shared links like /pack/pack-123)
  const getInitialPackId = () => {
    const match = window.location.pathname.match(/^\/pack\/(.+)$/);
    return match ? match[1] : null;
  };

  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(getInitialPackId);
  const [streamingPackId, setStreamingPackId] = useState<string | null>(null);
  const [viewProfileEmail, setViewProfileEmail] = useState<string | null>(null);
  const [browseGenre, setBrowseGenre] = useState<string>('All');
  const [browseSearch, setBrowseSearch] = useState<string>('');
  const [footerStats, setFooterStats] = useState({ packs: 0, users: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: packCount } = await supabase
        .from('scene_packs')
        .select('*', { count: 'exact', head: true });
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      setFooterStats({ packs: packCount || 0, users: userCount || 0 });
    };
    fetchStats();
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not signed in – replace history to prevent back button loop
  if (!currentUser) {
    window.history.replaceState(null, '', '/');
    return <LoginPage />;
  }

  const navigateToGenre = (genreName: string) => {
    setBrowseGenre(genreName);
    setBrowseSearch('');
    setSelectedPackId(null);
    setActiveTab('browse');
  };

  const handleOpenPack = (packId: string) => {
    setSelectedPackId(packId);
    window.history.pushState(null, '', `/pack/${packId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProfile = (email: string) => {
    setViewProfileEmail(email);
    setSelectedPackId(null);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] font-sans flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedPackId(null);
          if (tab !== 'profile') setViewProfileEmail(null);
        }}
        onViewProfileEmail={handleOpenProfile}
        onSignOut={signOut}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 mb-8 relative">
        {selectedPackId ? (
          <PackDetail
            packId={selectedPackId}
            onBack={() => {
              setSelectedPackId(null);
              window.history.pushState(null, '', '/');
            }}
            onStreamClick={(id) => setStreamingPackId(id)}
            onViewProfileEmail={handleOpenProfile}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <Home
                onPackClick={handleOpenPack}
                onStreamClick={(id) => setStreamingPackId(id)}
                onTabChange={setActiveTab}
              />
            )}
            {activeTab === 'browse' && (
              <Browse
                onPackClick={handleOpenPack}
                defaultGenre={browseGenre}
                defaultSearch={browseSearch}
              />
            )}
            {activeTab === 'upload' && (
              <Upload onSuccess={(id) => { setSelectedPackId(id); setActiveTab('browse'); }} />
            )}
            {activeTab === 'profile' && (
              <Profile viewEmail={viewProfileEmail || undefined} onPackClick={handleOpenPack} />
            )}
            {activeTab === 'dashboard' && <Dashboard />}
            {/* Admin tab only visible to admins */}
            {activeTab === 'admin' && currentUser.role === 'admin' && (
              <Admin onPackClick={handleOpenPack} />
            )}
          </>
        )}
      </main>

      {streamingPackId && (
        <Player packId={streamingPackId} onClose={() => setStreamingPackId(null)} />
      )}

      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 border-t border-white/5 py-5 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-[0.2em] font-extrabold text-zinc-400 gap-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-center md:text-left">
          <span className="hover:text-zinc-200 transition-colors">{footerStats.users} Active Editors</span>
          <span className="hover:text-zinc-200 transition-colors">{footerStats.packs} Scenepacks</span>
        </div>
        <div className="flex gap-2.5 items-center bg-zinc-950/40 px-3 py-1 rounded-full border border-white/5">
          <span className="text-[#E5E5E5] text-[9px] font-sans">System Status: Optimal</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-lg shadow-emerald-500/50 animate-pulse"></div>
        </div>
      </div>

      <footer className="py-6 border-t border-white/5 bg-[#08080a] text-center text-[10px] font-mono text-zinc-400 space-y-1">
        <div className="flex justify-center items-center gap-1.5 leading-none">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
          <span>DALA.AEP SCP PLATFORM CORES COOPERATION</span>
        </div>
        <p>Tamil Movie Scenepacks & Sliced Pre-buffered extracts, curated by editors for editors.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BaseLayout />
    </AppProvider>
  );
}