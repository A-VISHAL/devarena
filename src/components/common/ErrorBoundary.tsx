import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DEVARENA ErrorBoundary] Caught error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public handleReload = () => {
    window.location.reload();
  };

  public handleGoHome = () => {
    window.location.href = '/app';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[300px] w-full flex items-center justify-center p-6 bg-[#101314] text-neutral-200">
          <div className="max-w-md w-full bg-[#1C2426] border border-rose-500/30 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white font-mono">
                {this.props.fallbackTitle || 'Interface Render Notice'}
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                An unexpected interface exception occurred. Your state and progress are preserved in local storage.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#101314] p-3 rounded-lg border border-[#252D30] text-left">
                <span className="text-[10px] font-mono text-rose-400 block break-all">
                  {this.state.error.message || String(this.state.error)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#252D30] hover:bg-[#2F383C] text-neutral-300 text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono rounded-lg transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-xs font-mono rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
