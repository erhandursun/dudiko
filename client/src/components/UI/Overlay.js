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
        town: 'Kasaba Meydanı 🏰',
        school: 'Akademi 🏫',
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
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xl font-bold">
                            {myName?.[0] || 'O'}
                        </div>
                        <div>
                            <div className="text-princess-hot font-black text-lg leading-none">{myName}</div>
                            <div className="text-purple-600 text-xs font-bold uppercase tracking-wider">Yeni Maceracı</div>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT SIDE MENU (Compact) */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-auto">
                    {/* Top Row: Exit & Currency */}
                    <div className="flex items-center gap-2">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-princess-gold/30">
                            <Coins className="text-princess-gold" size={16} />
                            <span className="text-princess-gold font-black text-sm">{coins}</span>
                        </div>
                        <button
                            onClick={() => setWorld('hub')}
                            className="bg-red-500/80 p-2 rounded-full text-white shadow-lg active:scale-95"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>

                    {/* Second Row: Tools (Tiny) */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${chatOpen ? 'bg-princess-hot text-white' : 'bg-white/90 text-princess-hot'}`}
                        >
                            <MessageCircle size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-blue-500 shadow-lg">
                            <MapIcon size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-purple-600 shadow-lg">
                            <ShoppingBag size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-princess-hot shadow-lg">
                            <HelpCircle size={18} />
                        </button>
                    </div>

                    {/* World Tag (Mini) */}
                    <div className="bg-white/80 px-3 py-1 rounded-full text-princess-hot font-bold text-[10px] border border-white/50 self-end">
                        {worldName}
                    </div>
                </div>
            </div> {/* Closes TOP BAR */}

            {/* NOTIFICATIONS (Top Left - below player) */}
            <div className="absolute top-20 left-4 flex flex-col gap-2 w-48 pointer-events-none">
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

            {/* CHAT OVERLAY (MINIMAL) */}
            <AnimatePresence>
                {chatOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: '30vh', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pointer-events-auto glass-dark mx-auto w-full max-w-xl mb-4 rounded-[30px] overflow-hidden flex flex-col"
                    >
                        <div className="p-4 border-b border-white/10 text-white font-bold text-center">Maceracı Sohbet ✨</div>
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
