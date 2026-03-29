import React, { useState, useEffect } from 'react';
import { User, db, collection, query, orderBy, onSnapshot } from '../firebase';
import { History as HistoryIcon, Search, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryItem {
  id: string;
  technology: string;
  timestamp: any;
  summary: string;
  trl: number;
  hypeCycle: string;
}

export function HistoryView({ user }: { user: User | null }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, `users/${user.uid}/history`),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HistoryItem[];
      setHistory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-blue-500" />
          Intelligence History
        </h2>
        <p className="text-white/40">Review your past technology analyses and trend reports.</p>
      </header>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/40">No search history found. Start by analyzing a technology.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-bold">
                    {item.trl}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{item.technology}</h3>
                    <div className="flex items-center gap-3 text-xs text-white/30 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp?.toDate().toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 bg-white/5 rounded flex items-center gap-1">
                        {item.hypeCycle}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
