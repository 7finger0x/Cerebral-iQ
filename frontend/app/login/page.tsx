'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Shield, User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-100px] left-[-200px] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50" />
      <div className="absolute bottom-[-100px] right-[-200px] w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full opacity-50" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-10 md:p-14 rounded-[2.5rem] w-full max-w-lg relative border border-white/10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <Brain className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold font-orbitron tracking-tight mb-2">Internal Access</h1>
          <p className="text-slate-400 text-sm">Cerebral iQ Research & Assessment Node</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-slate-500 font-bold uppercase ml-2 tracking-widest">Email Identity</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] text-slate-500 font-bold uppercase ml-2 tracking-widest">Secure Credentials</label>
             <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-primary/50 focus:bg-white/10 outline-none transition-all"
                  required
                />
             </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl flex items-start gap-4"
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>Verification Failed: {error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-light text-white py-4 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Authorize Entry
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
            Access Restricted to Standardized Research Protocol 2026. <br />
            Unauthorized attempts are logged via CIQ-SEC-VIBE.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
