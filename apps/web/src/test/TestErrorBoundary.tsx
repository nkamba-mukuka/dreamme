import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class TestErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.props.onError?.(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div role="alert">
                    <h2>Something went wrong!</h2>
                    <pre>{this.state.error?.message}</pre>
                </div>
            );
        }

        return this.props.children;
    }
} 