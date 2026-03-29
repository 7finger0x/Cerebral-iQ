'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MatrixRendererProps {
  itemId?: string;
}

const MatrixRenderer: React.FC<MatrixRendererProps> = ({ itemId }) => {
  // A 3x3 matrix design inspired by Raven's Progressive Matrices
  // For a "Clinical Grade" look, we use crisp SVG shapes and subtle animation.
  
  const shapes = [
    { type: 'circle', transform: 0 },
    { type: 'circle', transform: 45 },
    { type: 'circle', transform: 90 },
    { type: 'square', transform: 0 },
    { type: 'square', transform: 45 },
    { type: 'square', transform: 90 },
    { type: 'triangle', transform: 0 },
    { type: 'triangle', transform: 45 },
    { type: 'null', transform: 0 }, // The missing one
  ];

  const renderShape = (type: string, transform: number, index: number) => {
    if (type === 'null') {
      return (
        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-primary/20 bg-primary/5 rounded-lg">
          <span className="text-primary font-bold">?</span>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className="w-full h-full flex items-center justify-center"
      >
        <svg viewBox="0 0 100 100" className="w-12 h-12">
          <g transform={`rotate(${transform} 50 50)`}>
            {type === 'circle' && (
              <circle 
                cx="50" cy="50" r="35" 
                fill="none" stroke="currentColor" strokeWidth="4" 
                className="text-primary"
              />
            )}
            {type === 'square' && (
              <rect 
                x="20" y="20" width="60" height="60" 
                fill="none" stroke="currentColor" strokeWidth="4" 
                className="text-indigo-400"
              />
            )}
            {type === 'triangle' && (
              <path 
                d="M50 15 L85 75 L15 75 Z" 
                fill="none" stroke="currentColor" strokeWidth="4" 
                className="text-accent"
              />
            )}
          </g>
          {/* Internal Detail for complexity */}
          <circle cx="50" cy="50" r="4" fill="currentColor" className="opacity-40" />
        </svg>
      </motion.div>
    );
  };

  return (
    <div className="w-64 h-64 grid grid-cols-3 grid-rows-3 gap-3">
      {shapes.map((shape, i) => (
        <div key={i} className="bg-white/5 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
          {renderShape(shape.type, shape.transform, i)}
        </div>
      ))}
    </div>
  );
};

export default MatrixRenderer;
