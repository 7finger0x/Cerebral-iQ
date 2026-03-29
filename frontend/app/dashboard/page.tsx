'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
  Brain, TrendingUp, Award, Download, 
  ArrowRight, ShieldCheck, AlertCircle 
} from 'lucide-react';

// Sample data for the CHC profile
const data = [
  { subject: 'Fluid Reasoning (Gf)', score: 122, fullMark: 150 },
  { subject: 'Working Memory (Gwm)', score: 115, fullMark: 150 },
  { subject: 'Crystallized (Gc)', score: 130, fullMark: 150 },
  { subject: 'Visual-Spatial (Gv)', score: 108, fullMark: 150 },
  { subject: 'Processing Speed (Gs)', score: 112, fullMark: 150 },
  { subject: 'Quantitative (Gfq)', score: 125, fullMark: 150 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12 space-y-12 max-w-7xl mx-auto pt-24">
      {/* Header Summary */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-1"
        >
          <div className="flex items-center gap-2 text-primary font-bold tracking-tighter text-sm uppercase">
            <ShieldCheck className="w-4 h-4" />
            Verified Clinical Profile
          </div>
          <h1 className="text-4xl font-bold font-orbitron">Cognitive Performance Portfolio</h1>
        </motion.div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl glass-panel hover:bg-white/10 text-sm font-semibold">
            <Download className="w-4 h-4" />
            Export Clinical PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/20">
            Retake Assessment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-primary">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Estimated Full Scale IQ</span>
            <Brain className="text-primary w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold font-orbitron">124</span>
            <span className="text-primary text-sm font-bold">Superior</span>
          </div>
          <p className="text-xs text-slate-500">95% Confidence Interval: 119 - 129</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-accent">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Global Percentile</span>
            <TrendingUp className="text-accent w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold font-orbitron">94th</span>
            <span className="text-accent text-sm font-bold">Top 6%</span>
          </div>
          <p className="text-xs text-slate-500">Benchmark: Global Professional Baseline 2026</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-white">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm font-medium">Cognitive Load Capacity</span>
            <Award className="text-white w-5 h-5" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold font-orbitron">High</span>
          </div>
          <p className="text-xs text-slate-500">Optimized for complex strategic environments</p>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Profile */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col items-center">
          <h3 className="text-xl font-bold mb-8 self-start">CHC Multi-Dimensional Profile</h3>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                <Radar
                  name="Examinee"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Narrative Analysis */}
        <div className="glass-panel p-8 rounded-3xl space-y-8 overflow-y-auto max-h-[450px]">
          <h3 className="text-xl font-bold">Clinical Interpretation</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 shrink-0 flex items-center justify-center text-primary font-bold">Gf</div>
              <div>
                <h4 className="font-bold text-white mb-1">Superior Fluid Reasoning</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Your ability to solve novel problems and induce logical patterns is in the top 5% of the population. This predicts high performance in strategic planning and technical innovation roles.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 shrink-0 flex items-center justify-center text-accent font-bold">Gwm</div>
              <div>
                <h4 className="font-bold text-white mb-1">Efficient Working Memory</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  High capacity to hold and manipulate data in real-time. You excel in fast-paced environments requiring rapid multi-dimensional decision-making.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 border-dashed flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-muted shrink-0" />
              <p className="text-[11px] text-slate-500 leading-tight">
                This assessment was administered using the Cerebral iQ IRT-Engine v4.2 with 94.2% adaptive reliability. Results should be interpreted by an HR professional or clinician in the context of other behavioral data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
