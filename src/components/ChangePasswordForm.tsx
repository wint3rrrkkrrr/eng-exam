import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { changePassword, passwordStrength } from '../utils/supabaseSim';

const STRENGTH_LABEL = ['', 'อ่อนมาก', 'พอใช้', 'ดี', 'แข็งแรง'];

/** เปลี่ยนรหัสผ่าน (ต้องล็อกอินอยู่) — สำเร็จแล้วเครื่องอื่นถูกออกจากระบบ */
export const ChangePasswordForm: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const [open, setOpen] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const input = `w-full px-3.5 py-2.5 rounded-xl text-sm border font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
    isDark ? 'bg-zinc-800/60 border-zinc-700 text-zinc-100' : 'bg-stone-50 border-stone-300 text-stone-800'
  }`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (newPw.length < 8) return setMsg({ ok: false, text: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร' });
    if (newPw !== confirm) return setMsg({ ok: false, text: 'รหัสผ่านใหม่สองช่องไม่ตรงกัน' });
    setBusy(true);
    setMsg(null);
    const r = await changePassword(oldPw, newPw);
    setBusy(false);
    if (r.ok) {
      setMsg({ ok: true, text: 'เปลี่ยนรหัสผ่านแล้ว — เซสชันของเครื่องอื่นถูกยกเลิกแล้ว (ต้องล็อกอินใหม่ด้วยรหัสใหม่)' });
      setOldPw(''); setNewPw(''); setConfirm('');
    } else {
      setMsg({ ok: false, text: r.messageTh ?? 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
    }
  };

  return (
    <div className={`rounded-2xl border ${isDark ? 'border-zinc-800 bg-zinc-800/30' : 'border-stone-200 bg-stone-50'}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-3.5 py-3 text-xs font-bold text-amber-400"
      >
        <KeyRound className="w-3.5 h-3.5" /> เปลี่ยนรหัสผ่าน
        <span className="ml-auto text-[10px] text-zinc-500">{open ? 'ซ่อน' : 'เปิด'}</span>
      </button>
      {open && (
        <form onSubmit={submit} className="px-3.5 pb-3.5 space-y-2.5" autoComplete="off">
          <div className="relative">
            <input type={show ? 'text' : 'password'} autoComplete="current-password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="รหัสผ่านเดิม" className={`${input} pr-10`} maxLength={100} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} className="absolute inset-y-0 right-0 px-3 text-zinc-400 hover:text-amber-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input type={show ? 'text' : 'password'} autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)" className={input} maxLength={100} />
          {newPw.length > 0 && <p className="text-[10px] font-bold text-zinc-500">ความแข็งแรง: {STRENGTH_LABEL[passwordStrength(newPw)]}</p>}
          <input type={show ? 'text' : 'password'} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="ยืนยันรหัสผ่านใหม่" className={input} maxLength={100} />
          {msg && <p role="alert" className={`text-xs font-bold ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>}
          <button type="submit" disabled={busy || !oldPw || !newPw} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-50">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} ยืนยันเปลี่ยนรหัสผ่าน
          </button>
        </form>
      )}
    </div>
  );
};
