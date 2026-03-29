import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Phase 4 Mock Auth: Simulated validation
    await new Promise(res => setTimeout(res, 800));
    setLoading(false);
    
    // Notify App of authenticated session
    onLogin({ email, id: 'mock-user-123' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="glass-panel"
      style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', textAlign: 'center' }}
    >
      <h2 className="gradient-text font-orbitron" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        Cerebral iQ
      </h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        {isLogin ? 'Welcome back. Sign in to continue.' : 'Create your account to start evaluating.'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="EMAIL_IDENTITY"
          required
          className="input-field"
          style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
        />
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="SECURE_CREDENTIALS"
          required
          className="input-field"
          style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
        />
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading || !email || !password}
          style={{ padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}
        >
          {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <span 
          style={{ color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </span>
      </div>

      <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
        <button 
          className="btn-outline" 
          onClick={() => onLogin({ email: 'guest', id: 'guest-000' })}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', fontSize: '0.9rem' }}
        >
          Continue as Guest
        </button>
      </div>
    </motion.div>
  );
}
