import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export const MOUSE_HATS = [
  { emoji: '', label: 'ไม่ใส่' },
  { emoji: '🎩', label: 'หมวกสุภาพบุรุษ' },
  { emoji: '👑', label: 'มงกุฎ' },
  { emoji: '🎓', label: 'หมวกนักเรียน' },
  { emoji: '👒', label: 'หมวกปีกกว้าง' },
  { emoji: '🪖', label: 'หมวกทหาร' },
  { emoji: '🎀', label: 'โบว์' },
  { emoji: '🌸', label: 'ดอกซากุระ' },
  { emoji: '🌺', label: 'ดอกไม้' },
  { emoji: '⭐', label: 'ดาว' },
  { emoji: '🌙', label: 'พระจันทร์' },
  { emoji: '🔮', label: 'ลูกแก้ว' },
  { emoji: '💎', label: 'เพชร' },
  { emoji: '🎭', label: 'หน้ากาก' },
  { emoji: '🃏', label: 'ไพ่จ๊อกเกอร์' },
  { emoji: '🎪', label: 'กระโจมสีสัน' },
  { emoji: '🦋', label: 'ผีเสื้อ' },
  { emoji: '🍄', label: 'เห็ด' },
  { emoji: '🌈', label: 'สายรุ้ง' },
  { emoji: '💫', label: 'ประกาย' },
  { emoji: '🔥', label: 'เปลวไฟ' },
  { emoji: '❄️', label: 'เกล็ดหิมะ' },
  { emoji: '🪄', label: 'ไม้กายสิทธิ์' },
  { emoji: '🎆', label: 'พลุ' },
];

interface MouseHatPickerProps {
  open: boolean;
  currentHat: string | null;
  onClose: () => void;
  onSelect: (hat: string | null) => void;
}

export const MouseHatPicker: React.FC<MouseHatPickerProps> = ({ open, currentHat, onClose, onSelect }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[70] flex items-end justify-center"
        style={{ background: 'rgba(5,6,15,0.8)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-sm rounded-t-3xl p-5 space-y-4"
          style={{
            background: 'linear-gradient(160deg, rgba(30,20,60,0.98) 0%, rgba(10,10,25,0.99) 100%)',
            border: '1.5px solid rgba(168,85,247,0.35)',
            borderBottom: 'none',
            boxShadow: '0 -20px 60px rgba(168,85,247,0.2)',
          }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">แต่งตัวหนู</p>
              <h3 className="text-base font-black text-white">เลือกหมวก / ของตกแต่ง</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-zinc-400 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {MOUSE_HATS.map(({ emoji, label }) => {
              const isSelected = (emoji === '' ? null : emoji) === (currentHat || null) || (emoji === '' && !currentHat);
              return (
                <motion.button
                  key={emoji || 'none'}
                  onClick={() => { onSelect(emoji || null); onClose(); }}
                  title={label}
                  whileTap={{ scale: 0.88 }}
                  className="relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-0.5 transition"
                  style={isSelected ? {
                    background: 'rgba(168,85,247,0.3)',
                    border: '2px solid rgba(168,85,247,0.7)',
                    boxShadow: '0 0 14px rgba(168,85,247,0.5)',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span className="text-2xl leading-none">{emoji || '🚫'}</span>
                  {isSelected && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center text-[8px] font-black text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          <p className="text-[10px] text-center text-zinc-600 pb-safe">เพื่อนๆ จะเห็นหมวกของคุณแบบ real-time</p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
