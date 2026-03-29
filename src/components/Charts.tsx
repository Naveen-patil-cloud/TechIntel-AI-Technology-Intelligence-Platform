import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { motion } from 'motion/react';

interface ForecastData {
  year: number;
  growth: number;
}

export function ForecastChart({ data }: { data: ForecastData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis dataKey="year" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '12px' }}
          itemStyle={{ color: '#3b82f6' }}
        />
        <Area
          type="monotone"
          dataKey="growth"
          stroke="#3b82f6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorGrowth)"
          animationDuration={2000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const HYPE_STAGES = [
  "Innovation Trigger",
  "Peak of Inflated Expectations",
  "Trough of Disillusionment",
  "Slope of Enlightenment",
  "Plateau of Productivity"
];

export function HypeCycleChart({ currentPosition }: { currentPosition: string }) {
  const data = [
    { x: 10, y: 30, name: "Innovation Trigger" },
    { x: 30, y: 90, name: "Peak of Inflated Expectations" },
    { x: 50, y: 20, name: "Trough of Disillusionment" },
    { x: 70, y: 50, name: "Slope of Enlightenment" },
    { x: 90, y: 80, name: "Plateau of Productivity" }
  ];

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="x" hide />
          <YAxis type="number" dataKey="y" hide />
          <ZAxis type="number" range={[100, 100]} />
          <Scatter data={data} fill="#ffffff20" line={{ stroke: '#ffffff10', strokeWidth: 2, type: 'monotone' }}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.name === currentPosition ? '#a855f7' : '#ffffff20'} 
                stroke={entry.name === currentPosition ? '#a855f7' : 'none'}
                strokeWidth={entry.name === currentPosition ? 10 : 0}
                strokeOpacity={0.3}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      {/* Labels */}
      <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[10px] font-mono text-white/20 uppercase tracking-tighter">
        <span>Innovation</span>
        <span>Peak</span>
        <span>Trough</span>
        <span>Slope</span>
        <span>Plateau</span>
      </div>
    </div>
  );
}

export function TRLTracker({ level }: { level: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-6xl font-bold mb-8 text-blue-500 tracking-tighter">
        TRL {level}
      </div>
      <div className="flex gap-1 w-full max-w-xs h-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`flex-1 rounded-full ${i <= level ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/10'}`}
          />
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm font-medium text-white/80">
          {TRL_DESCRIPTIONS[level - 1]}
        </p>
        <p className="text-xs text-white/40 mt-2 max-w-[200px]">
          {TRL_DETAILS[level - 1]}
        </p>
      </div>
    </div>
  );
}

const TRL_DESCRIPTIONS = [
  "Basic Principles",
  "Concept Formulated",
  "Proof of Concept",
  "Lab Validation",
  "Component Validation",
  "System Prototype",
  "Operational Prototype",
  "System Qualified",
  "Proven in Operation"
];

const TRL_DETAILS = [
  "Scientific research begins to be translated into applied R&D.",
  "Invention begins. Practical applications can be invented.",
  "Active R&D is initiated. Analytical and laboratory studies.",
  "Basic technological components are integrated.",
  "Fidelity of TRL 4 increases significantly.",
  "Representative model or prototype system.",
  "System prototype demonstration in an operational environment.",
  "Actual system completed and qualified through test.",
  "Actual system proven through successful mission operations."
];
