'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in Game Module:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        if (this.props.onReset) this.props.onReset();
    };

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center p-12 bg-gray-900/80 backdrop-blur-xl border border-red-500/30 rounded-[40px] text-center max-w-md mx-auto my-auto shadow-2xl">
                    <div className="text-6xl mb-6">🛰️</div>
                    <h2 className="text-2xl font-black text-red-400 mb-4">Sistem Hatası!</h2>
                    <p className="text-gray-400 mb-8 font-medium italic">
                        Bu oyun modülünde beklenmedik bir hata oluştu. Diğer sistemler güvenli!
                    </p>
                    <div className="bg-black/50 p-4 rounded-2xl mb-8 text-left overflow-auto max-h-32 w-full text-xs font-mono text-red-300">
                        {this.state.error?.message}
                    </div>
                    <button
                        onClick={this.handleReset}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-lg shadow-lg active:scale-95 transition-all"
                    >
                        MODÜLÜ YENİDEN YÜKLE 🔄
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
