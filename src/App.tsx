import React, { useState } from 'react';
import { AppProvider } from './lib/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { PackDetail } from './pages/PackDetail';
import { Player } from './pages/Player';
import { Upload } from './pages/Upload';
import { Profile } from './pages/Profile';
import { Dashboard } from './pages/Dashboard';
import { Admin } from './pages/Admin';

import { ShieldCheck, HelpCircle } from 'lucide-react';

function BaseLayout() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [streamingPackId, setStreamingPackId] = useState<string | null>(null);
  const [viewProfileEmail, setViewProfileEmail] = useState<string | null>(null);

  // Synchronized search queries across pages
  const [browseGenre, setBrowseGenre] = useState<string>('All');
  const [browseSearch, setBrowseSearch] = useState<string>('');

  const navigateToGenre = (genreName: string) => {
    setBrowseGenre(genreName);
    setBrowseSearch('');
    setSelectedPackId(null);
    setActiveTab('browse');
  };

  const handleOpenPack = (packId: string) => {
    setSelectedPackId(packId);
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
      {/* Dynamic Sticky Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Auto clean specific looking views when jumping tabs
          setSelectedPackId(null);
          if (tab !== 'profile') {
            setViewProfileEmail(null);
          }
        }} 
        onViewProfileEmail={handleOpenProfile}
      />

      {/* Main Page Canvas area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 mb-8 relative">
        
        {/* Render Details View Overlay or specific Tab pages */}
        {selectedPackId ? (
          <PackDetail 
            packId={selectedPackId} 
            onBack={() => setSelectedPackId(null)} 
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
              <Upload 
                onSuccess={(id) => {
                  setSelectedPackId(id);
                  setActiveTab('browse');
                }}
              />
            )}

            {activeTab === 'profile' && (
              <Profile 
                viewEmail={viewProfileEmail || undefined} 
                onPackClick={handleOpenPack}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard />
            )}

            {activeTab === 'admin' && (
              <Admin onPackClick={handleOpenPack} />
            )}
          </>
        )}
      </main>

      {/* Standalone cinematic Player covering entire viewport */}
      {streamingPackId && (
        <Player 
          packId={streamingPackId} 
          onClose={() => setStreamingPackId(null)} 
        />
      )}

      {/* Statistics Bar and System Status (Elegant Dark Design Specs) */}
      <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 border-t border-white/5 py-5 flex flex-col md:flex-row items-center justify-between text-[10px] uppercase tracking-[0.2em] font-extrabold text-zinc-400 gap-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-center md:text-left">
          <span className="hover:text-zinc-200 transition-colors">2,841 Active Editors</span>
          <span className="hover:text-zinc-200 transition-colors">14,092 Scenepacks</span>
          <span className="hover:text-zinc-200 transition-colors">942.8 TB Served</span>
        </div>
        <div className="flex gap-2.5 items-center bg-zinc-950/40 px-3 py-1 rounded-full border border-white/5">
          <span className="text-[#E5E5E5] text-[9px] font-sans">System Status: Optimal</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-lg shadow-emerald-500/50 animate-pulse"></div>
        </div>
      </div>

      {/* Footer System Credits and disclaimer */}
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
