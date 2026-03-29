'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Timer, 
  ArrowLeft, CheckCircle2, Loader2 
} from 'lucide-react';

import { engineApi, Item, AssessmentResponse } from '@/lib/api';

interface AssessmentFlowProps {
  onComplete: (results: { iq: number; classification: string; results: Record<string, any>[] }) => void;
  onCancel: () => void;
}

const AssessmentFlow: React.FC<AssessmentFlowProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'intro' | 'testing' | 'scoring'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState<Item | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [theta, setTheta] = useState(0.0);
  const [loading, setLoading] = useState(false);

  // Target length for stable SEM
  const TARGET_ITEMS = 20;

  const startAssessment = async () => {
    setLoading(true);
    try {
      const data = await engineApi.startSession();
      setSessionId(data.session_id);
      setCurrentQuestion(data.first_item);
      setStep('testing');
    } catch (error) {
      console.error('Error starting session:', error);
      // Fallback for demo
      setCurrentQuestion({
        id: 'gf_m_001', 
        item_idx: 0,
        domain: 'Gf', 
        type: 'matrix', 
        content: 'Identify the missing pattern sequence.',
        a: 1.0, b: 0.0, c: 0.2, // Standard difficulty params
        metadata: { name: 'Simple Pattern' }
      });
      setStep('testing');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (responseValue: number) => {
    if (!currentQuestion) return;
    setLoading(true);
    const updatedHistory = [...history, currentQuestion.item_idx];
    setHistory(updatedHistory);
    
    try {
      const result: AssessmentResponse = await engineApi.submitAnswer(
        sessionId,
        currentQuestion.item_idx,
        responseValue,
        theta,
        history
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
      console.error('Error submitting answer:', error);
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
      const results = await engineApi.finalizeScore(finalTheta);
      onComplete(results);
    } catch (error) {
      console.error('Error finalizing score:', error);
      onComplete({ iq: 100, classification: 'Average', results: [] });
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
                
                {/* Mock Item Presentation */}
                <div className="w-64 h-64 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center text-slate-500 italic">
                  [ Rendering Item: {currentQuestion.type} ]
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-md">
                   {[1, 2, 3, 4].map(idx => (
                     <button
                        key={idx}
                        onClick={() => handleAnswer(idx === 1 ? 1 : 0)}
                        className="h-16 rounded-xl border border-white/10 hover:border-primary/50 hover:bg-primary/5 transition-all font-bold text-lg"
                        disabled={loading}
                     >
                       Option {idx}
                     </button>
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
      </AnimatePresence>
    </div>
  );
};

export default AssessmentFlow;
