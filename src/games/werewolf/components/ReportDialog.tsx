import React, { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { api } from '../net/werewolfClient';
import type { Session } from '../net/werewolfClient';
import { REPORT_REASON_TH } from '../net/community';

interface Props {
  session: Session;
  targetPlayerId: string;
  targetName: string;
  onClose: () => void;
}

/** รายงานผู้เล่นในห้อง: เลือกเหตุผล + รายละเอียดสั้นๆ → ส่งให้ผู้ดูแล */
export const ReportDialog: React.FC<Props> = ({ session, targetPlayerId, targetName, onClose }) => {
  const [reason, setReason] = useState<string>('');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!reason || busy) return;
    setBusy(true);
    setErr(null);
    const r = await api('report-submit', { targetPlayerId, reason, detail }, session);
    setBusy(false);
    if (r.ok) setDone(true); else setErr(r.errorTh);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" role="dialog" aria-label={`รายงาน ${targetName}`}>
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 space-y-4 text-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-black">🚩 รายงาน {targetName}</h3>
          <button onClick={onClose} aria-label="ปิด" className="min-w-10 min-h-10 rounded-xl hover:bg-white/10 flex items-center justify-center cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        {done ? (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center"><Check className="w-6 h-6" /></div>
            <p className="font-bold">ส่งรายงานแล้ว ขอบคุณที่ช่วยดูแลชุมชน</p>
            <button onClick={onClose} className="px-6 min-h-11 rounded-xl bg-violet-600 font-black cursor-pointer">ปิด</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="เหตุผล">
              {Object.entries(REPORT_REASON_TH).map(([k, v]) => (
                <button key={k} role="radio" aria-checked={reason === k} onClick={() => setReason(k)} className={`min-h-11 px-3 rounded-xl text-sm font-bold text-left cursor-pointer ${reason === k ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>{v}</button>
              ))}
            </div>
            <textarea value={detail} maxLength={200} onChange={(e) => setDetail(e.target.value)} placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" rows={3} className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-sm outline-none focus:border-violet-400" />
            {err && <p role="alert" className="text-xs text-red-300">{err}</p>}
            <button onClick={submit} disabled={!reason || busy} className="w-full min-h-12 rounded-xl bg-red-600 hover:bg-red-500 font-black disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} ส่งรายงาน
            </button>
          </>
        )}
      </div>
    </div>
  );
};
