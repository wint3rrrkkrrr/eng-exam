import React from 'react';

interface Props {
  children: React.ReactNode;
  onBackToHome: () => void;
}

interface State {
  hasError: boolean;
}

// Isolates crashes inside the Cheese Thief game so a bug there never takes
// down the exam-taking app that shares this React tree.
export class CheeseErrorBoundary extends React.Component<Props, State> {
  // Explicit `declare` re-annotations: this environment's React type
  // resolution doesn't surface Component<P,S>'s inherited members for class
  // components (every other component here is functional/hooks-based).
  // `declare` is type-only and emits no runtime code either way.
  declare props: Props;
  declare setState: (state: Partial<State>) => void;
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('CheeseGame crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center bg-[#0b0c16] text-zinc-200">
          <div className="text-5xl">🐭💥</div>
          <p className="text-sm font-bold">เกมมีปัญหาบางอย่าง ขออภัยด้วยครับ</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onBackToHome();
            }}
            className="px-5 py-2.5 rounded-xl font-black text-sm bg-amber-400 text-zinc-950 active:scale-95 transition"
          >
            กลับหน้าแรก
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
