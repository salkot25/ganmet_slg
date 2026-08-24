import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './common/Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PLN Dashboard Uncaught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-base-dark text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-surface-dark border border-rose-500/40 rounded-20px p-6 md:p-8 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                Terjadi Kendala pada Antarmuka
              </h2>
              <p className="text-xs text-slate-400">
                Aplikasi mendeteksi anomali pada pemrosesan komponen. Seluruh data spreadsheet Anda tetap aman.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full p-3 bg-slate-900/90 rounded-8px border border-slate-800 text-left font-mono text-[11px] text-rose-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Home}
                onClick={this.handleReset}
              >
                Coba Buka Ulang
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                onClick={this.handleReload}
              >
                Muat Ulang Halaman
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
