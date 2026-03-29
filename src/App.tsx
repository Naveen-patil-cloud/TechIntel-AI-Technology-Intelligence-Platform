import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, User } from './firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Auth } from './components/Auth';
import { HistoryView } from './components/History';
import { CompareView } from './components/Compare';
import { MarketTrendsView } from './components/MarketTrends';
import { RiskAnalysisView } from './components/RiskAnalysis';
import { AIBot } from './components/AIBot';
import { AuthModal } from './components/AuthModal';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [initialSearch, setInitialSearch] = useState<string | null>(null);

  const wasLoggedOutRef = React.useRef(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Only redirect to dashboard when user first logs in (was logged out before)
      if (user && wasLoggedOutRef.current) {
        setActiveTab('dashboard');
      }
      wasLoggedOutRef.current = !user;
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleAnalyze = (tech: string) => {
    setInitialSearch(tech);
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-blue-500 font-mono text-xl"
        >
          TECHINTEL AI INITIALIZING...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      <Toaster position="top-right" theme="dark" />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      <AnimatePresence mode="wait">
        {activeTab === 'home' && !user ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Auth onLogin={handleLogin} />
          </motion.div>
        ) : activeTab === 'home' && user ? (
          <motion.div
            key="home-loggedin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Auth onLogin={() => setActiveTab('dashboard')} />
          </motion.div>
        ) : (
          <motion.div
            key="layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Layout user={user} activeTab={activeTab} setActiveTab={setActiveTab}>
              {activeTab === 'dashboard' && <Dashboard user={user} initialSearch={initialSearch} onSearchHandled={() => setInitialSearch(null)} />}
              {activeTab === 'history' && user && <HistoryView user={user} />}
              {activeTab === 'compare' && user && <CompareView user={user} />}
              {activeTab === 'market-trends' && user && <MarketTrendsView user={user} onAnalyze={handleAnalyze} />}
              {activeTab === 'risk-analysis' && user && <RiskAnalysisView user={user} onAnalyze={handleAnalyze} />}
            </Layout>
          </motion.div>
        )}
      </AnimatePresence>

      <AIBot user={user} />
    </div>
  );
}
