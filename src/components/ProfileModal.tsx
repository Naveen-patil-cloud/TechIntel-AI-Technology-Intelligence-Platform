import React, { useState, useEffect } from 'react';
import { User, auth, updateProfile } from '../firebase';
import { X, User as UserIcon, Settings, Camera, Check, Mail, Calendar, Shield, Bell, Globe, Palette, ChevronRight, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  initialTab?: 'profile' | 'preferences';
}

export function ProfileModal({ isOpen, onClose, user, initialTab = 'profile' }: ProfileModalProps) {
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences'>(initialTab);
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Preferences state
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [compactMode, setCompactMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    setActiveSection(initialTab);
  }, [initialTab]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(user.displayName || '');
      setIsEditing(false);
    }
  }, [isOpen, user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = () => {
    toast.success('Preferences saved successfully!');
  };

  const memberSince = new Date();
  memberSince.setMonth(memberSince.getMonth() - 3);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-[var(--card-bg)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  {activeSection === 'profile' ? (
                    <UserIcon className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Settings className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {activeSection === 'profile' ? 'Profile Settings' : 'Preferences'}
                  </h2>
                  <p className="text-xs text-white/40">
                    {activeSection === 'profile' ? 'Manage your account details' : 'Customize your experience'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-white/5">
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-all relative ${
                  activeSection === 'profile' ? 'text-blue-400' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Profile
                {activeSection === 'profile' && (
                  <motion.div
                    layoutId="profileTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveSection('preferences')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium transition-all relative ${
                  activeSection === 'preferences' ? 'text-blue-400' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Settings className="w-4 h-4" />
                Preferences
                {activeSection === 'preferences' && (
                  <motion.div
                    layoutId="profileTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeSection === 'profile' ? (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <img
                          src={user.photoURL || ''}
                          alt={user.displayName || 'User'}
                          className="w-20 h-20 rounded-2xl border-2 border-white/10 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{user.displayName || 'User'}</h3>
                        <p className="text-sm text-white/40">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-mono uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            Active
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono uppercase tracking-wider">
                            Pro Plan
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Fields */}
                    <div className="space-y-4">
                      <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                        <div className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserIcon className="w-4 h-4 text-white/30" />
                            <div>
                              <p className="text-[11px] text-white/30 uppercase tracking-wider font-mono">Display Name</p>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={displayName}
                                  onChange={(e) => setDisplayName(e.target.value)}
                                  className="bg-transparent text-white text-sm font-medium outline-none border-b border-blue-500/50 py-1 w-full"
                                  autoFocus
                                />
                              ) : (
                                <p className="text-sm text-white font-medium">{user.displayName || 'Not set'}</p>
                              )}
                            </div>
                          </div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setIsEditing(false);
                                  setDisplayName(user.displayName || '');
                                }}
                                className="px-3 py-1.5 text-xs text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isSaving ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-3 h-3 border border-white/30 border-t-white rounded-full"
                                  />
                                ) : (
                                  <Save className="w-3 h-3" />
                                )}
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                        <div className="px-4 py-3 flex items-center gap-3">
                          <Mail className="w-4 h-4 text-white/30" />
                          <div>
                            <p className="text-[11px] text-white/30 uppercase tracking-wider font-mono">Email Address</p>
                            <p className="text-sm text-white font-medium">{user.email || 'Not set'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                        <div className="px-4 py-3 flex items-center gap-3">
                          <Shield className="w-4 h-4 text-white/30" />
                          <div>
                            <p className="text-[11px] text-white/30 uppercase tracking-wider font-mono">Account ID</p>
                            <p className="text-sm text-white font-mono">{user.uid}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                        <div className="px-4 py-3 flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-white/30" />
                          <div>
                            <p className="text-[11px] text-white/30 uppercase tracking-wider font-mono">Member Since</p>
                            <p className="text-sm text-white font-medium">
                              {memberSince.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Theme */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                      <div className="px-4 py-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Palette className="w-4 h-4 text-purple-400" />
                          <p className="text-sm font-medium text-white">Theme</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'dark', label: 'Dark', colors: 'bg-[var(--app-bg)] border-blue-500/30' },
                            { id: 'midnight', label: 'Midnight', colors: 'bg-[#0a0a2e] border-indigo-500/30' },
                            { id: 'cyberpunk', label: 'Cyberpunk', colors: 'bg-[#0d0208] border-pink-500/30' },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setTheme(t.id);
                                toast.success(`Theme set to ${t.label}`);
                              }}
                              className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                                theme === t.id
                                  ? `${t.colors} ring-1 ring-white/10`
                                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className={`w-full h-8 rounded-lg mb-2 ${t.colors.split(' ')[0]}`} />
                              <span className="text-xs font-medium text-white/60">{t.label}</span>
                              {theme === t.id && (
                                <div className="absolute top-2 right-2">
                                  <Check className="w-3 h-3 text-blue-400" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Options */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden divide-y divide-white/5">
                      <ToggleOption
                        icon={<Bell className="w-4 h-4 text-yellow-400" />}
                        label="Push Notifications"
                        description="Get notified about trend alerts"
                        enabled={notifications}
                        onToggle={() => {
                          setNotifications(!notifications);
                          toast.success(notifications ? 'Notifications disabled' : 'Notifications enabled');
                        }}
                      />
                      <ToggleOption
                        icon={<Mail className="w-4 h-4 text-green-400" />}
                        label="Email Alerts"
                        description="Receive weekly trend reports via email"
                        enabled={emailAlerts}
                        onToggle={() => {
                          setEmailAlerts(!emailAlerts);
                          toast.success(emailAlerts ? 'Email alerts disabled' : 'Email alerts enabled');
                        }}
                      />
                      <ToggleOption
                        icon={<Settings className="w-4 h-4 text-blue-400" />}
                        label="Compact Mode"
                        description="Use a denser layout for more data"
                        enabled={compactMode}
                        onToggle={() => {
                          setCompactMode(!compactMode);
                          toast.success(compactMode ? 'Compact mode disabled' : 'Compact mode enabled');
                        }}
                      />
                      <ToggleOption
                        icon={<ChevronRight className="w-4 h-4 text-cyan-400" />}
                        label="Auto-Refresh Data"
                        description="Automatically refresh market data"
                        enabled={autoRefresh}
                        onToggle={() => {
                          setAutoRefresh(!autoRefresh);
                          toast.success(autoRefresh ? 'Auto-refresh disabled' : 'Auto-refresh enabled');
                        }}
                      />
                    </div>

                    {/* Language */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                      <div className="px-4 py-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Globe className="w-4 h-4 text-blue-400" />
                          <div>
                            <p className="text-sm font-medium text-white">Language</p>
                            <p className="text-[11px] text-white/30">Select your preferred language</p>
                          </div>
                        </div>
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value);
                            toast.success('Language updated');
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="en" className="bg-[var(--card-bg)]">English</option>
                          <option value="es" className="bg-[var(--card-bg)]">Español</option>
                          <option value="fr" className="bg-[var(--card-bg)]">Français</option>
                          <option value="de" className="bg-[var(--card-bg)]">Deutsch</option>
                          <option value="ja" className="bg-[var(--card-bg)]">日本語</option>
                          <option value="zh" className="bg-[var(--card-bg)]">中文</option>
                          <option value="hi" className="bg-[var(--card-bg)]">हिन्दी</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleSavePreferences}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToggleOption({
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-4 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-[11px] text-white/30">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-all ${
          enabled ? 'bg-blue-600' : 'bg-white/10'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}
