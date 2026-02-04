'use client';

import React, { useEffect, useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import { Trophy, Star, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Math1D() {
    const [question, setQuestion] = useState(generateQuestion());
    const [choices, setChoices] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [message, setMessage] = useState('');
    const [isWrong, setIsWrong] = useState(false);

    const myName = useSocketStore((state) => state.myName);
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

    return (
        <div className="flex flex-col h-full bg-[#fdf2f8] font-sans overflow-hidden">
            {/* Header / Stats */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-b border-princess-pink/20 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-princess-pink to-princess-gold flex items-center justify-center text-white shadow-lg">
                        <Star fill="currentColor" size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] text-princess-hot font-black uppercase tracking-widest opacity-50">PUANIN</div>
                        <div className="text-2xl font-black text-princess-hot leading-none">{score}</div>
                    </div>
                </div>

                <div className="bg-orange-100 px-4 py-2 rounded-2xl flex items-center gap-2 border border-orange-200">
                    <span className="text-2xl">🔥</span>
                    <span className="font-black text-orange-600">{streak} SERİ</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Main Game Area */}
                <div className="flex-1 p-6 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
                    {/* Floating Ornaments */}
                    <div className="absolute top-10 left-10 text-4xl opacity-10 animate-pulse">✨</div>
                    <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-bounce">💎</div>
                    <div className="absolute top-1/2 left-4 text-3xl opacity-10 rotate-12">⭐</div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <h2 className="text-xl font-black text-princess-hot/50 uppercase tracking-[0.2em] mb-2">SORU GELDİ!</h2>
                        <div className="text-7xl md:text-9xl font-black text-princess-hot drop-shadow-sm flex items-center gap-4">
                            <span>{question.table}</span>
                            <span className="text-4xl md:text-6xl text-princess-pink">×</span>
                            <span>{question.multiplier}</span>
                        </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className={`text-3xl font-black ${isWrong ? 'text-red-500' : 'text-green-500'}`}
                            >
                                {message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        {choices.map((choice, i) => (
                            <motion.button
                                key={`${question.table}-${question.multiplier}-${i}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => checkAnswer(choice)}
                                className={`p-8 bg-white border-4 ${isWrong ? 'border-red-100' : 'border-princess-pink/20'} rounded-[32px] text-4xl font-black text-princess-hot shadow-xl hover:border-princess-pink transition-all`}
                            >
                                {choice}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Feed and Leaderboard */}
                <div className="w-full md:w-80 bg-white/50 backdrop-blur-xl border-t md:border-t-0 md:border-l border-princess-pink/20 flex flex-col overflow-hidden">
                    {/* Success Feed */}
                    <div className="p-4 border-b border-princess-pink/10">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageCircle className="text-princess-hot/50" size={18} />
                            <span className="text-xs font-black text-princess-hot/50 uppercase tracking-widest">GÜNCEL AKIŞ</span>
                        </div>
                        <div className="space-y-2 h-32 md:h-48 overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {notifications.map((notif: any, i: number) => (
                                    <motion.div
                                        key={notif.id || i}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="bg-white p-3 rounded-2xl shadow-sm border border-princess-pink/5 flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-princess-pink/10 flex items-center justify-center text-xs">✨</div>
                                        <span className="text-xs font-bold text-princess-hot/80">{notif.message}</span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {notifications.length === 0 && (
                                <div className="text-[10px] text-center text-gray-400 mt-4 italic">Bilenleri burada göreceksin...</div>
                            )}
                        </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="flex-1 p-4 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="text-princess-gold" size={18} />
                                <span className="text-xs font-black text-princess-hot uppercase tracking-widest">PUAN TABLOSU</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {leaderboard.map((player: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between p-3 rounded-2xl ${player.name === myName ? 'bg-gradient-to-r from-princess-pink to-princess-hot text-white shadow-md' : 'bg-white text-princess-hot border border-princess-pink/5'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${player.name === myName ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
                                            {idx + 1}
                                        </div>
                                        <span className="font-black truncate">{player.name}</span>
                                    </div>
                                    <div className="font-black px-3 py-1 rounded-xl bg-black/5 flex items-center gap-1">
                                        {player.score} <span className="text-[10px] opacity-60">P</span>
                                    </div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && (
                                <div className="text-center p-8 bg-black/5 rounded-3xl">
                                    <div className="text-3xl mb-2">👑</div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">İLK SEN BİL, KRAL OL!</div>
                                </div>
                            )}
                        </div>

                        {/* Current Player Status Bar */}
                        <div className="mt-4 pt-4 border-t border-princess-pink/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-princess-pink flex items-center justify-center text-white shadow-inner">
                                <User size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] font-black text-princess-pink uppercase leading-none mb-1">ŞU AN BURADASIN</div>
                                <div className="text-sm font-black text-princess-hot truncate uppercase">{myName}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #fbcfe8;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}
