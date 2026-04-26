import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-shell">
          <div className="app-error-card">
            <div className="app-error-icon">
              <AlertTriangle size={22} />
            </div>
            <strong>Se produjo un error inesperado en la interfaz</strong>
            <p>
              Recarga la página para restaurar la sesión local. Si el problema persiste,
              reinicia los datos del navegador antes de conectar el backend real.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
