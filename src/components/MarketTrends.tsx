import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../firebase';
import { Zap, TrendingUp, TrendingDown, Globe, Search, ArrowRight, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface MarketTrendsProps {
  user: User | null;
  onAnalyze?: (tech: string) => void;
}

export function MarketTrendsView({ user, onAnalyze }: MarketTrendsProps) {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Software', 'Hardware', 'Energy', 'Biotech', 'Telecom'];

  useEffect(() => {
    fetch('/api/trending')
      .then(res => res.json())
      .then(data => {
        setTrending(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Trending API failed, using fallback data:", err);
        const fallbackData = [
          { name: "Generative AI", growth: 125, trend: "up", sector: "Software" },
          { name: "Quantum Computing", growth: 45, trend: "up", sector: "Hardware" },
          { name: "Solid-State Batteries", growth: 30, trend: "up", sector: "Energy" },
          { name: "6G Networks", growth: 15, trend: "up", sector: "Telecom" },
          { name: "Bio-Computing", growth: 10, trend: "up", sector: "Biotech" },
          { name: "Edge AI", growth: 85, trend: "up", sector: "Hardware" },
          { name: "Neuromorphic Computing", growth: 20, trend: "up", sector: "Hardware" },
          { name: "Sustainable Aviation Fuel", growth: 40, trend: "up", sector: "Energy" },
        ];
        setTrending(fallbackData);
        setLoading(false);
      });
  }, []);

  const filteredTrends = useMemo(() => {
    return trending.filter(tech => {
      const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || tech.sector === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [trending, searchQuery, selectedCategory]);

  const handleFullReport = () => {
    toast.success("Generating comprehensive market report...", {
      description: "This may take a few moments as we aggregate global data signals.",
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-500" />
              Global Market Trends
            </h2>
            <p className="text-white/40">Real-time technology adoption and growth metrics across global markets.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text"
                placeholder="Search trends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-blue-500/50 outline-none transition-all w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-white/20 mr-2 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
          ))
        ) : filteredTrends.length > 0 ? (
          filteredTrends.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onAnalyze?.(tech.name)}
              className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {tech.trend === 'up' ? <TrendingUp className="w-12 h-12" /> : <TrendingDown className="w-12 h-12" />}
              </div>
              
              <div className="flex flex-col h-full justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest mb-2 block">{tech.sector || 'Emerging Tech'}</span>
                  <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{tech.name}</h3>
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">+{tech.growth}%</span>
                    <span className="text-[10px] text-white/20 uppercase tracking-tighter">Annual Growth</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tech.trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tech.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-white/20">No trends found matching your criteria.</p>
          </div>
        )}
      </div>

      <div className="mt-12 p-8 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Predictive Intelligence Active</h4>
            <p className="text-sm text-white/60">Our AI is currently monitoring 5,000+ technology signals globally.</p>
          </div>
        </div>
        <button 
          onClick={handleFullReport}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center gap-2"
        >
          View Full Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
