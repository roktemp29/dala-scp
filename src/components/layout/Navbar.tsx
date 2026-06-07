import React, { useState } from 'react';
import { Eye, Shield, Film, Upload, Grid, User, Layout, Menu, X, Check } from 'lucide-react';
import { useApp } from '../../lib/AppContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onViewProfileEmail?: (email: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onViewProfileEmail }) => {
  const { currentUser, switchUserRole } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Film },
    { id: 'browse', label: 'Browse', icon: Grid },
    { id: 'upload', label: 'Upload Pack', icon: Upload },
    { id: 'dashboard', label: 'Analytics', icon: Layout },
    { id: 'profile', label: 'My Library', icon: User },
  ];

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
        {/* Logo Section */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer select-none group"
          id="nav-logo-btn"
        >
          {/* Logo Emblem containing the User's Creator Avatar or a Gorgeous Red Emblem */}
          <div className="relative w-9 h-9 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center font-bold overflow-hidden shadow-lg shadow-red-600/10 group-hover:border-red-500/60 transition-all duration-300 shrink-0">
            {currentUser?.avatar_url ? (
              <img 
                src={currentUser.avatar_url} 
                alt="Branding Logo" 
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-red-500 font-extrabold text-sm group-hover:scale-110 transition-transform">D</span>
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

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-7">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}-btn`}
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

        {/* User Role Switcher + Profile Card */}
        <div className="hidden md:flex items-center gap-5">
          {/* Quick Sandbox Mode switch */}
          <div className="relative">
            <button 
              id="role-switch-dropdown-btn"
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10 hover:bg-white/20 text-[10px] uppercase font-bold tracking-widest text-[#E5E5E5] transition-all cursor-pointer"
            >
              <div className={`w-2.5 h-2.5 rounded-full ${currentUser?.role === 'admin' ? 'bg-red-600' : 'bg-amber-500'} animate-pulse`}></div>
              <span>{currentUser?.role}</span>
            </button>

            {showRoleSelector && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRoleSelector(false)}></div>
                <div className="absolute right-0 mt-3 w-48 bg-zinc-950 border border-white/10 rounded-xl p-1.5 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-2 py-1.5 text-[9px] font-mono text-zinc-500 border-b border-white/5 mb-1 bg-zinc-900/25 rounded">
                    SWITCH TEST PERSPECTIVE
                  </div>
                  <button
                    onClick={() => {
                      switchUserRole('user');
                      setShowRoleSelector(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-amber-500" /> Standard Creator
                    </span>
                    {currentUser?.role === 'user' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                  <button
                    onClick={() => {
                      switchUserRole('admin');
                      setShowRoleSelector(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" /> Admin/Moderator
                    </span>
                    {currentUser?.role === 'admin' && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                </div>
              </>
            )}
          </div>

          <div 
            onClick={() => {
              if (onViewProfileEmail) {
                onViewProfileEmail('dalaaep10@gmail.com');
              } else {
                setActiveTab('profile');
              }
            }}
            className="flex items-center gap-3 pl-4 border-l border-white/10 cursor-pointer hover:opacity-85 transition"
            id="nav-profile-trigger"
          >
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-orange-500 to-red-600 p-0.5 overflow-hidden">
              <img 
                src={currentUser?.avatar_url} 
                alt={currentUser?.full_name} 
                className="w-full h-full rounded-[4px] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-none">{currentUser?.full_name}</span>
              <span className="text-[10px] text-zinc-500 leading-none mt-1">dalaaep10@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => {
              // Toggle role on mobile quickly with a simple click
              if (currentUser) {
                switchUserRole(currentUser.role === 'admin' ? 'user' : 'admin');
              }
            }}
            className="px-2 py-1 bg-zinc-900 border border-white/5 text-[9px] font-mono text-zinc-300 rounded"
          >
            {currentUser?.role.toUpperCase()}
          </button>
          <button
            id="mobile-drawer-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
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
          
          <div className="flex items-center gap-3 px-4 py-3 bg-zinc-950 mt-2 rounded-lg border border-white/5">
            <img 
              src={currentUser?.avatar_url} 
              alt={currentUser?.full_name} 
              className="w-8 h-8 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">{currentUser?.full_name}</span>
              <span className="text-[10px] text-zinc-500">dalaaep10@gmail.com</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
