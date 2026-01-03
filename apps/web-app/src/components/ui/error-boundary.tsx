"use client";

import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

/**
 * 🌿 Eco-Professional Error Boundary
 * Catches JavaScript errors with Tailwind CSS styling
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[ErrorBoundary] Caught error:", error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-6 text-center bg-red-50 rounded-xl m-4 border border-red-100">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h3 className="text-red-600 font-bold text-lg mb-2">
                        เกิดข้อผิดพลาด
                    </h3>
                    <p className="text-slate-500 mb-4">
                        กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors cursor-pointer border-none"
                    >
                        ลองใหม่
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Functional wrapper for easier use
 */
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

export default ErrorBoundary;
