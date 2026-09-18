import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export const AmbientParticles: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  // Generate 100 highly optimized drifting interactive particles
  const particles = useMemo(() => {
    const arr: Particle[] = [];
    const colors = isDark 
      ? ['rgba(245,158,11,0.25)', 'rgba(59,130,246,0.2)', 'rgba(168,85,247,0.2)', 'rgba(16,185,129,0.15)', 'rgba(239,68,68,0.15)']
      : ['rgba(245,158,11,0.12)', 'rgba(59,130,246,0.1)', 'rgba(168,85,247,0.1)', 'rgba(16,185,129,0.08)'];

    for (let i = 0; i < 100; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100, // percentage x
        y: Math.random() * 100, // percentage y
        size: Math.random() * 6 + 2, // size in px
        duration: Math.random() * 25 + 15, // speed in seconds
        delay: Math.random() * -20, // negative delay so they are already spread
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return arr;
  }, [isDark]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: ['0px', '-120px', '0px'],
            x: ['0px', `${Math.random() * 40 - 20}px`, '0px'],
            scale: [1, 1.4, 0.8, 1],
            opacity: [0.1, 0.8, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
