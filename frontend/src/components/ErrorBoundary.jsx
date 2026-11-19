import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F6F9FC] flex items-center justify-center p-6 text-[#12304A]">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 shadow-xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900">
                পৃষ্ঠা লোড হতে সাময়িক সমস্যা হয়েছে
              </h1>
              <p className="text-xs text-slate-500">
                A temporary interface error occurred. You can reload the page or return to the home screen.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="text-left text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 font-mono overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#12304A] hover:bg-[#1E4668] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                রিলোড করুন
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                মূল পাতায় যান
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
