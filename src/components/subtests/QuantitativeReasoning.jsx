import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AdaptiveSession } from '../../engine/CerebralEngine';
import { fetchItemsForDomain } from '../../data/api';

export default function QuantitativeReasoning({ onFinish }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemsForDomain('gfq_quantitative_reasoning').then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);
  
  // Use Adaptive Session
  const session = useMemo(() => {
    if (items.length > 0) return new AdaptiveSession(items, 0, 3, 2);
    return null;
  }, [items]);
  
  const [currentItem, setCurrentItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (session) setCurrentItem(session.getCurrentItem());
  }, [session]);

  const handleAnswer = (selectedOption) => {
    let isCorrect = selectedOption === currentItem.answer;
    const nextIndex = session.processAnswer(isCorrect);
    if (nextIndex === null || session.isComplete) {
      onFinish(session.getScore());
    } else {
      setCurrentIndex(nextIndex);
      setCurrentItem(session.getCurrentItem());
    }
  };

  if (loading || !currentItem) return <div style={{textAlign: 'center', padding: '2rem'}}>Initializing Gfq...</div>;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', textTransform: 'uppercase' }}>Quantitative Reasoning (Gfq)</span>
        <h2 style={{ fontSize: '1.8rem', marginTop: '1rem' }}>{currentItem.stem}</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {currentItem.options.map((opt, idx) => (
          <button key={idx} className="btn-outline" style={{ padding: '1.2rem', borderRadius: '12px' }} onClick={() => handleAnswer(opt)}>
            {opt}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
