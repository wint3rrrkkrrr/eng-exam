import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import {
  MouseAvatarConfig,
  BG_GRADIENTS,
  HAT_OPTIONS,
  ACC_OPTIONS,
  HAT_LABELS,
  ACC_LABELS,
  generateMouseAvatarUri,
} from './mouseavatar';

interface Props {
  config: MouseAvatarConfig;
  isDark: boolean;
  onSave: (config: MouseAvatarConfig) => void;
  onClose: () => void;
}

export const CheeseAvatarPicker: React.FC<Props> = ({ config, isDark, onSave, onClose }) => {
  const [draft, setDraft] = useState<MouseAvatarConfig>({ ...config });
  const previewUri = generateMouseAvatarUri(draft);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-2 pb-2 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className={`w-full max-w-sm rounded-3xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-stone-100'}`}>
          <span className="font-black text-sm">🐭 แต่งตัวหนูของคุณ</span>
          <button onClick={onClose} className={`p-1.5 rounded-xl transition ${isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-stone-100 text-stone-500'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Preview */}
          <div className="flex justify-center">
            <motion.img
              key={previewUri}
              src={previewUri}
              alt="preview"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 rounded-full ring-4 ring-amber-400/40 shadow-xl"
            />
          </div>

          {/* Background color */}
          <div className="space-y-2">
            <p className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>สีพื้นหลัง</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(BG_GRADIENTS).map(([key, { colors, label }]) => (
                <button
                  key={key}
                  onClick={() => setDraft(d => ({ ...d, bg: key }))}
                  title={label}
                  className={`relative w-9 h-9 rounded-full transition active:scale-90 ${
                    draft.bg === key ? 'ring-2 ring-offset-2 ring-amber-400 ' + (isDark ? 'ring-offset-zinc-900' : 'ring-offset-white') : ''
                  }`}
                  style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                >
                  {draft.bg === key && (
                    <Check className="w-3.5 h-3.5 absolute inset-0 m-auto text-zinc-900 drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hats */}
          <div className="space-y-2">
            <p className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>หมวก</p>
            <div className="flex flex-wrap gap-1.5">
              {HAT_OPTIONS.map((hat, i) => (
                <button
                  key={i}
                  onClick={() => setDraft(d => ({ ...d, hat }))}
                  title={HAT_LABELS[i]}
                  className={`w-10 h-10 rounded-2xl text-xl transition active:scale-90 flex items-center justify-center ${
                    draft.hat === hat
                      ? 'ring-2 ring-amber-400 bg-amber-400/20'
                      : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {hat || <span className="text-xs font-black text-zinc-500">✕</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="space-y-2">
            <p className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-stone-400'}`}>ของประดับ</p>
            <div className="flex flex-wrap gap-1.5">
              {ACC_OPTIONS.map((acc, i) => (
                <button
                  key={i}
                  onClick={() => setDraft(d => ({ ...d, acc }))}
                  title={ACC_LABELS[i]}
                  className={`w-10 h-10 rounded-2xl text-xl transition active:scale-90 flex items-center justify-center ${
                    draft.acc === acc
                      ? 'ring-2 ring-amber-400 bg-amber-400/20'
                      : isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  {acc || <span className="text-xs font-black text-zinc-500">✕</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className={`px-5 py-4 border-t ${isDark ? 'border-zinc-800' : 'border-stone-100'}`}>
          <button
            onClick={() => { onSave(draft); onClose(); }}
            className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 to-orange-400 text-zinc-950 active:scale-95 transition shadow-lg"
          >
            บันทึกหน้าตาหนู 🐭
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
