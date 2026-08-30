import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Uncaught error in React tree:', error, info);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleBackToHome = (): void => {
    window.location.href = window.location.origin;
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-brand-cocoa">
          <div className="max-w-md w-full bg-white border border-brand-cocoa-border rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-brand-pink-light/60 text-brand-pink rounded-full flex items-center justify-center mx-auto mb-5 border border-brand-pink/20">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h1 className="font-display font-bold text-2xl text-brand-cocoa mb-2">
              Something went wrong
            </h1>

            <p className="text-sm text-brand-cocoa-light mb-8 leading-relaxed">
              Something went wrong. Please refresh the page.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
