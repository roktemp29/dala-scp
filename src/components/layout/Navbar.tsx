import React, { useState } from 'react';
import { Shield, Film, Upload, Grid, User, Layout, Menu, X, Check, LogOut } from 'lucide-react';
import { useApp } from '../../lib/AppContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewProfileEmail?: (email: string) => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onViewProfileEmail, onSignOut }) => {
  const { currentUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Film },
    { id: 'browse', label: 'Browse', icon: Grid },
    { id: 'upload', label: 'Upload Pack', icon: Upload },
    { id: 'dashboard', label: 'Analytics', icon: Layout },
    { id: 'profile', label: 'My Library', icon: User },
  ];

  // Only show admin panel to real admins
  if (currentUser?.role === 'admin') {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield });
  }

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 px-6 lg:px-10 py-5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="relative w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center font-bold overflow-hidden shadow-lg shadow-red-600/10 group-hover:border-red-500/60 transition-all duration-300 shrink-0">
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-red-500 font-extrabold text-sm">D</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent pointer-events-none"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-white leading-none group-hover:text-red-500 transition-colors flex items-center">
              DALA.AEP <span className="text-red-500 font-extrabold text-[8px] uppercase tracking-wider bg-red-500/10 border border-red-500/25 px-1.5 py-0.5 rounded-md ml-1.5">SCP</span>
            </span>
            <span className="text-[8px] text-zinc-400 font-mono tracking-widest leading-none mt-1 uppercase font-bold">SCENEPACK CENTER</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                  isActive
                    ? 'text-white border-b-2 border-red-600 pb-1'
                    : 'text-zinc-400 hover:text-white pb-1 border-b-2 border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* User Profile + Sign Out */}
        <div className="hidden md:flex items-center gap-4">
          {/* Role badge — only shown to admins */}
          {currentUser?.role === 'admin' && (
            <span className="bg-red-600/10 border border-red-500/30 text-red-400 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Admin
            </span>
          )}

          {/* Profile card */}
          <div className="relative">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer hover:opacity-85 transition"
            >
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-orange-500 to-red-600 p-0.5 overflow-hidden">
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.full_name} className="w-full h-full rounded-[4px] object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full rounded-[4px] bg-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                    {currentUser?.full_name?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-none">{currentUser?.full_name}</span>
                <span className="text-[10px] text-zinc-500 leading-none mt-1 truncate max-w-[120px]">{currentUser?.email}</span>
              </div>
            </div>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-3 w-48 bg-zinc-950 border border-white/10 rounded-xl p-1.5 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      if (onViewProfileEmail && currentUser?.email) onViewProfileEmail(currentUser.email);
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" /> My Profile
                  </button>
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={() => { onSignOut?.(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 bg-white/5 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/5 flex flex-col gap-1.5 animate-in slide-in-from-top duration-300">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-left text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600/20 to-zinc-900 border-l-2 border-red-500 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-red-500" />
                {item.label}
              </button>
            );
          })}

          <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 mt-2 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
              {currentUser?.avatar_url ? (
                <img 
                    src="https://isbvtqzecysxqwzyfceb.supabase.co/storage/v1/object/public/assets/logo.png" 
                    alt="DALA.AEP Logo" 
                    className="w-full h-full object-cover rounded-xl" 
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">
                  {currentUser?.full_name?.[0] || '?'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">{currentUser?.full_name}</span>
                <span className="text-[10px] text-zinc-500">{currentUser?.email}</span>
              </div>
            </div>
            <button
              onClick={() => onSignOut?.()}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};