import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}


export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {

    console.error('Uncaught render error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-center p-8 bg-earth-50 dark:bg-earth-950">
          <div className="max-w-sm">
            <p className="text-6xl mb-4">⚠️</p>
            <h1 className="text-2xl font-bold text-earth-900 dark:text-earth-100 mb-2">
              Something went wrong
            </h1>
            <p className="text-earth-500 dark:text-earth-400 text-sm mb-6">
              An unexpected error occurred. Reloading the page usually fixes it.
            </p>
            <button onClick={this.handleReload} className="btn-primary px-6 py-2.5 text-sm">
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
