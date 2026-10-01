import React from 'react';
import { UI } from '../text/th';

interface Props {
  onBack: () => void;
  children: React.ReactNode;
}

// กันหน้าเกมแววูฟพังแล้วลากทั้งเว็บล่ม (เกมเดิมเคยพังทั้งหน้าเพราะไม่มีตัวกันนี้)
interface State {
  error: Error | null;
}

export class WerewolfErrorBoundary extends React.Component<Props, State> {
  // `declare` ระดับชนิดข้อมูลเท่านั้น (ไม่สร้างโค้ดตอนรัน) — ตามที่ CheeseErrorBoundary ทำ เพราะการตั้งค่าชนิดของ React ในโปรเจกต์นี้มองไม่เห็นสมาชิกที่สืบทอดมา
  declare props: Props;
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[werewolf] UI error', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1020] text-slate-100 p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="text-5xl">🐺</div>
          <h1 className="text-xl font-black">{UI.crash.title}</h1>
          <p className="text-sm text-slate-400">{UI.crash.body}</p>
          <button
            onClick={this.props.onBack}
            className="px-5 py-3 min-h-12 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold cursor-pointer"
          >
            {UI.back}
          </button>
        </div>
      </div>
    );
  }
}
