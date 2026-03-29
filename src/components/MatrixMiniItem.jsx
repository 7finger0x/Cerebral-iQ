import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MatrixMiniItem({ onSolve }) {
  const [solved, setSolved] = useState(false);
  
  // A simple 2x2 matrix reasoning pattern:
  // Top-Left: Circle
  // Top-Right: Square
  // Bottom-Left: Circle (filled)
  // Bottom-Right: ? (Square filled)
  
  const options = [
    { id: 1, type: 'Square', filled: false },
    { id: 2, type: 'Circle', filled: true },
    { id: 3, type: 'Square', filled: true, correct: true }, // Correct: Square + Filled
    { id: 4, type: 'Triangle', filled: true },
  ];

  const handleSelect = (option) => {
    if (option.correct) {
      setSolved(true);
      if (onSolve) setTimeout(onSolve, 1500);
    } else {
      // Small shake animation or feedback
    }
  };

  const renderShape = (type, filled, size = 40) => {
    if (type === 'Circle') {
      return (
        <div style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          border: '2px solid var(--color-primary)', 
          background: filled ? 'var(--color-primary)' : 'transparent' 
        }} />
      );
    }
    if (type === 'Square') {
      return (
        <div style={{ 
          width: size, 
          height: size, 
          border: '2px solid var(--color-primary)', 
          background: filled ? 'var(--color-primary)' : 'transparent' 
        }} />
      );
    }
    return <div style={{ width: size, height: size, border: '2px solid red' }} />; // Fallback
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', maxWidth: '300px', margin: '0 auto' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textAlign: 'center' }}>
        QUICK CHALLENGE: What completes the pattern?
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px', 
        background: 'rgba(255,255,255,0.05)', 
        padding: '10px', 
        borderRadius: '8px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{renderShape('Circle', false)}</div>
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{renderShape('Square', false)}</div>
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{renderShape('Circle', true)}</div>
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-primary)', borderRadius: '4px' }}>
          {solved ? renderShape('Square', true) : '?'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <AnimatePresence>
          {!solved ? (
            options.map(opt => (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(opt)}
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '6px', 
                  padding: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {renderShape(opt.type, opt.filled, 25)}
              </motion.button>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ gridColumn: 'span 2', color: 'var(--color-primary)', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}
            >
              ✓ Pattern Recognized!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
