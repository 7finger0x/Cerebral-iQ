import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdaptiveSession } from '../../engine/CerebralEngine';
import { fetchItemsForDomain } from '../../data/api';

export default function NumberSequence({ onFinish }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemsForDomain('gwm_number_sequence').then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);
  
  // Use Adaptive Session logic (2 fails ceiling, 2 for basal for MVP)
  const session = useMemo(() => {
    if (items.length > 0) return new AdaptiveSession(items, 0, 2, 2);
    return null;
  }, [items]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [inputValue, setInputValue] = useState("");
  
  const [isPresenting, setIsPresenting] = useState(true);
  const [presentingIndex, setPresentingIndex] = useState(0);

  useEffect(() => {
    if (session) setCurrentItem(session.getCurrentItem());
  }, [session]);

  useEffect(() => {
    // Reset state for new item presentation
    setIsPresenting(true);
    setPresentingIndex(0);
    setInputValue("");
    
    // Timer to show sequence elements one by one
    let interval;
    if (isPresenting && currentItem) {
      interval = setInterval(() => {
        setPresentingIndex(prev => {
          if (prev + 1 >= currentItem.sequence.length) {
            clearInterval(interval);
            setTimeout(() => setIsPresenting(false), 800);
            return prev + 1;
          }
          return prev + 1;
        });
      }, 1000); // 1 second per element, adjust as needed
    }

    return () => clearInterval(interval);
  }, [currentIndex, currentItem]);

  const handleAnswer = (e) => {
    e.preventDefault();
    
    // Parse user input into array of digits/elements
    const userSequence = inputValue.replace(/\D/g, '').split('').map(Number);
    const expectedSequence = currentItem.answer ? currentItem.answer : currentItem.sequence;

    // Check if lengths match and every element matches
    const isCorrect = userSequence.length === expectedSequence.length &&
                      userSequence.every((val, i) => val === expectedSequence[i]);
    
    const nextIndex = session.processAnswer(isCorrect);

    if (nextIndex === null || session.isComplete) {
      onFinish(session.getScore());
    } else {
      setCurrentIndex(nextIndex);
      setCurrentItem(session.getCurrentItem());
    }
  };

  if (loading || !currentItem) return <div style={{textAlign: 'center', padding: '2rem'}}>Loading Data from Backend...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'center' }}>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
          Item {currentIndex + 1} of {items.length} 
          <span style={{ marginLeft: '1rem', color: 'var(--color-text-muted)' }}>
            ({currentItem.type.toUpperCase()})
          </span>
        </span>
        <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
          {currentItem.type === 'forward' && "Repeat the sequence in the exact order."}
          {currentItem.type === 'backward' && "Repeat the sequence in reverse order."}
          {currentItem.type === 'sequencing' && "Repeat the numbers in ascending order."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isPresenting ? (
          <motion.div
            key="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {presentingIndex < currentItem.sequence.length ? (
              <h1 className="gradient-text font-orbitron" style={{ fontSize: '4rem', letterSpacing: '0.2em' }}>
                {currentItem.sequence[presentingIndex]}
              </h1>
            ) : (
              <div /> // Brief blank before input phase
            )}
          </motion.div>
        ) : (
          <motion.div
            key="input-phase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Answer:</h2>
            <form onSubmit={handleAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter numbers..."
                className="input-field glass-panel"
                style={{ padding: '1rem', fontSize: '1.5rem', textAlign: 'center', borderRadius: '12px', border: '1px solid var(--color-border)', width: '100%', outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', letterSpacing: '0.2rem' }}
                autoFocus
              />
              <button 
                type="submit"
                className="btn-primary"
                style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px' }}
                disabled={!inputValue.trim()}
              >
                Submit
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
