"use client";
import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8" role="alert">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-danger-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-danger-500" />
            </div>
            <h2 className="text-heading-lg font-serif text-[var(--color-text-primary)] mb-2">
              Une erreur est survenue
            </h2>
            <p className="text-body-sm text-[var(--color-text-tertiary)] mb-6">
              {this.state.error?.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="btn-primary"
              >
                <RefreshCw size={16} /> Réessayer
              </button>
              <Link href="/" className="btn-ghost text-sm">
                <Home size={14} /> Accueil
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
