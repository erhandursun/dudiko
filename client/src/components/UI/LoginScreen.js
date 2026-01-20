'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '@/stores/socketStore';
import { Sparkles, Play, Maximize2, User } from 'lucide-react';

export default function LoginScreen({ onJoin }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    // const joinGame = useSocketStore((state) => state.joinGame); // Handled by parent

    const handleStart = () => {
        if (!name.trim()) {
            setError('Lütfen ismini yaz cesur kaşif! 🌍');
            return;
        }
        if (onJoin) {
            onJoin(name.trim(), '#ff85c0'); // Default pink color
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(e => {
                console.error(`Error attempting to enable full-screen mode: ${e.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden bg-[#000]">
            {/* Animated Background */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 scale-110"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2000&auto=format&fit=crop")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-princess-pink/20 via-transparent to-black/80" />

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="relative z-10 w-full max-w-md p-8 glass mx-4 rounded-[40px] text-center"
            >
                <div className="mb-6 inline-flex p-4 rounded-full bg-white/20 text-white animate-pulse">
                    <Sparkles size={48} />
                </div>

                <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg tracking-tight">
                    WEBTOWN MACERASI
                </h1>
                <p className="text-white/80 font-medium mb-8">
                    Kendi dünyanı kurmaya hazır mısın? 🚀
                </p>

                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                        <input
                            type="text"
                            placeholder="İsmini Buraya Yaz..."
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError('');
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                            className="w-full h-16 pl-12 pr-6 rounded-2xl bg-white/20 border-2 border-white/30 text-white placeholder:text-white/40 focus:outline-none focus:border-princess-gold transition-all text-lg font-bold"
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-princess-gold font-bold text-sm"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        onClick={handleStart}
                        className="btn-gradient w-full h-20 rounded-2xl text-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                        OYNA <Play size={28} fill="white" />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="w-full h-12 rounded-xl bg-white/10 text-white/80 font-bold flex items-center justify-center gap-2 border border-white/10 active:bg-white/20"
                    >
                        <Maximize2 size={18} /> TAM EKRAN (ÖNERİLİR)
                    </button>
                </div>

                <div className="mt-8 text-white/40 text-xs font-medium uppercase tracking-[3px]">
                    v3.1.2 Ultra Engine 🚀
                </div>
            </motion.div>

            {/* Background Particles Decoration */}
            <div className="absolute top-10 left-10 w-24 h-24 bg-princess-pink opacity-20 blur-3xl rounded-full animate-bounce" />
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 opacity-20 blur-3xl rounded-full animate-pulse" />
        </div>
    );
}
