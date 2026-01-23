'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GAME_REGISTRY } from '@/registry/games';
import { Play, Users, Activity, Settings2 } from 'lucide-react';

interface PortalLobbyProps {
    onSelectGame: (gameId: string) => void;
    myName: string;
}

export default function PortalLobby({ onSelectGame, myName }: PortalLobbyProps) {
    const games = Object.values(GAME_REGISTRY);

    return (
        <div className="fixed inset-0 bg-[#020617] text-white overflow-y-auto overflow-x-hidden selection:bg-cyan-500/30">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,#1e293b,transparent)]" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <motion.div
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            DUDIKO PORTAL <span className="text-white/20 not-italic text-2xl font-normal ml-2 tracking-widest uppercase">v4.0</span>
                        </h1>
                        <p className="text-cyan-400/60 font-medium tracking-wide">HOŞ GELDİN, <span className="text-white font-bold">{myName.toUpperCase()}</span>. BİR MACERA SEÇ.</p>
                    </motion.div>

                    <div className="flex gap-4">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-3xl flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-full animate-pulse">
                                <Activity size={20} className="text-green-500" />
                            </div>
                            <div>
                                <div className="text-[10px] text-white/40 font-bold uppercase">SİSTEM DURUMU</div>
                                <div className="text-sm font-black text-green-500">OPTIMAL</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Hero / Featured Game */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-full h-[400px] rounded-[48px] overflow-hidden mb-12 group cursor-pointer border border-white/5"
                    onClick={() => onSelectGame('balloon-eater')}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/40 to-transparent z-10" />
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop")' }} />
                    <div className="absolute bottom-0 left-0 w-full p-12 z-20 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="inline-block px-4 py-1 bg-cyan-500 text-black text-[10px] font-black rounded-full mb-4 uppercase">ÖNE ÇIKAN</div>
                        <h2 className="text-5xl font-black mb-4 tracking-tighter italic">BALLOON EATER</h2>
                        <p className="text-lg text-white/60 max-w-xl mb-8 font-medium">Büyümek için ye, hayatta kalmak için kaç. Yeni nesil agar.io deneyimi şimdi mobilde!</p>
                        <button className="px-10 py-5 bg-white text-black font-black text-xl rounded-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            ŞİMDİ OYNA <Play fill="currentColor" />
                        </button>
                    </div>
                </motion.div>

                {/* Game Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {games.map((game, idx) => (
                        <motion.div
                            key={game.id}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            className="group relative h-[320px] rounded-[40px] overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer bg-white/5"
                            onClick={() => onSelectGame(game.id)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10" />
                            <div className="absolute top-4 right-4 z-20 flex gap-2">
                                <span className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-white/70 uppercase">
                                    {game.category}
                                </span>
                                {game.multiplayer && (
                                    <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                        MULTIPLAYER
                                    </span>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
                                <h3 className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors mb-2 italic tracking-tight">
                                    {game.title.toUpperCase()}
                                </h3>
                                <p className="text-white/50 text-xs font-medium leading-relaxed mb-4 line-clamp-2">
                                    {game.description}
                                </p>
                                <div className="flex items-center gap-4 text-white/30 group-hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                                    OYNA <Play size={14} fill="currentColor" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer / Stats */}
                <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex gap-12">
                        <div className="text-center md:text-left">
                            <div className="text-[10px] text-white/30 font-black uppercase mb-1">AKTİF OYUNCULAR</div>
                            <div className="text-2xl font-black text-cyan-400">1.284</div>
                        </div>
                        <div className="text-center md:text-left">
                            <div className="text-[10px] text-white/30 font-black uppercase mb-1">SUNUCU GECİKMESİ</div>
                            <div className="text-2xl font-black text-white">12MS</div>
                        </div>
                    </div>

                    <div className="text-center text-white/20 text-[10px] font-black tracking-[8px] italic uppercase">
                        ULTRA ENGINE x DUDIKO OS
                    </div>
                </div>
            </div>
        </div>
    );
}
