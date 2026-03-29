import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Shield, Globe, ArrowRight, Search, TrendingUp, TrendingDown, DollarSign, BarChart3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthProps {
  onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [view, setView] = useState<'landing' | 'trends'>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketData, setMarketData] = useState<any[]>([]);

  useEffect(() => {
    if (view === 'trends') {
      // Mocking market data fetch
      setMarketData([
        { name: 'Gold', price: '2,154.20', change: '+1.2%', trend: 'up', type: 'commodity' },
        { name: 'Silver', price: '24.85', change: '+0.8%', trend: 'up', type: 'commodity' },
        { name: 'Crude Oil', price: '81.30', change: '-0.5%', trend: 'down', type: 'commodity' },
        { name: 'Apple Inc.', price: '172.50', change: '+0.4%', trend: 'up', type: 'stock' },
        { name: 'NVIDIA', price: '890.20', change: '+2.5%', trend: 'up', type: 'stock' },
        { name: 'Tesla', price: '163.50', change: '-1.8%', trend: 'down', type: 'stock' },
        { name: 'Microsoft', price: '415.20', change: '+0.9%', trend: 'up', type: 'stock' },
        { name: 'Reliance Jio', price: '2,980.00', change: '+1.5%', trend: 'up', type: 'stock' },
        { name: 'Google', price: '152.30', change: '+0.2%', trend: 'up', type: 'stock' },
        { name: 'Amazon', price: '178.10', change: '-0.3%', trend: 'down', type: 'stock' },
      ]);
    }
  }, [view]);

  const filteredData = marketData.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const suggestions = searchQuery.length > 0 
    ? marketData.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        item.name.toLowerCase() !== searchQuery.toLowerCase()
      ).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl w-full text-center relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-8 backdrop-blur-sm">
              <Zap className="w-3 h-3" />
              V2.5 INTELLIGENCE CORE ACTIVE
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-tight select-none">
              PREDICT THE FUTURE <br /> OF TECHNOLOGY
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
              Aggregating global patents, research, and market signals to generate 
              real-time intelligence and forecasting for the next decade.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 relative z-30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLogin();
                }}
                className="group flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 cursor-pointer relative z-30"
              >
                Access Intelligence Core
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setView('trends');
                }}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all backdrop-blur-md cursor-pointer relative z-30"
              >
                View Public Trends
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-12 border-t border-white/5">
              <Feature icon={<Shield className="w-5 h-5" />} label="Risk Analysis" />
              <Feature icon={<Globe className="w-5 h-5" />} label="Global Patents" />
              <Feature icon={<Cpu className="w-5 h-5" />} label="TRL Tracking" />
              <Feature icon={<Zap className="w-5 h-5" />} label="Hype Analysis" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl w-full relative z-10"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-2">Public Market Trends</h2>
                <p className="text-white/40">Real-time commodity and equity signals from global markets.</p>
              </div>
              <button 
                onClick={() => {
                  setView('landing');
                  setSearchQuery('');
                }}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="relative mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search commodities or companies..."
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500/50 outline-none transition-all text-lg"
                />
              </div>
              
              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
                  >
                    {suggestions.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setSearchQuery(item.name)}
                        className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'commodity' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                            {item.type === 'commodity' ? <BarChart3 className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-xs font-mono text-white/20 uppercase">{item.type}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.length > 0 ? (
                filteredData.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'commodity' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {item.type === 'commodity' ? <BarChart3 className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold">{item.name}</h3>
                          <span className="text-[10px] uppercase tracking-widest text-white/20 font-mono">{item.type}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${item.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {item.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {item.change}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">${item.price}</span>
                      <span className="text-xs text-white/20 font-mono">USD</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-white/40 italic">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 group cursor-pointer">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
        {icon}
      </div>
      <span className="text-xs font-mono text-white/40 uppercase tracking-widest group-hover:text-white/60 transition-all">{label}</span>
    </div>
  );
}
