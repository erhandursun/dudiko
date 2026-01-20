'use client';

import React, { useEffect, useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayerList() {
    const players = useSocketStore((state) => state.players);
    const myId = useSocketStore((state) => state.socket?.id);
    const [playerArray, setPlayerArray] = useState([]);

    useEffect(() => {
        // Convert Map/Object to Array and sort (Me first, then alphabetical)
        const list = Object.entries(players).map(([id, data]) => ({
            id,
            ...data
        }));

        list.sort((a, b) => {
            if (a.id === myId) return -1;
            if (b.id === myId) return 1;
            return a.name.localeCompare(b.name);
        });

        setPlayerArray(list);
    }, [players, myId]);

    return (
        <div className="absolute top-24 left-4 z-40 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-48 shadow-xl pointer-events-none select-none">
            <h3 className="text-princess-gold font-black text-xs uppercase mb-3 tracking-widest flex items-center gap-2">
                <span>👥</span> Oyuncular ({playerArray.length})
            </h3>
            <div className="space-y-2">
                <AnimatePresence>
                    {playerArray.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/20"
                                style={{ backgroundColor: p.color }}
                            />
                            <span className={`text-sm font-bold truncate ${p.id === myId ? 'text-princess-pink' : 'text-white/80'}`}>
                                {p.name} {p.id === myId && '(Sen)'}
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
