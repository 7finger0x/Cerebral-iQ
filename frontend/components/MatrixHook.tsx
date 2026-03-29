'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MatrixHookProps {
  onSolve?: () => void;
}

const MatrixHook: React.FC<MatrixHookProps> = ({ onSolve }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [solved, setSolved] = useState(false);

  // Pattern Logic: A simple 3x3 matrix logic
  const drawShape = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: string) => {
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    if (type === 'circle') {
      ctx.arc(x + size / 2, y + size / 2, size / 3, 0, Math.PI * 2);
    } else if (type === 'square') {
      ctx.rect(x + size / 4, y + size / 4, size / 2, size / 2);
    } else if (type === 'triangle') {
      ctx.moveTo(x + size / 2, y + size / 4);
      ctx.lineTo(x + size / 4, y + 3 * size / 4);
      ctx.lineTo(x + 3 * size / 4, y + 3 * size / 4);
      ctx.closePath();
    }
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cellSize = canvas.width / 3;

    const shapes = [
      'circle', 'square', 'triangle',
      'square', 'triangle', 'circle',
      'triangle', 'circle', '?'
    ];

    shapes.forEach((shape, i) => {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const x = col * cellSize;
      const y = row * cellSize;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeRect(x + 5, y + 5, cellSize - 10, cellSize - 10);

      if (shape === '?') {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.fillRect(x + 10, y + 10, cellSize - 20, cellSize - 20);
        ctx.font = '24px Inter';
        ctx.fillStyle = '#6366f1';
        ctx.textAlign = 'center';
        ctx.fillText('?', x + cellSize / 2, y + cellSize / 2 + 8);
      } else {
        drawShape(ctx, x, y, cellSize, shape);
      }
    });
  }, [solved]);

  const handleSelect = (idx: number) => {
    if (idx === 1) { // 1 = Square (the correct answer)
      setSolved(true);
      if (onSolve) onSolve();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-8 glass-panel rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-1">Interactive Hook</span>
        <h3 className="text-xl font-semibold text-white">What comes next?</h3>
        <p className="text-slate-400 text-sm max-w-[280px]">Solve the pattern to jump to 10% of your clinical assessment.</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="rounded-lg shadow-2xl"
        />
        {solved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-indigo-600/90 backdrop-blur-sm rounded-lg"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <div className="text-white font-bold text-lg">PATTERN RECOGNIZED</div>
              <div className="text-indigo-200 text-xs">Progress Boosted: +10%</div>
            </div>
          </motion.div>
        )}
      </div>

      {!solved && (
        <div className="flex gap-4">
          {['circle', 'square', 'triangle'].map((type, i) => (
            <button
              key={type}
              onClick={() => handleSelect(i)}
              className="w-16 h-16 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors group"
            >
              <canvas
                id={`option-${i}`}
                width={64}
                height={64}
                className="opacity-60 group-hover:opacity-100 transition-opacity"
                ref={(el) => {
                  if (el) {
                    const ctx = el.getContext('2d');
                    if (ctx) {
                      ctx.clearRect(0, 0, 64, 64);
                      drawShape(ctx, 0, 0, 64, type);
                    }
                  }
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatrixHook;
