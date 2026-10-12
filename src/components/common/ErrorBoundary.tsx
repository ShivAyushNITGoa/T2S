import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[T2S ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let parsedFirestoreInfo: any = null;
      try {
        if (this.state.error?.message) {
          parsedFirestoreInfo = JSON.parse(this.state.error.message);
        }
      } catch {}

      return (
        <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#0c0e14] border border-rose-500/30 rounded-3xl p-8 space-y-5 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-mono text-rose-400 uppercase tracking-widest">
                SYSTEM RUNTIME RECOVERY
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                सिस्टम में अस्थायी व्यवधान आया है
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {parsedFirestoreInfo?.error ||
                  this.state.error?.message ||
                  'An unexpected error occurred while rendering this view.'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>पेज रीलोड करें (Reload Application)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
