import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { ROLE_LIST } from '../engine';
import { RoleDetail } from './InfoModals';
import { RoleIcon } from './avatar/RoleIcon';
import { HOW_TO_PLAY } from '../text/th';

interface Props {
  onClose: () => void;
}

const GROUP_ORDER = ['village', 'wolf', 'vampire', 'cult', 'solo'] as const;

/** หน้า "วิธีเล่น" — ภาพรวมเกม + ลำดับแต่ละเฟส + เรียกดูบททั้งหมด (M7) */
export const HowToPlay: React.FC<Props> = ({ onClose }) => {
  const [tab, setTab] = useState<'overview' | 'phases' | 'roles'>('overview');
  const [openRole, setOpenRole] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState<string>('all');

  const roles = ROLE_LIST.filter((r) => teamFilter === 'all' || r.startTeam === teamFilter);

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1020] text-slate-100 overflow-y-auto" role="dialog" aria-label={HOW_TO_PLAY.title}>
      <div className="max-w-xl mx-auto pb-10">
        <header className="sticky top-0 z-10 bg-[#0b1020]/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-3 border-b border-slate-800">
          <h1 className="text-base font-black">📖 {HOW_TO_PLAY.title}</h1>
          <button onClick={onClose} aria-label="ปิด" className="min-w-12 min-h-12 -mr-2 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </header>

        <nav className="px-4 pt-4 flex gap-2" role="tablist">
          {([['overview', HOW_TO_PLAY.tabOverview], ['phases', HOW_TO_PLAY.tabPhases], ['roles', HOW_TO_PLAY.tabRoles]] as const).map(([k, label]) => (
            <button
              key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`flex-1 min-h-12 rounded-xl text-sm font-bold cursor-pointer ${tab === k ? 'bg-violet-700' : 'bg-slate-800 text-slate-300'}`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 pt-4 space-y-4">
          {tab === 'overview' && (
            <div className="space-y-4">
              <section className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-4 space-y-2">
                <h2 className="text-sm font-black text-violet-300">{HOW_TO_PLAY.goalTitle}</h2>
                <p className="text-sm text-slate-200">{HOW_TO_PLAY.goalBody}</p>
              </section>
              {HOW_TO_PLAY.basics.map((b) => (
                <section key={b.title} className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4 space-y-1.5">
                  <h3 className="text-sm font-black text-amber-200">{b.title}</h3>
                  <p className="text-sm text-slate-300 whitespace-pre-line">{b.body}</p>
                </section>
              ))}
            </div>
          )}

          {tab === 'phases' && (
            <ol className="space-y-3">
              {HOW_TO_PLAY.phases.map((p, i) => (
                <li key={p.title} className="rounded-2xl border border-slate-700/60 bg-slate-950/50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-sm font-black shrink-0">{i + 1}</span>
                    <h3 className="text-sm font-black">{p.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-300 whitespace-pre-line">{p.body}</p>
                </li>
              ))}
            </ol>
          )}

          {tab === 'roles' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">{HOW_TO_PLAY.rolesHint(roles.length)}</p>
              <div className="flex gap-1.5 overflow-x-auto" role="tablist" aria-label="กรองตามฝ่าย">
                {(['all', ...GROUP_ORDER] as const).map((k) => (
                  <button
                    key={k} role="tab" aria-selected={teamFilter === k} onClick={() => setTeamFilter(k)}
                    className={`shrink-0 min-h-11 px-3.5 rounded-xl text-xs font-bold cursor-pointer ${teamFilter === k ? 'bg-violet-700 text-white' : 'bg-slate-800 text-slate-300'}`}
                  >
                    {k === 'all' ? HOW_TO_PLAY.allTeams : (HOW_TO_PLAY.teamLabels[k] ?? k)}
                  </button>
                ))}
              </div>
              {roles.map((r) => (
                <div key={r.id} className="rounded-xl bg-slate-900/70 border border-slate-700/60">
                  <button
                    onClick={() => setOpenRole(openRole === r.id ? null : r.id)}
                    aria-expanded={openRole === r.id}
                    className="w-full min-h-14 px-3 flex items-center gap-3 text-left cursor-pointer"
                  >
                    <span className="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center p-1 shrink-0">
                      <RoleIcon id={r.id} className="w-full h-full" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold">{r.nameTh}</span>
                      <span className="block text-[11px] text-slate-400">{HOW_TO_PLAY.teamLabels[r.startTeam] ?? r.startTeam}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openRole === r.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openRole === r.id && <div className="px-3 pb-3 border-t border-slate-800 pt-3"><RoleDetail roleId={r.id} /></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
