import React, { useState } from 'react';
import { User, auth } from '../firebase';
import { LogOut, History, BarChart2, Cpu, Globe, Shield, Layers, Menu, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthModal } from './AuthModal';
import { ProfileModal } from './ProfileModal';

interface LayoutProps {
  user: User | null;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ user, children, activeTab, setActiveTab }: LayoutProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [profileModalTab, setProfileModalTab] = React.useState<'profile' | 'preferences'>('profile');
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (user) {
      // Demo mode: just use user data
      setProfile({
        display_name: user.displayName,
        photo_url: user.photoURL
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  const displayName = profile?.display_name || user?.displayName || 'User';
  const photoURL = profile?.photo_url || user?.photoURL;

  return (
    <div className="flex h-screen overflow-hidden">
      <AuthModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      {user && (
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={user}
          initialTab={profileModalTab}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-[var(--card-bg)] border-r border-white/5 flex flex-col transition-all duration-300 overflow-hidden relative z-50`}>
        <div className="p-6 min-w-[256px]">
          <div className="flex items-center justify-between mb-8">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] group-hover:scale-110 transition-transform">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tighter group-hover:text-blue-400 transition-colors">TECHINTEL AI</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            <NavItem 
              icon={<BarChart2 className="w-4 h-4" />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            />
            <NavItem 
              icon={<History className="w-4 h-4" />} 
              label="History" 
              active={activeTab === 'history'} 
              onClick={() => user ? setActiveTab('history') : setIsLoginModalOpen(true)}
              locked={!user}
            />
            <NavItem 
              icon={<Layers className="w-4 h-4" />} 
              label="Compare" 
              active={activeTab === 'compare'} 
              onClick={() => user ? setActiveTab('compare') : setIsLoginModalOpen(true)}
              locked={!user}
            />
            <NavItem 
              icon={<Globe className="w-4 h-4" />} 
              label="Market Trends" 
              active={activeTab === 'market-trends'}
              onClick={() => user ? setActiveTab('market-trends') : setIsLoginModalOpen(true)}
              locked={!user} 
            />
            <NavItem 
              icon={<Shield className="w-4 h-4" />} 
              label="Risk Analysis" 
              active={activeTab === 'risk-analysis'}
              onClick={() => user ? setActiveTab('risk-analysis') : setIsLoginModalOpen(true)}
              locked={!user} 
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          {user ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <img src={photoURL || ""} alt={displayName} className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => auth.signOut()}
                className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[var(--app-bg)] relative flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 bg-[var(--app-bg)]/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all mr-2"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">Hello, {displayName.split(' ')[0]}</span>
              </div>
            ) : (
              <span className="text-white/40 text-sm italic">Guest Mode - Limited Access</span>
            )}
          </div>
          
          {user && (
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 hover:bg-white/5 rounded-full transition-all border border-transparent hover:border-white/10"
              >
                <img src={photoURL || ""} alt={displayName} className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[var(--card-bg)] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-white/5 mb-1">
                    <p className="text-sm font-bold text-white truncate">{displayName}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setProfileModalTab('profile');
                      setIsProfileModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <UserIcon className="w-4 h-4" />
                    Profile Settings
                  </button>
                  
                  <button 
                    onClick={() => {
                      setProfileModalTab('preferences');
                      setIsProfileModalOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Preferences
                  </button>
                  
                  <div className="h-px bg-white/5 my-1" />
                  
                  <button 
                    onClick={() => {
                      auth.signOut();
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, locked = false }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; locked?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all w-full ${active ? 'bg-blue-500/10 text-blue-400' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {locked && (
        <Shield className="w-3 h-3 text-white/20" />
      )}
    </button>
  );
}
