import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Đã có lỗi không mong muốn xảy ra</h2>
              <p className="text-gray-400 text-sm">
                Ứng dụng gặp sự cố trong quá trình xử lý giao diện. Vui lòng thử tải lại trang.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <div className="mt-4 p-4 bg-black/50 rounded-lg text-left overflow-auto max-h-40">
                  <pre className="text-xs text-red-400 font-mono">{this.state.error.toString()}</pre>
                </div>
              )}
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Tải lại trang
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
