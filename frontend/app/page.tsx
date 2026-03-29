'use client';

import React from 'react';
import { Orbitron, Inter } from 'next/font/google';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, BarChart3, ChevronRight, CheckCircle2 } from 'lucide-react';
import MatrixHook from '../components/MatrixHook';
import AssessmentFlow from '../components/AssessmentFlow';
import { logger } from '../lib/logger';

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

/**
 * Cerebral iQ Landing Portal [Anonymous Entry Point]
 * V4.2 Protocol: Gated Results enabled (Account created POST-test)
 */
export default function LandingPage() {
  const [showAssessment, setShowAssessment] = React.useState(false);
  const [results, setResults] = React.useState<{ iq: number; classification: string; subtests: Record<string, number> } | null>(null);

  if (results) {
    return (
      <div className={`${inter.className} ${orbitron.variable} min-h-screen bg-background text-white p-6 md:p-12 flex flex-col items-center justify-center space-y-12`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 rounded-[3rem] w-full max-w-2xl text-center space-y-8 border-primary/30"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-3xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="text-primary w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-sm font-bold text-primary tracking-[0.3em] uppercase">Assessment Complete</h1>
            <h2 className="text-5xl font-bold font-orbitron tracking-tight">Full Scale IQ: <span className="text-primary">{results.iq}</span></h2>
            <p className="text-slate-400 font-medium">Classification: <span className="text-white">{results.classification}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-8">
            {Object.entries(results.subtests).map(([domain, score]) => (
              <div key={domain} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{domain}</span>
                <span className="text-xl font-bold font-orbitron">{score}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              setResults(null);
              setShowAssessment(false);
            }}
            className="w-full bg-white text-background py-5 rounded-2xl font-bold text-lg hover:bg-primary hover:text-white transition-all shadow-2xl shadow-primary/20"
          >
            Finish & Reset Session
          </button>
        </motion.div>
      </div>
    );
  }

  if (showAssessment) {
    return (
      <div className={`${inter.className} ${orbitron.variable} min-h-screen bg-background text-white selection:bg-primary/30 flex items-center justify-center`}>
        <AssessmentFlow 
          onComplete={(scoreResults) => {
            logger.log('Assessment Complete:', scoreResults);
            setResults(scoreResults);
          }}
          onCancel={() => setShowAssessment(false)}
        />
      </div>
    );
  }
  return (
    <div className={`${inter.className} ${orbitron.variable} min-h-screen bg-background text-white selection:bg-primary/30`}>
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">CiQ</span>
            </div>
            <span className={`text-xl font-bold tracking-tighter ${orbitron.className}`}>CEREBRAL iQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#science" className="hover:text-primary transition-colors">Science</a>
            <a href="#methodology" className="hover:text-primary transition-colors">Methodology</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Enterprise</a>
          </div>
          <button 
            onClick={() => setShowAssessment(true)}
            className="bg-white text-background px-5 py-2 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main>
        {/* Section 1: Hero (The Hook) */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="hero-glow top-[-100px] left-[-200px]" />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-primary tracking-widest uppercase">
                <Zap className="w-3 h-3 fill-primary" />
                Adaptive Engine v4.2 Enabled
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                Unlock Your <br />
                <span className="gradient-text">Cognitive Edge.</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-[540px] leading-relaxed">
                Measure Gf, Gwm, and Gc using CHC-standardized clinical testing. Powered by 2026 adaptive IRT algorithms for unparalleled precision.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={() => setShowAssessment(true)}
                  className="bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 shadow-2xl shadow-primary/20 transition-all group"
                >
                  Start Assessment
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-background flex items-center justify-center text-[10px] text-slate-400">
                        {i}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="text-white font-bold">5k+</span> Professionals benchmarked
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <MatrixHook onSolve={() => logger.log('Solved!')} />
            </div>
          </div>
        </section>

        {/* Section 2: The Logic (CHC Table) */}
        <section id="science" className="py-24 px-6 border-t border-white/5 bg-white/1">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold">Rigorous Foundations</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Our engine is built on the Cattell-Horn-Carroll (CHC) theory—the most widely accepted psychometric model of human intelligence today.
              </p>
            </div>

            <div className="glass-panel overflow-hidden rounded-3xl border border-white/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-xs text-primary font-bold tracking-widest uppercase">
                    <th className="px-8 py-6">Cognitive Domain</th>
                    <th className="px-8 py-6">Manifestation</th>
                    <th className="px-8 py-6">Impact Score</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  <tr>
                    <td className="px-8 py-6 font-semibold">Fluid Reasoning (Gf)</td>
                    <td className="px-8 py-6 text-slate-400">Novel problem solving & pattern induction</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-white">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        High Leverage
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-8 py-6 font-semibold">Working Memory (Gwm)</td>
                    <td className="px-8 py-6 text-slate-400">Real-time data manipulation & retention</td>
                    <td className="px-8 py-6 text-slate-400">Critical Path</td>
                  </tr>
                  <tr>
                    <td className="px-8 py-6 font-semibold">Crystallized Knowledge (Gc)</td>
                    <td className="px-8 py-6 text-slate-400">Depth and breadth of acquired wisdom</td>
                    <td className="px-8 py-6 text-slate-400">Expertise Proxy</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: Trust Points */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="p-8 space-y-4 bg-white/5 rounded-3xl border border-white/5">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Shield className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Clinical Standards</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Standardized on Deviation IQ (M=100, SD=15) benchmarks, ensuring equivalence with WAIS-IV and SB-V norms.
              </p>
            </div>
            <div className="p-8 space-y-4 bg-white/5 rounded-3xl border border-white/5">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                <Target className="text-accent w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Zero Bias Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Active DIF (Differential Item Functioning) monitoring ensures no linguistic or socioeconomic bias in scoring.
              </p>
            </div>
            <div className="p-8 space-y-4 bg-white/5 rounded-3xl border border-white/10 border-dashed">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <Zap className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Adaptive Mastery</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                IRT-powered logic reduces item fatigue while locking in 95% confidence intervals within 20 minutes.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 bg-background text-center text-slate-500 text-xs">
        © 2026 Cerebral iQ Clinical Intelligence. Validated for Professional & HR Cognitive Screening.
      </footer>
    </div>
  );
}
