import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Copy, Check } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
  copied: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null, copied: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Uncaught error in React tree:', error, info);
    this.setState({ componentStack: info.componentStack || null });
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleBackToHome = (): void => {
    window.location.href = window.location.origin;
  };

  handleCopyDetails = (): void => {
    const { error, componentStack } = this.state;
    const details = [
      `Message: ${error?.message || 'Unknown error'}`,
      '',
      `Stack:\n${error?.stack || 'No stack available'}`,
      '',
      `Component stack:${componentStack || ' No component stack available'}`,
    ].join('\n');

    navigator.clipboard.writeText(details).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(() => {});
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { error, componentStack, copied } = this.state;
      return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-brand-cocoa">
          <div className="max-w-lg w-full bg-white border border-brand-cocoa-border rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-brand-pink-light/60 text-brand-pink rounded-full flex items-center justify-center mx-auto mb-5 border border-brand-pink/20">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h1 className="font-display font-bold text-2xl text-brand-cocoa mb-2">
              Something went wrong
            </h1>

            <p className="text-sm text-brand-cocoa-light mb-6 leading-relaxed">
              Something went wrong. Please refresh the page.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-brand-pink hover:bg-brand-pink-dark text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleBackToHome}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-brand-cocoa-border hover:border-brand-pink text-brand-cocoa hover:text-brand-pink font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home</span>
              </button>
            </div>

            <div className="text-left border-t border-brand-cocoa-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase font-mono text-slate-500">
                  Error details (for debugging)
                </span>
                <button
                  type="button"
                  onClick={this.handleCopyDetails}
                  className="text-[10px] text-brand-pink font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                {`Message: ${error?.message || 'Unknown error'}\n\nStack:\n${error?.stack || 'No stack available'}\n\nComponent stack:${componentStack || ' No component stack available'}`}
              </pre>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
