import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../firebase';
import { Shield, AlertTriangle, Search, ArrowRight, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface RiskAnalysisProps {
  user: User | null;
  onAnalyze?: (tech: string) => void;
}

export function RiskAnalysisView({ user, onAnalyze }: RiskAnalysisProps) {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const levels = ['All', 'High', 'Medium', 'Low'];

  useEffect(() => {
    // Mock risk data
    setTimeout(() => {
      const mockRisks = [
        { name: "Generative AI", riskLevel: "High", riskType: "Regulatory", description: "Potential for misinformation and copyright infringement.", trend: "up" },
        { name: "Quantum Computing", riskLevel: "Medium", riskType: "Technical", description: "Complexity in scaling and error correction.", trend: "up" },
        { name: "Solid-State Batteries", riskLevel: "Low", riskType: "Manufacturing", description: "High initial production costs and scalability.", trend: "down" },
        { name: "6G Networks", riskLevel: "Medium", riskType: "Infrastructure", description: "Massive investment required for global deployment.", trend: "up" },
        { name: "Bio-Computing", riskLevel: "High", riskType: "Ethical", description: "Ethical concerns regarding biological integration.", trend: "up" },
        { name: "Edge AI", riskLevel: "Low", riskType: "Security", description: "Security vulnerabilities in distributed systems.", trend: "down" },
        { name: "Neuromorphic Computing", riskLevel: "Medium", riskType: "Adoption", description: "Slow adoption due to specialized hardware requirements.", trend: "up" },
        { name: "Sustainable Aviation Fuel", riskLevel: "Low", riskType: "Economic", description: "Economic viability compared to traditional fuels.", trend: "down" },
      ];
      setRisks(mockRisks);
      setLoading(false);
    }, 500);
  }, []);

  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      const matchesSearch = risk.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'All' || risk.riskLevel === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [risks, searchQuery, selectedLevel]);

  const handleFullReport = () => {
    toast.error("Accessing classified risk database...", {
      description: "Full risk reports require high-level clearance. Generating preview...",
    });
  };

  const riskColorMap: Record<string, string> = {
    High: 'text-red-500 bg-red-500/10 border-red-500/20',
    Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    Low: 'text-green-500 bg-green-500/10 border-green-500/20',
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              Risk Intelligence Core
            </h2>
            <p className="text-white/40">Real-time risk assessment and vulnerability analysis across technology sectors.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input 
                type="text"
                placeholder="Search risks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-red-500/50 outline-none transition-all w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-4 h-4 text-white/20 mr-2 shrink-0" />
          {levels.map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedLevel === lvl 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {lvl} Level
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />
          ))
        ) : filteredRisks.length > 0 ? (
          filteredRisks.map((risk, i) => (
            <motion.div
              key={risk.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onAnalyze?.(risk.name)}
              className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${riskColorMap[risk.riskLevel]}`}>
                      {risk.riskLevel} Risk
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${risk.trend === 'up' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                      {risk.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold group-hover:text-red-400 transition-colors mb-2">{risk.name}</h3>
                  <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{risk.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{risk.riskType}</span>
                  <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                    View Analysis
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-white/20">No risks found matching your criteria.</p>
          </div>
        )}
      </div>

      <div className="mt-12 p-8 bg-red-600/10 border border-red-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-lg">Risk Monitoring Active</h4>
            <p className="text-sm text-white/60">Our AI is currently analyzing 1,000+ risk signals globally.</p>
          </div>
        </div>
        <button 
          onClick={handleFullReport}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all flex items-center gap-2"
        >
          View Full Risk Report
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
