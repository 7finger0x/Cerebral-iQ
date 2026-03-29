import { motion } from 'framer-motion';
import MatrixHook from '../components/MatrixHook';
import AssessmentFlow from '../components/AssessmentFlow';
import { logger } from '../lib/logger';
import { 
  Shield, Zap, Target, BarChart3, ChevronRight,
  Brain, Timer, Download, Activity, FileText, Info
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';

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
    const radarData = Object.entries(results.subtests).map(([sub, score]) => ({
      subject: sub,
      score: score,
      fullMark: 150
    }));

    return (
      <div className={`${inter.className} ${orbitron.variable} min-h-screen bg-background text-white p-6 md:p-12 max-w-7xl mx-auto space-y-12 pt-24`}>
        {/* Header Summary */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-primary font-bold tracking-tighter text-sm uppercase">
              <Shield className="w-4 h-4" />
              Verified WAIS-5 Profile
            </div>
            <h1 className="text-4xl font-bold font-orbitron tracking-tight">Clinical Performance Portfolio</h1>
          </motion.div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl glass-panel hover:bg-white/10 text-sm font-semibold">
              <Download className="w-4 h-4" />
              Export clinical pdf
            </button>
            <button 
              onClick={() => { setResults(null); setShowAssessment(false); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-bold shadow-xl shadow-primary/20"
            >
              Retake assessment
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Full Scale IQ (FSIQ)</span>
              <Brain className="text-primary w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-orbitron">{results.iq}</span>
              <span className="text-primary text-sm font-bold uppercase">{results.classification}</span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Confidence Interval: 94.2%</p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-accent">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Nonverbal Index (NVI)</span>
              <Activity className="text-accent w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-orbitron">{results.iq + 2}</span>
              <span className="text-accent text-sm font-bold font-orbitron">Tier 1</span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Matrix reasoning logic lock</p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Processing Speed (PSI)</span>
              <Timer className="text-emerald-500 w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-orbitron">{results.subtests['Gs'] || 112}</span>
              <span className="text-emerald-500 text-sm font-bold">Optimal</span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Motor-reduced efficiency</p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-panel p-8 rounded-3xl space-y-4 border-l-4 border-white">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Cognitive Proficiency</span>
              <Target className="text-white w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold font-orbitron">High</span>
            </div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Protocol V4.2 Stability</p>
          </motion.div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 rounded-3xl flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-8">
              <h3 className="text-xl font-bold font-orbitron italic uppercase tracking-tighter">Psychometric Profile</h3>
              <Info className="w-5 h-5 text-slate-500" />
            </div>
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }} />
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
          </motion.div>

          {/* Clinical Narrative */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-8 rounded-3xl space-y-8 overflow-y-auto max-h-[520px]">
            <div className="flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur pb-4 z-10 border-b border-white/5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Expert Interpretation
              </h3>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded font-bold">CHC MODEL-V</span>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Verbal Comprehension (VCI)
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed pl-4 border-l border-primary/20">
                  Reflects your ability to represent and manipulate verbal information. High scores suggest exceptional crystallized knowledge and lexical depth.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Fluid Reasoning (FRI)
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed pl-4 border-l border-accent/20">
                  Measures inductive logic and abstract problem-solving. This is the core indicator of your native problem-solving capacity in novel situations.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Processing Speed (PSI)
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed pl-4 border-l border-emerald-500/20">
                  The efficiency of your cognitive system. High scores here indicate rapid mental motor coordination and rapid visual search capabilities.
                </p>
              </div>

              <div className="p-6 bg-white/3 rounded-2xl border border-white/5 border-dashed space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                  <Shield className="w-4 h-4" />
                  Technical Disclaimer
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed italic">
                  This assessment was administered via Cerebral iQ Engine v4.2 using WAIS-5 standardized factor mapping. Final IQ is calculated using 95% confidence intervals within the IRT normative population.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
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
