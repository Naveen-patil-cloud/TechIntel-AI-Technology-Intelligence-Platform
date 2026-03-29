import React, { useState } from 'react';
import { User } from '../firebase';
import { Layers, Plus, X, Loader2, Zap, Cpu, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeTechnology, TechAnalysis } from '../services/geminiService';

export function CompareView({ user }: { user: User | null }) {
  const [techs, setTechs] = useState<string[]>(['', '']);
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<TechAnalysis[] | null>(null);

  const handleCompare = async () => {
    if (!user) return;
    const validTechs = techs.filter(t => t.trim());
    if (validTechs.length < 2) return;

    setIsComparing(true);
    try {
      const analyses = await Promise.all(validTechs.map(analyzeTechnology));
      setResults(analyses);
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <Layers className="w-8 h-8 text-purple-500" />
          Technology Comparison
        </h2>
        <p className="text-white/40">Compare maturity, growth, and risk profiles across multiple technology sectors.</p>
      </header>

      <div className="flex flex-wrap gap-4 mb-12">
        {techs.map((tech, i) => (
          <div key={i} className="relative group w-full md:w-64">
            <input
              type="text"
              value={tech}
              onChange={(e) => {
                const newTechs = [...techs];
                newTechs[i] = e.target.value;
                setTechs(newTechs);
              }}
              placeholder={`Technology ${i + 1}`}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 outline-none transition-all"
            />
            {techs.length > 2 && (
              <button 
                onClick={() => setTechs(techs.filter((_, idx) => idx !== i))}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {techs.length < 4 && (
          <button 
            onClick={() => setTechs([...techs, ''])}
            className="px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tech
          </button>
        )}
        <button
          onClick={handleCompare}
          disabled={isComparing || techs.filter(t => t.trim()).length < 2}
          className="ml-auto px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          {isComparing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
          {isComparing ? 'Comparing...' : 'Run Comparison'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {results.map((res, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50 group-hover:h-2 transition-all" />
                <h3 className="text-xl font-bold mb-6 text-purple-400">{techs.filter(t => t.trim())[i]}</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase font-mono">
                      <Cpu className="w-3 h-3" />
                      TRL Level
                    </div>
                    <span className="text-lg font-bold text-blue-400">{res.trl}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase font-mono">
                      <TrendingUp className="w-3 h-3" />
                      Growth
                    </div>
                    <span className="text-lg font-bold text-green-400">+{res.forecast[4].growth}%</span>
                  </div>

                  <div>
                    <p className="text-[10px] text-white/20 uppercase font-mono mb-2 tracking-widest">Hype Cycle</p>
                    <p className="text-sm text-white/60 leading-tight">{res.hypeCycle}</p>
                  </div>

                  <div>
                    <p className="text-[10px] text-white/20 uppercase font-mono mb-2 tracking-widest">Top Risk</p>
                    <p className="text-sm text-red-400/80 leading-tight italic">"{res.risks[0]}"</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
