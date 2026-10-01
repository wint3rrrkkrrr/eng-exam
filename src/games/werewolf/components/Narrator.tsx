import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';

interface Props {
  phase: string;
  text: string;
}

const NIGHT_PHASES = ['night', 'role_reveal'];

// แถบผู้ดำเนินเกม: ข้อความบรรยาย + แอนิเมชันเปลี่ยนกลางวัน/กลางคืน (ใช้ motion)
export const Narrator: React.FC<Props> = ({ phase, text }) => {
  const isNight = NIGHT_PHASES.includes(phase);
  return (
    <div className={`relative overflow-hidden rounded-2xl border px-4 py-4 transition-colors duration-700 ${
      isNight ? 'border-violet-500/30 bg-gradient-to-br from-[#0c1230] to-[#1a1040]' : 'border-amber-400/30 bg-gradient-to-br from-[#3a2a22] to-[#2a2040]'
    }`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isNight ? 'moon' : 'sun'}
          initial={{ y: 24, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -24, opacity: 0, rotate: 30 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16 }}
          className="absolute right-3 top-3"
        >
          {isNight ? <Moon className="w-8 h-8 text-slate-200" /> : <Sun className="w-8 h-8 text-amber-300" />}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.p
          key={text}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pr-12 text-base font-bold text-slate-100 min-h-[1.5rem]"
        >
          {text || '…'}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
