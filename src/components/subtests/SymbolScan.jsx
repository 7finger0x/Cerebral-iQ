import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchItemsForDomain } from '../../data/api';

export default function SymbolScan({ onFinish }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemsForDomain('gs_speed_coding').then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [rawScore, setRawScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds total form time

  useEffect(() => {
    if (loading) return; // Don't start timer until loaded
    
    if (timeLeft <= 0) {
      onFinish(rawScore);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, onFinish, rawScore, loading]);

  if (loading || items.length === 0) return <div style={{textAlign: 'center', padding: '2rem'}}>Loading Data from Backend...</div>;

  const currentItem = items[currentIndex];
  // If we run out of items before time, loop or end early (in MVP we cycle them)
  const displayItem = currentItem || items[0];



  const handleAnswer = (choice) => {
    let newScore = rawScore;
    
    if (choice === displayItem.answer) {
      newScore += 1; // 1 point for correct
    } else {
      newScore = Math.max(0, newScore - 0.5); // penalty for errors
    }

    setRawScore(newScore);

    // Go to next item forever until time runs out
    // If we exceed length, loop for MVP purposes
    let nextIdx = currentIndex + 1;
    if (nextIdx >= items.length) {
      nextIdx = 0; // loop
    }
    setCurrentIndex(nextIdx);
  };

  return (
    <motion.div 
      key={`scan-${currentIndex}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="gradient-text font-orbitron" style={{ margin: 0 }}>Processing Speed</h3>
        <span style={{ fontSize: '1.5rem', fontFamily: 'monospace', color: timeLeft <= 10 ? 'red' : 'white' }}>
          00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
        </span>
      </div>
      
      <p style={{ color: 'var(--color-text-muted)' }}>
        Do any of the target symbols appear in the row?
      </p>

      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ borderRight: '1px solid var(--color-border)', paddingRight: '2rem' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>TARGETS</span>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '2.5rem' }}>
              {displayItem.targets.map((sym, i) => <span key={i}>{sym}</span>)}
            </div>
          </div>
          
          <div style={{ paddingLeft: '2rem' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>SEARCH ROW</span>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '2.5rem' }}>
               {displayItem.row.map((sym, i) => <span key={i}>{sym}</span>)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button 
            className="btn-outline"
            style={{ padding: '1.5rem 3rem', fontSize: '1.2rem', borderRadius: '12px', width: '150px' }}
            onClick={() => handleAnswer('YES')}
          >
            YES
          </button>
          <button 
            className="btn-outline"
            style={{ padding: '1.5rem 3rem', fontSize: '1.2rem', borderRadius: '12px', width: '150px' }}
            onClick={() => handleAnswer('NO')}
          >
            NO
          </button>
        </div>
      </div>
    </motion.div>
  );
}
