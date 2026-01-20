'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Play, Maximize2, User, Gamepad2, GraduationCap, Trophy, Candy } from 'lucide-react';

const GAME_WORLDS = [
    {
        id: 'town',
        title: 'Kasaba Meydanı',
        desc: 'Arkadaşlarınla buluş, sohbet et! 🏰',
        gradient: 'from-blue-400 to-indigo-600',
        icon: <Gamepad2 size={48} className="text-white/80" />
    },
    {
        id: 'school',
        title: 'Akademi',
        desc: 'Matematik öğren ve zekanı geliştir! 🏫',
        gradient: 'from-yellow-400 to-orange-500',
        icon: <GraduationCap size={48} className="text-white/80" />
    },
    {
        id: 'race',
        title: 'Yarış Parkuru',
        desc: 'En hızlı sen ol! 🏎️',
        gradient: 'from-red-500 to-pink-600',
        icon: <Trophy size={48} className="text-white/80" />
    },
    {
        id: 'candy',
        title: 'Şeker Diyarı',
        desc: 'Tatlı bir dünyada kaybol! 🍭',
        gradient: 'from-pink-400 to-purple-500',
        icon: <Candy size={48} className="text-white/80" />
    }
];

export default function LoginScreen({ onJoin }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [selectedDetail, setSelectedDetail] = useState(null);

    const handleStart = () => {
        if (!name.trim()) {
            setError('Lütfen ismini yaz cesur kaşif! 🌍');
            return;
        }
        if (onJoin) {
            onJoin(name.trim(), '#ff85c0');
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
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-auto bg-[#1a1a2e] text-white">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black z-0 pointer-events-none" />

            {/* Particles */}
            <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            <div className="relative z-10 w-full max-w-6xl p-4 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-center min-h-screen">

                {/* CENTERED Login Panel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] shadow-2xl"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full shadow-lg shadow-purple-500/30 animate-bounce">
                            <Sparkles size={40} className="text-white" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-white mb-6">Maceraya Katıl</h2>

                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-blue-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="İsmini Buraya Yaz..."
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setError('');
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                                className="w-full h-16 pl-12 pr-6 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all text-lg font-bold"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 font-bold text-sm text-center bg-red-500/10 py-2 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            onClick={handleStart}
                            className="w-full h-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-2xl font-black flex items-center justify-center gap-3 shadow-lg shadow-purple-600/30 active:scale-95 transition-all text-white"
                        >
                            BAŞLA <Play size={28} fill="currentColor" />
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 font-medium flex items-center justify-center gap-2 border border-white/5 transition-colors"
                        >
                            <Maximize2 size={16} /> Tam Ekran Yap
                        </button>
                    </div>

                    <div className="mt-8 text-center text-white/20 text-xs tracking-widest uppercase">
                        v3.1.2 Dudiko OS
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
