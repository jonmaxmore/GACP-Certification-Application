'use client';

import React, { Component, ReactNode } from 'react';

/**
 * Global Error Boundary
 * Apple-Standard Error Handling for Zero-Crash Production
 * 
 * Catches JavaScript errors anywhere in child component tree,
 * logs errors, and displays a fallback UI.
 */

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to error reporting service
        console.error('Error Boundary Caught:', error);
        console.error('Component Stack:', errorInfo.componentStack);

        this.setState({ errorInfo });

        // In production, send to monitoring service
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to Sentry/CloudWatch
            // logErrorToService(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                        {/* Apple-style error icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            เกิดข้อผิดพลาด
                        </h1>

                        <p className="text-gray-600 mb-6">
                            ขออภัย ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด
                            <br />
                            กรุณาลองใหม่อีกครั้ง
                        </p>

                        {/* Error details (dev only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-40">
                                <p className="text-sm font-mono text-red-600">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                            >
                                ลองใหม่
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                กลับหน้าแรก
                            </button>
                        </div>

                        {/* Support info */}
                        <p className="mt-6 text-sm text-gray-500">
                            หากปัญหายังคงอยู่ กรุณาติดต่อ
                            <a href="mailto:support@gacp.go.th" className="text-emerald-600 hover:underline ml-1">
                                support@gacp.go.th
                            </a>
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

/**
 * Hook version for functional components
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
