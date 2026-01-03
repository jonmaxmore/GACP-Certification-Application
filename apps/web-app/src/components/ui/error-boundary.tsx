"use client";

import { Component, ReactNode } from "react";
import { colors } from "@/lib/design-tokens";

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
 * 🍎 Apple-standard Error Boundary
 * Catches JavaScript errors in child component tree
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
                <div style={{
                    padding: 24,
                    textAlign: "center",
                    backgroundColor: "#FEF2F2",
                    borderRadius: 12,
                    margin: 16,
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <h3 style={{ color: "#DC2626", marginBottom: 8 }}>
                        เกิดข้อผิดพลาด
                    </h3>
                    <p style={{ color: colors.textGray, marginBottom: 16 }}>
                        กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: colors.primary,
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
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
