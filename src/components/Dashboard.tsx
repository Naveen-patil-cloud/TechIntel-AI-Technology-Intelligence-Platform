import React, { useState, useEffect } from 'react';
import { User } from '../firebase';
import { Search, TrendingUp, TrendingDown, Zap, Shield, AlertTriangle, Lightbulb, ArrowRight, Loader2, Lock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeTechnology, TechAnalysis } from '../services/geminiService';
import { ForecastChart, HypeCycleChart, TRLTracker } from './Charts';
import ReactMarkdown from 'react-markdown';
import { AuthModal } from './AuthModal';

interface DashboardProps {
  user: User | null;
  initialSearch?: string | null;
  onSearchHandled?: () => void;
}

export function Dashboard({ user, initialSearch, onSearchHandled }: DashboardProps) {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TechAnalysis | null>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = overrideQuery || query;
    
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!searchQuery.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeTechnology(searchQuery);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (initialSearch && user) {
      setQuery(initialSearch);
      handleSearch(undefined, initialSearch);
      onSearchHandled?.();
    }
  }, [initialSearch, user]);

  useEffect(() => {
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => {
        // Limit to 3 items for guests
        setTrending(user ? data : data.slice(0, 3));
      })
      .catch(err => {
        console.warn("Trending API failed, using fallback data:", err);
        const fallbackData = [
          { name: "Generative AI", growth: 125, trend: "up" },
          { name: "Quantum Computing", growth: 45, trend: "up" },
          { name: "Solid-State Batteries", growth: 30, trend: "up" },
          { name: "6G Networks", growth: 15, trend: "up" },
          { name: "Bio-Computing", growth: 10, trend: "up" },
        ];
        setTrending(user ? fallbackData : fallbackData.slice(0, 3));
      });
  }, [user]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AuthModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      {/* Header & Search */}
      <header className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Technology Intelligence Core</h2>
        <p className="text-white/40 mb-8">Enter a technology field to generate real-time forecasts and maturity analysis.</p>

        <form onSubmit={handleSearch} className="relative group max-w-2xl">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className={`relative flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md focus-within:border-blue-500/50 transition-all ${!user ? 'cursor-not-allowed' : ''}`}>
            <Search className="w-5 h-5 ml-3 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={user ? "Enter technology (e.g., Quantum Computing)" : "Login to search technologies..."}
              disabled={!user}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 py-2 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-all flex items-center gap-2"
            >
              {!user && <Lock className="w-4 h-4" />}
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
          {!user && (
            <div 
              className="absolute inset-0 z-10 cursor-pointer" 
              onClick={() => setIsLoginModalOpen(true)}
            />
          )}
        </form>
      </header>

      <AnimatePresence mode="wait">
        {!analysis ? (
          <motion.div
            key="trending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Live Market Trends
              </h3>
              {!user && (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  Unlock 50+ more trends
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {trending.map((tech, i) => (
                <TrendCard 
                  key={i} 
                  {...tech} 
                  onClick={() => {
                    setQuery(tech.name);
                    handleSearch(new Event('submit') as any, tech.name);
                  }} 
                />
              ))}
              {!user && (
                <div className="p-4 bg-white/5 border border-white/10 border-dashed rounded-2xl flex flex-col items-center justify-center text-white/20 gap-2">
                  <Lock className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-tighter">Locked</span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Analysis content remains the same as it's only shown if analysis exists (which requires login) */}
            {/* ... */}
            {/* Top Row: Summary & TRL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Executive Summary: {query}</h3>
                </div>
                <div className="prose prose-invert max-w-none text-white/70 leading-relaxed">
                  <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                </div>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm flex flex-col justify-center">
                <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-8 text-center">TRL Maturity Level</h3>
                <TRLTracker level={analysis.trl} />
              </div>
            </div>

            {/* Middle Row: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  5-Year Growth Forecast
                </h3>
                <div className="h-[300px]">
                  <ForecastChart data={analysis.forecast} />
                </div>
              </div>
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
                <h3 className="text-sm font-mono text-white/40 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  Hype Cycle Position
                </h3>
                <div className="h-[300px]">
                  <HypeCycleChart currentPosition={analysis.hypeCycle} />
                </div>
              </div>
            </div>

            {/* Bottom Row: AI Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <InsightCard
                icon={<Lightbulb className="w-5 h-5 text-yellow-400" />}
                title="Key Opportunities"
                items={analysis.opportunities}
                color="yellow"
              />
              <InsightCard
                icon={<Zap className="w-5 h-5 text-blue-400" />}
                title="Future Predictions"
                items={analysis.insights}
                color="blue"
              />
              <InsightCard
                icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                title="Risk Analysis"
                items={analysis.risks}
                color="red"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrendCard({ name, growth, trend, onClick }: { name: string; growth: number; trend: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group active:scale-95"
    >
      <p className="text-sm text-white/40 mb-1">{name}</p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold">+{growth}%</span>
        {trend === 'up' ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
      </div>
    </div>
  );
}

function InsightCard({ icon, title, items, color }: { icon: React.ReactNode; title: string; items: string[]; color: string }) {
  const colorMap: Record<string, string> = {
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color].split(' ')[0]}`}>
          {icon}
        </div>
        <h4 className="font-bold">{title}</h4>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-white/60">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
