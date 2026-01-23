'use client';

import React, { useState, ReactNode } from 'react';
import ErrorBoundary from '../common/ErrorBoundary';
import { Maximize2, X, RefreshCw } from 'lucide-react';

interface GameContainerProps {
    children: ReactNode;
    title: string;
    onExit: () => void;
}

export default function GameContainer({ children, title, onExit }: GameContainerProps) {
    const [key, setKey] = useState(0); // For reloading the game

    const handleReload = () => setKey(prev => prev + 1);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col overflow-hidden">
            {/* Game Header Bar */}
            <div className="h-16 bg-gray-900 border-b border-white/10 flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
                        {title.charAt(0)}
                    </div>
                    <h2 className="text-white font-black tracking-tight text-lg">{title.toUpperCase()}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReload}
                        className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="Reload"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="Fullscreen"
                    >
                        <Maximize2 size={20} />
                    </button>
                    <button
                        onClick={onExit}
                        className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all ml-2"
                        title="Exit Game"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Game Content Area */}
            <div className="flex-1 relative bg-[#0a0a0f]">
                <ErrorBoundary key={key} onReset={handleReload}>
                    <div className="absolute inset-0">
                        {children}
                    </div>
                </ErrorBoundary>
            </div>
        </div>
    );
}
