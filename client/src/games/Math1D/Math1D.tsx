'use client';

import React, { useEffect, useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import { Trophy, Star, MessageCircle, User, LayoutDashboard, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Math1D() {
    const [question, setQuestion] = useState(generateQuestion());
    const [choices, setChoices] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [message, setMessage] = useState('');
    const [isWrong, setIsWrong] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const myName = useSocketStore((state) => state.myName);
    const players = useSocketStore((state) => state.players) || {};
    const leaderboard = useSocketStore((state) => state.leaderboard) || [];
    const notifications = useSocketStore((state) => state.notifications) || [];
    const reportMathSolved = useSocketStore((state) => state.reportMathSolved);

    function generateQuestion() {
        const tables = [1, 2, 3];
        const table = tables[Math.floor(Math.random() * tables.length)];
        const multiplier = Math.floor(Math.random() * 10) + 1;
        const answer = table * multiplier;

        const wrongChoices: number[] = [];
        while (wrongChoices.length < 3) {
            const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
            const wrong = answer + offset;
            if (wrong !== answer && wrong > 0 && !wrongChoices.includes(wrong)) {
                wrongChoices.push(wrong);
            }
        }

        const allChoices = [answer, ...wrongChoices].sort(() => Math.random() - 0.5);
        return { table, multiplier, answer, choices: allChoices };
    }

    useEffect(() => {
        const q = generateQuestion();
        setQuestion(q);
        setChoices(q.choices);
    }, []);

    const checkAnswer = (selected: number) => {
        if (selected === question.answer) {
            const newStreak = streak + 1;
            setStreak(newStreak);

            const points = 10 + (newStreak > 3 ? 5 : 0);
            setScore(prev => prev + points);
            reportMathSolved(points);

            setIsWrong(false);
            setMessage('DOĞRU! 🎉');

            setTimeout(() => {
                const nextQ = generateQuestion();
                setQuestion(nextQ);
                setChoices(nextQ.choices);
                setMessage('');
            }, 600);
        } else {
            setStreak(0);
            setIsWrong(true);
            setMessage('TEKRAR DENE! ❌');
            setTimeout(() => {
                setIsWrong(false);
                setMessage('');
            }, 800);
        }
    };

    const onlinePlayerList = Object.values(players);

    return (
        <div className="flex flex-col h-[100dvh] bg-[#fdf2f8] font-sans overflow-hidden select-none">
            {/* Header / Stats */}
            <div className="flex-none p-3 bg-white/80 backdrop-blur-md border-b border-princess-pink/20 flex justify-between items-center shadow-sm z-30">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-princess-pink to-princess-hot flex items-center justify-center text-white shadow-md">
                        <Star fill="currentColor" size={20} />
                    </div>
                    <div>
                        <div className="text-[9px] text-princess-hot font-black uppercase tracking-widest opacity-50">PUANIN</div>
                        <div className="text-xl font-black text-princess-hot leading-none">{score}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Live Players Bubble */}
                    <div className="hidden sm:flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-princess-pink/10">
                        <Users size={14} className="text-princess-hot" />
                        <span className="text-xs font-black text-princess-hot">{onlinePlayerList.length}</span>
                    </div>

                    <div className="bg-orange-100 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-orange-200">
                        <span className="text-lg">🔥</span>
                        <span className="font-black text-orange-600 text-sm">{streak}</span>
                    </div>

                    <button
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                        className="p-2 bg-white rounded-xl border border-princess-pink/20 text-princess-hot md:hidden"
                    >
                        <LayoutDashboard size={20} />
                    </button>
                </div>
            </div>

            {/* Online Players Banner (Horizontal Scroller) */}
            <div className="flex-none bg-white/40 border-b border-princess-pink/5 px-4 py-2 overflow-hidden overflow-x-auto whitespace-nowrap hide-scrollbar">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-princess-hot/40 uppercase tracking-widest">ÇEVRİMİÇİ:</span>
                    {onlinePlayerList.map((p: any, i) => (
                        <div key={i} className="inline-flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg border border-princess-pink/5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-princess-hot/80 uppercase">{p.name || 'Gezgin'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Main Game Area */}
                <div className="flex-1 p-4 flex flex-col items-center justify-center gap-4 md:gap-8 relative overflow-hidden">
                    {/* Floating Ornaments */}
                    <div className="absolute top-10 left-10 text-4xl opacity-5 animate-pulse hidden md:block">✨</div>
                    <div className="absolute bottom-20 right-10 text-4xl opacity-5 animate-bounce hidden md:block">💎</div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <h2 className="text-xs font-black text-princess-hot/40 uppercase tracking-[0.2em] mb-2">NE KADAR EDER?</h2>
                        <div className="text-6xl sm:text-7xl md:text-9xl font-black text-princess-hot drop-shadow-sm flex items-center justify-center gap-2 sm:gap-4">
                            <span>{question.table}</span>
                            <span className="text-3xl sm:text-4xl md:text-6xl text-princess-pink">×</span>
                            <span>{question.multiplier}</span>
                        </div>
                    </motion.div>

                    <div className="h-8 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -10, opacity: 0 }}
                                    className={`text-xl sm:text-2xl font-black ${isWrong ? 'text-red-500' : 'text-green-500'}`}
                                >
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-sm px-2">
                        {choices.map((choice, i) => (
                            <motion.button
                                key={`${question.table}-${question.multiplier}-${i}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => checkAnswer(choice)}
                                className={`p-6 sm:p-8 bg-white border-4 ${isWrong ? 'border-red-100' : 'border-princess-pink/10'} rounded-[24px] sm:rounded-[32px] text-3xl sm:text-4xl font-black text-princess-hot shadow-lg hover:border-princess-pink active:bg-princess-pink/5 transition-all`}
                            >
                                {choice}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Feed and Leaderboard */}
                <div className={`
                    fixed inset-x-0 bottom-0 md:relative md:inset-auto z-40 
                    md:w-72 bg-white/95 backdrop-blur-2xl md:bg-white/50 
                    border-t md:border-t-0 md:border-l border-princess-pink/20 
                    flex flex-col transition-transform duration-500 ease-in-out
                    ${showLeaderboard ? 'translate-y-0 h-[60vh]' : 'translate-y-full md:translate-y-0 md:h-full'}
                `}>
                    <div
                        className="flex-none p-2 flex justify-center md:hidden border-b border-princess-pink/5"
                        onClick={() => setShowLeaderboard(false)}
                    >
                        <div className="w-12 h-1 bg-gray-300 rounded-full" />
                    </div>

                    {/* Success Feed */}
                    <div className="flex-none p-3 border-b border-princess-pink/10">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="text-princess-hot/50" size={14} />
                            <span className="text-[10px] font-black text-princess-hot/50 uppercase tracking-widest">BAŞARI AKIŞI</span>
                        </div>
                        <div className="space-y-1.5 overflow-y-auto max-h-32 pr-1 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {notifications.map((notif: any, i) => (
                                    <motion.div
                                        key={notif.id || i}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="bg-white p-2.5 rounded-xl border-l-4 border-l-green-400 shadow-sm flex items-center gap-2"
                                    >
                                        <span className="text-[10px] font-bold text-princess-hot/90 leading-tight">{notif.message}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {notifications.length === 0 && (
                                <div className="text-[9px] text-center text-gray-400 mt-2 italic tracking-tighter uppercase font-black">Soruları bilmeye başla!</div>
                            )}
                        </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="flex-1 p-3 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-3 flex-none">
                            <div className="flex items-center gap-2">
                                <Trophy className="text-princess-gold" size={16} />
                                <span className="text-[10px] font-black text-princess-hot uppercase tracking-widest">PUAN SIRALAMASI</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            {leaderboard.map((player: any, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between p-2.5 rounded-xl ${player.name === myName ? 'bg-gradient-to-r from-princess-pink to-princess-hot text-white shadow-sm' : 'bg-white text-princess-hot border border-princess-pink/5'}`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${player.name === myName ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className="font-black text-xs truncate uppercase tracking-tighter">{player.name}</span>
                                    </div>
                                    <div className="font-black text-xs px-2 py-0.5 rounded-lg bg-black/5">
                                        {player.score} <span className="text-[8px] opacity-60 px-0.5">P</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Current Player Status Bar */}
                        <div className="mt-3 pt-3 border-t border-princess-pink/10 flex items-center gap-2 flex-none">
                            <div className="w-8 h-8 rounded-full bg-princess-pink flex items-center justify-center text-white shadow-inner">
                                <User size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[8px] font-black text-princess-pink uppercase leading-none mb-0.5">BENİM ADIM</div>
                                <div className="text-xs font-black text-princess-hot truncate uppercase leading-none tracking-tighter">{myName}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overlay for mobile drawer */}
                {showLeaderboard && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLeaderboard(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                    />
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #fbcfe8;
                    border-radius: 10px;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
