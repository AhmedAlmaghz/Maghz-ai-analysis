import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
          <div className="rounded-full bg-red-500/10 p-6">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">حدث خطأ غير متوقع</h2>
          <p className="text-slate-400 text-center max-w-md">
            عذراً، حدث خطأ أثناء عرض الصفحة. يرجى تحديث الصفحة أو المحاولة مرة أخرى.
          </p>
          {this.state.error && (
            <details className="mt-4 max-w-2xl w-full">
              <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-400">
                تفاصيل الخطأ
              </summary>
              <pre className="mt-2 p-4 bg-slate-800 rounded-lg text-xs text-red-400 overflow-auto">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white hover:shadow-lg transition-all"
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
