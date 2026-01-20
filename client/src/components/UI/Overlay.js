'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '@/stores/socketStore';
import { LogOut, Coins, MessageCircle, ShoppingBag, Map as MapIcon, HelpCircle } from 'lucide-react';

import Chat from '../game/Chat';

export default function Overlay() {
    const { myName, coins, currentWorld, setWorld, notifications } = useSocketStore();
    const [chatOpen, setChatOpen] = useState(false);

    const worldName = {
        town: 'Prenses Meydanı 🏰',
        school: 'Prenses Akademisi 🏫',
        race: 'Yarış Parkuru 🏎️',
        candy: 'Şeker Diyarı 🍭'
    }[currentWorld] || 'Ana Merkez';

    return (
        <div className="fixed inset-0 z-[600] pointer-events-none flex flex-col justify-between p-4 md:p-8">
            {/* TOP BAR */}
            <div className="flex justify-between items-start">
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-4"
                >
                    {/* Player Info Card */}
                    <div className="glass px-6 py-3 rounded-[25px] flex items-center gap-4 pointer-events-auto border-2 border-white/50">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-princess-pink to-princess-gold border-2 border-white flex items-center justify-center text-white text-xl font-bold">
                            {myName?.[0] || 'P'}
                        </div>
                        <div>
                            <div className="text-princess-hot font-black text-lg leading-none">{myName}</div>
                            <div className="text-pink-400 text-xs font-bold uppercase tracking-wider">Acemi Prenses</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-end gap-3 pointer-events-auto"
                >
                    {/* Exit Button */}
                    <button
                        onClick={() => setWorld('hub')}
                        className="glass px-6 py-3 rounded-2xl flex items-center gap-2 text-red-500 font-black hover:bg-red-50 transition-colors"
                    >
                        AYRIL <LogOut size={20} />
                    </button>

                    {/* Currency Display */}
                    <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-2xl flex items-center gap-3 border border-princess-gold/30 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                        <Coins className="text-princess-gold animate-spin-slow" size={24} />
                        <span className="text-princess-gold font-black text-2xl">{coins}</span>
                    </div>

                    {/* World Tag */}
                    <div className="glass px-4 py-1.5 rounded-full text-princess-hot font-bold text-sm border-white/80">
                        {worldName}
                    </div>
                </motion.div>
            </div>

            {/* NOTIFICATIONS (Floating side) */}
            <div className="absolute top-32 left-8 flex flex-col gap-2 w-64 pointer-events-none">
                <AnimatePresence>
                    {(notifications || []).map((note) => (
                        <motion.div
                            key={note.id}
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            className="glass px-4 py-2 rounded-xl text-sm font-bold border-l-4 border-l-princess-gold text-princess-dark"
                        >
                            {note.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* BOTTOM BAR */}
            <div className="flex justify-between items-end">
                {/* Left Controls (Chat & Map) */}
                <div className="flex items-center gap-4 pointer-events-auto">
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className={`w-16 h-16 rounded-[22px] flex items-center justify-center transition-all ${chatOpen ? 'bg-princess-hot text-white' : 'glass text-princess-hot'}`}
                    >
                        <MessageCircle size={32} />
                    </button>

                    <button className="w-16 h-16 rounded-[22px] glass flex items-center justify-center text-blue-500">
                        <MapIcon size={32} />
                    </button>
                </div>

                {/* Right Controls (Action Hints / Menu) */}
                <div className="pointer-events-auto flex gap-4">
                    <button className="w-16 h-16 rounded-[22px] glass flex items-center justify-center text-purple-600 bg-purple-50/30 border-purple-200">
                        <ShoppingBag size={32} />
                    </button>
                    <button className="w-16 h-16 rounded-[22px] glass flex items-center justify-center text-princess-hot border-princess-pink/30">
                        <HelpCircle size={32} />
                    </button>
                </div>
            </div>

            {/* CHAT OVERLAY (MINIMAL) */}
            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: '30vh', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pointer-events-auto glass-dark mx-auto w-full max-w-xl mb-4 rounded-[30px] overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-white/10 text-white font-bold text-center">Prenses Sohbet ✨</div>
                        <Chat />
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 4s linear infinite;
                }
            `}</style>
        </div>
    );
}
