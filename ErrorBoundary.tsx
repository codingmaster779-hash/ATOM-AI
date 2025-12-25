import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };
  public static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("ErrorBoundary caught error:", error, errorInfo); }
  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-black flex items-center justify-center text-white p-4">
          <div className="bg-gray-900 p-6 rounded-xl border border-red-500/50 max-w-md w-full text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Critical System Error</h1>
            <p className="text-xs text-gray-400 font-mono mb-4 bg-black p-2 rounded">{this.state.error?.message || "Unknown error"}</p>
            <button onClick={() => window.location.reload()} className="bg-atom-600 px-4 py-2 rounded-lg flex items-center gap-2 mx-auto">
              <RefreshCw className="w-4 h-4"/> Reload System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
