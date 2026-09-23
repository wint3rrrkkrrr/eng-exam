import React, { useMemo } from 'react';
import { motion } from 'motion/react';

const EMOJIS = ['🧀', '🐭', '🐾', '✦', '⭐', '🌙', '🔮', '✨'];

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  startY: number;
}

export const CheeseParticles: React.FC<{ count?: number }> = ({ count = 30 }) => {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      left: (i * 37 + 5) % 95,
      delay: (i * 0.4) % 6,
      duration: 8 + (i % 7) * 1.5,
      size: 10 + (i % 5) * 4,
      startY: (i * 31) % 100,
    })),
  [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute"
          style={{ left: `${p.left}%`, top: `${p.startY}%`, fontSize: p.size }}
          animate={{
            y: [0, -80, -160],
            opacity: [0, 0.6, 0],
            rotate: [0, (p.id % 2 === 0 ? 25 : -25)],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
};

export const AuroraBg: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)' }}
      animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
      transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }}
      animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)' }}
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);
