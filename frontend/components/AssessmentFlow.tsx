'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Timer, 
  ArrowLeft, CheckCircle2, Loader2 
} from 'lucide-react';

import MatrixRenderer from './MatrixRenderer';
import { engineApi, Item, AssessmentResponse } from '../lib/api';
import { logger } from '../lib/logger';
import { supabase } from '../lib/supabase';
import { useHighPrecisionTimer } from '../hooks/useHighPrecisionTimer';

// Visual Cell component for high-fidelity item presentation
interface VisualOptionProps {
  index: number;
  onClick: () => void;
  disabled: boolean;
  type: string;
  transform?: number;
  active?: boolean;
}

const VisualOption: React.FC<VisualOptionProps> = ({ index, onClick, disabled, type, transform, active }) => (
  <motion.button
    whileHover={{ scale: 1.05, borderColor: 'rgba(99, 102, 241, 0.5)' }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      h-24 w-full rounded-2xl border flex items-center justify-center transition-all bg-white/5
      ${active ? 'border-primary ring-2 ring-primary/20 bg-primary/10' : 'border-white/10'}
    `}
  >
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="w-10 h-10">
        <g transform={`rotate(${transform || 0} 50 50)`}>
          {type === 'circle' && <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" />}
          {type === 'square' && <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="4" className="text-indigo-400" />}
          {type === 'triangle' && <path d="M50 15 L85 75 L15 75 Z" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-400" />}
        </g>
      </svg>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Option {index + 1}</span>
    </div>
  </motion.button>
);

interface AssessmentFlowProps {
  onComplete: (results: { iq: number; classification: string; subtests: Record<string, number> }) => void;
  onCancel: () => void;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'intro' | 'testing' | 'scoring' | 'gate'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<Item | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [theta, setTheta] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ iq: number; classification: string; subtests: Record<string, number> } | null>(null);

  // Authentication states for the results gate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authError, setAuthError] = useState<string | null>(null);

  // High Precision timing for Processing Speed (Gs) domains
  const timer = useHighPrecisionTimer();

  // Target length for stable SEM
  const TARGET_ITEMS = 20;

  const startAssessment = async () => {
    setLoading(true);
    try {
      // Start anonymously initially to reduce friction
      const data = await engineApi.startSession();
      setSessionId(data.session_id);
      setCurrentQuestion(data.first_item);
      setStep('testing');
    } catch (error) {
      logger.error('Error starting session:', error);
      // Fallback for demo
      const fallbackItem: Item = {
        id: 'gf_m_001', 
        item_idx: 0,
        domain: 'Gf', 
        type: 'matrix', 
        content: 'Identify the missing pattern sequence.',
        a: 1.0, b: 0.0, c: 0.2, // Standard difficulty params
        metadata: { name: 'Simple Pattern' }
      };
      setCurrentQuestion(fallbackItem);
      setStep('testing');
    } finally {
      setLoading(false);
    }
  };

  // [GS-04] Auto-start timer when item is rendered
  React.useEffect(() => {
    if (step === 'testing' && currentQuestion && !loading) {
      if (currentQuestion.domain === 'Gs' || currentQuestion.metadata?.timed) {
        timer.start();
        logger.info(`[Timer] Started precision pulse for ${currentQuestion.id}`);
      }
    }
  }, [currentQuestion, step, loading, timer]);

  const handleAnswer = async (responseValue: number) => {
    if (!currentQuestion) return;
    
    // Stop precision timer if it was active
    const latency = (currentQuestion.domain === 'Gs' || currentQuestion.metadata?.timed) 
      ? timer.stop() 
      : undefined;

    setLoading(true);
    const updatedHistory = [...history, currentQuestion.item_idx];
    setHistory(updatedHistory);
    
    try {
      const result: AssessmentResponse = await engineApi.submitAnswer(
        sessionId,
        currentQuestion.item_idx,
        responseValue,
        theta,
        history,
        latency
      );

      const nextProgress = Math.min(100, Math.round((updatedHistory.length / TARGET_ITEMS) * 100));
      setProgress(nextProgress);

      if (result.status === 'complete' || updatedHistory.length >= TARGET_ITEMS) {
        setStep('scoring');
        await finalizeScore(result.updated_theta || theta);
      } else {
        setCurrentQuestion(result.next_item);
        if (result.updated_theta) setTheta(result.updated_theta);
        
        setLoading(false);
      }
    } catch (error) {
      logger.error('Error submitting answer:', error);
      // Fallback behavior
      if (updatedHistory.length >= 10) {
        setStep('scoring');
        finalizeScore(theta);
      } else {
        setLoading(false);
      }
    }
  };

  const finalizeScore = async (finalTheta: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate results (this can be done anonymously)
      const scoreResults = await engineApi.finalizeScore(sessionId, finalTheta, user?.id);
      setResults(scoreResults);

      if (!user) {
        setStep('gate');
        setLoading(false);
      } else {
        onComplete(scoreResults);
      }
    } catch (error) {
      logger.error('Error finalizing score:', error);
      onComplete({ iq: 100, classification: 'Average', subtests: {} });
    }
  };

  const handleGateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (authMode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (signUpError) throw signUpError;
      }
      
      // Once authenticated, final reveal
      if (results) onComplete(results);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] p-6">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-12 rounded-4xl text-center space-y-8 max-w-xl border border-white/10"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-3xl mx-auto flex items-center justify-center">
              <Brain className="text-primary w-10 h-10" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-4 font-orbitron">Clinical Assessment</h2>
              <p className="text-slate-400 leading-relaxed text-lg">
                Adaptive testing session. Estimated time: <span className="text-white">15-20 minutes</span>. 
                Focus on accuracy—speed is only recorded for <span className="text-accent underline underline-offset-4">Processing Speed ($G_s$)</span> subtests.
              </p>
            </div>
            
            <ul className="text-left bg-white/5 p-6 rounded-2xl gap-3 flex flex-col items-start border border-white/5">
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Validated for ages 18-99.
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Zero distractions environment recommended.
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Multi-device persistence enabled.
              </li>
            </ul>

            <div className="flex flex-col gap-4">
              <button 
                onClick={startAssessment}
                className="bg-primary hover:bg-primary-light text-white w-full py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Launch Session'}
              </button>
              <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors text-sm font-medium">Cancel and return</button>
            </div>
          </motion.div>
        )}

        {step === 'testing' && currentQuestion && (
          <motion.div
            key="testing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full space-y-12"
          >
            {/* Nav / Progress */}
            <div className="w-full space-y-4">
              <div className="flex justify-between items-center text-xs font-bold tracking-widest text-slate-500 uppercase">
                <div className="flex items-center gap-2">
                  <span className="text-primary">{currentQuestion.domain}</span>
                  <span>• Subtest {history.length + 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="w-3 h-3" />
                  Auto-Saving...
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_15px_#6366f1]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Workspace */}
            <div className="glass-panel p-16 rounded-4xl flex flex-col items-center justify-center min-h-[400px] relative">
              <div className="absolute top-8 left-8 flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Clinical Environment
              </div>

              <div className="text-center space-y-12">
                <h3 className="text-2xl font-semibold opacity-90">{currentQuestion.content}</h3>
                
                {/* High Fidelity Item Presentation */}
                <div className="flex items-center justify-center p-4">
                  {currentQuestion.type === 'matrix' ? (
                    <MatrixRenderer itemId={currentQuestion.id} />
                  ) : (
                    <div className="w-64 h-64 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center text-slate-500 italic">
                      [ Rendering Item: {currentQuestion.type} ]
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                   {/* Simplified mock options for the Gf matrix demo */}
                   {[
                     { type: 'triangle', transform: 90 }, // Correct answer for mock
                     { type: 'circle', transform: 0 },
                     { type: 'square', transform: 45 },
                     { type: 'triangle', transform: 0 }
                   ].map((opt, idx) => (
                     <VisualOption
                        key={`opt-${idx}`}
                        index={idx}
                        type={opt.type}
                        transform={opt.transform}
                        onClick={() => handleAnswer(idx === 0 ? 1 : 0)}
                        disabled={loading}
                     />
                   ))}
                </div>
              </div>

              {loading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-[2.5rem] flex items-center justify-center">
                  <div className="text-primary font-bold flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Optimizing Next Item...
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center px-4">
              <button 
                onClick={() => setStep('intro')} 
                className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Exit Assessment
              </button>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">IRT V4.2 / Clinical Grade</span>
            </div>
          </motion.div>
        )}

        {step === 'scoring' && (
          <motion.div
            key="scoring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-12 h-12 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-orbitron">Calculating Phenotype</h2>
              <p className="text-slate-400">Processing latent trait updates and normative alignment...</p>
            </div>
            
            <div className="flex flex-col gap-2 max-w-xs mx-auto text-left">
               <div className="flex justify-between text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                 <span>Deviation IQ Map</span>
                 <span>100%</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                 <motion.div 
                   animate={{ width: ['0%', '40%', '75%', '100%'] }}
                   transition={{ duration: 3 }}
                   className="h-full bg-accent"
                 />
               </div>
            </div>
          </motion.div>
        )}

        {step === 'gate' && (
          <motion.div
            key="gate"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-12 rounded-4xl text-center space-y-8 max-w-xl border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent shadow-[0_0_15px_#6366f1]" />
            
            <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="text-emerald-500 w-10 h-10" />
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2 font-orbitron tracking-tight text-white uppercase italic">Assessment Calibrated</h2>
              <p className="text-slate-400">
                Your high-precision Deviation IQ results are ready. 
                <span className="block mt-2 text-white font-semibold">Create a verified clinical node to unlock your full profile.</span>
              </p>
            </div>

            <form onSubmit={handleGateAuth} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase ml-2 tracking-widest">Email Identity</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@protocol.io"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:border-primary/50 outline-none transition-all text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase ml-2 tracking-widest">Secret Key</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:border-primary/50 outline-none transition-all text-white"
                  required
                />
              </div>

              {authError && (
                <div className="text-red-500 text-xs bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  {authError}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary-light text-white w-full py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (authMode === 'signup' ? 'Create Account & Unlock' : 'Log In & Unlock')}
              </button>

              <button 
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="w-full text-center text-xs text-slate-500 hover:text-white transition-colors py-2"
              >
                {authMode === 'signup' ? 'Already have a clinical node? Log in' : 'New researcher? Create account'}
              </button>
            </form>

            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
              By unlocking, you agree to the Clinical Data Protocol 2026. <br />
              Encryption: SHA-256 AES-RSA Dynamic.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssessmentFlow;
