import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssessmentModule from './components/AssessmentModule';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import MatrixMiniItem from './components/MatrixMiniItem';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('hero');
  const [results, setResults] = useState(null);

  const handleAssessmentComplete = (scores) => {
    setResults(scores);
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setView('hero');
    setResults(null);
  };

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div 
            key="auth-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}
          >
            <Auth onLogin={setUser} />
          </motion.div>
        ) : (
          <motion.div 
            key="content-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: '100%' }}
          >
            <nav style={{ padding: '1.55rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(5, 5, 10, 0.8)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
              <h2 className="gradient-text font-orbitron" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setView('hero')}>
                Cerebral iQ
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ color: 'var(--color-primary)', fontSize: '0.9rem', opacity: 0.8 }}>{user?.email || 'Unauthorized'}</span>
                <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            </nav>

            <main style={{ minHeight: 'calc(100vh - 100px)', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AnimatePresence mode="wait">
                {view === 'hero' && (
                  <motion.div 
                    key="hero"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="landing-page"
                    style={{ display: 'flex', flexDirection: 'column', gap: '8rem', paddingBottom: '8rem', width: '100%', maxWidth: '1200px' }}
                  >
                    {/* Section 1: Hero (The Hook) */}
                    <section style={{ textAlign: 'left', minHeight: '85vh', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
                      <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
                          <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-primary)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
                            ✓ SCIENTIFICALLY VALIDATED
                          </span>
                          <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-accent)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
                            ◎ EXPERT REVIEWED
                          </span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: '1.05', marginBottom: '1.5rem' }} className="gradient-text">
                          Unlock Your Cognitive Edge.
                        </h1>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'white', opacity: 0.9 }}>
                          Science-Backed IQ Testing for 2026.
                        </h3>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 0 3rem', lineHeight: '1.6' }}>
                          Go beyond simple puzzles. Discover your profile across <span style={{ color: 'white' }}>7 distinct cognitive domains</span> using clinical-grade CHC standards. Accurate, adaptive, and actionable.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                          <button className="btn-primary" style={{ padding: '1.2rem 2.5rem' }} onClick={() => setView('assessment')}>Launch Assessment</button>
                          <button className="btn-outline" style={{ padding: '1.2rem 2.5rem' }} onClick={() => setView('dashboard')}>View Demo</button>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                         <MatrixMiniItem onSolve={() => console.log('Solved!')} />
                      </motion.div>
                    </section>

                    {/* Section 2: Performance Value Proposition */}
                    <section style={{ textAlign: 'center' }}>
                       <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px' }}>DATA THAT PREDICTS SUCCESS</span>
                       <h2 style={{ fontSize: '3rem', margin: '1.5rem 0 4rem' }}>Quantifying Peak Performance</h2>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'left', borderTop: '4px solid var(--color-primary)' }}>
                             <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>14x</div>
                             <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'white' }}>The Predictive Edge</h4>
                             <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Standard interviews are notoriously unreliable. Validated psychometric assessments are <strong>over 14 times better</strong> at predicting future job performance.
                             </p>
                          </div>
                          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'left', borderTop: '4px solid var(--color-accent)' }}>
                             <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>+43%</div>
                             <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'white' }}>Return on Talent</h4>
                             <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                High-performing individuals with superior fluid reasoning ($G_f$) produce <strong>43% more revenue</strong> on average than their peers.
                             </p>
                          </div>
                          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'left', borderTop: '4px solid white' }}>
                             <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>3.2x</div>
                             <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'white' }}>Cost of Guessing</h4>
                             <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Hiring a poor performer costs up to <strong>3.2 times their annual salary</strong> in lost productivity and turnover. Science eliminates the guesswork.
                             </p>
                          </div>
                       </div>
                    </section>

                    {/* Section 3: The Science */}
                    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center', textAlign: 'left' }}>
                      <div className="glass-panel" style={{ padding: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Adaptive Precision</h2>
                        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
                          Our <strong>IRT-powered engine</strong> selects items in real-time based on your specific performance. This reduces total assessment time by <strong>15%</strong> while maintaining clinical-grade reliability ($\alpha \ge 0.90$).
                        </p>
                        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
                           ◎ Standardized against global normative benchmarks for 2026.
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Comprehensive Reporting</h3>
                        <p style={{ color: 'var(--color-text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
                          Receive a multi-dimensional breakdown of your <strong>Fluid Reasoning ($G_f$)</strong>, <strong>Working Memory ($G_{wm}$)</strong>, and <strong>Crystallized Knowledge ($G_c$)</strong>.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'white', opacity: 0.8, fontSize: '0.95rem' }}>
                           <li style={{ marginBottom: '0.8rem' }}>✓ Zero hidden paywalls.</li>
                           <li style={{ marginBottom: '0.8rem' }}>✓ Full PDF Clinical Export.</li>
                           <li style={{ marginBottom: '0.8rem' }}>✓ Longitudinal tracking included.</li>
                        </ul>
                      </div>
                    </section>

                    <section style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                      <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Ready to Benchmark Your Potential?</h2>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-primary" style={{ padding: '1.5rem 4rem', fontSize: '1.1rem' }} onClick={() => setView('assessment')}>Start Assessment</button>
                      </div>
                    </section>
                  </motion.div>
                )}

                {view === 'assessment' && (
                  <motion.div
                    key="assessment"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '100%', maxWidth: '800px' }}
                  >
                    <AssessmentModule 
                      user={user}
                      onComplete={handleAssessmentComplete} 
                      onCancel={() => setView('hero')} 
                    />
                  </motion.div>
                )}

                {view === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '100%' }}
                  >
                    <Dashboard user={user} scores={results || { gf: 6, gc: 14, gc_info: 4, gwm: 11, gfq: 3, gs: 42, gv: 11 }} />
                    <div style={{ textAlign: 'center' }}>
                      <button style={{ marginTop: '2rem' }} className="btn-outline" onClick={() => setView('hero')}>Back to Home</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
