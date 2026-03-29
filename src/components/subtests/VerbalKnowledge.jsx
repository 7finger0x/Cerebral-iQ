import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdaptiveSession } from '../../engine/CerebralEngine';
import { fetchItemsForDomain } from '../../data/api';

export default function VerbalKnowledge({ onFinish }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemsForDomain('gc_verbal_knowledge').then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);
  
  // Initialize Adaptive Session
  const session = useMemo(() => {
    if (items.length > 0) return new AdaptiveSession(items, 0, 3, 2);
    return null;
  }, [items]);

  const [currentItem, setCurrentItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (session) setCurrentItem(session.getCurrentItem());
  }, [session]);

  const handleAnswer = (e) => {
    e.preventDefault();
    
    // Evaluate correctness
    const isCorrect = currentItem.expected.some(exp => 
      inputValue.toLowerCase().includes(exp.toLowerCase())
    );
    
    const nextIndex = session.processAnswer(isCorrect);
    
    setInputValue(""); // Reset input

    if (nextIndex === null || session.isComplete) {
      onFinish(session.getScore());
    } else {
      setCurrentIndex(nextIndex);
      setCurrentItem(session.getCurrentItem());
    }
  };

  if (loading || !currentItem) return <div style={{textAlign: 'center', padding: '2rem'}}>Loading Data from Backend...</div>;


  return (
    <motion.div 
      key={currentItem.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
          Item {currentIndex + 1} of {items.length}
        </span>
        <h2 style={{ fontSize: '2rem', marginTop: '1rem' }}>
          {currentItem.stem ? currentItem.stem : `Define the word: "${currentItem.word}"`}
        </h2>
      </div>

      <form onSubmit={handleAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter your answer..."
          className="input-field glass-panel"
          style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px', border: '1px solid var(--color-border)', width: '100%', outline: 'none', background: 'rgba(255,255,255,0.05)', color: 'white' }}
          autoFocus
        />
        <button 
          type="submit"
          className="btn-primary"
          style={{ padding: '1rem', fontSize: '1.2rem', borderRadius: '12px' }}
          disabled={!inputValue.trim()}
        >
          Submit Answer
        </button>
      </form>
    </motion.div>
  );
}
