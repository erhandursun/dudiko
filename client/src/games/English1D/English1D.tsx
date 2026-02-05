'use client';

import React, { useEffect, useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import { Trophy, Star, MessageCircle, User, LayoutDashboard, Users, Send, Smile, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WORD_BANK = [
    { en: 'RED', tr: 'KIRMIZI' },
    { en: 'BLUE', tr: 'MAVİ' },
    { en: 'GREEN', tr: 'YEŞİL' },
    { en: 'YELLOW', tr: 'SARI' },
    { en: 'BLACK', tr: 'SİYAH' },
    { en: 'WHITE', tr: 'BEYAZ' },
    { en: 'CAT', tr: 'KEDİ' },
    { en: 'DOG', tr: 'KÖPEK' },
    { en: 'BIRD', tr: 'KUŞ' },
    { en: 'FISH', tr: 'BALIK' },
    { en: 'ONE', tr: 'BİR' },
    { en: 'TWO', tr: 'İKİ' },
    { en: 'THREE', tr: 'ÜÇ' },
    { en: 'FOUR', tr: 'DÖRT' },
    { en: 'FIVE', tr: 'BEŞ' },
    { en: 'APPLE', tr: 'ELMA' },
    { en: 'BANANA', tr: 'MUZ' },
    { en: 'MILK', tr: 'SÜT' },
    { en: 'WATER', tr: 'SU' },
    { en: 'SCHOOL', tr: 'OKUL' },
    { en: 'BOOK', tr: 'KİTAP' },
    { en: 'PENCIL', tr: 'KALEM' },
    { en: 'CAR', tr: 'ARABA' },
    { en: 'BALL', tr: 'TOP' }
];

export default function English1D() {
    const [question, setQuestion] = useState(generateQuestion());
    const [choices, setChoices] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [message, setMessage] = useState('');
    const [isWrong, setIsWrong] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const myName = useSocketStore((state) => state.myName);
    const players = useSocketStore((state) => state.players) || {};
    const leaderboard = useSocketStore((state) => state.leaderboard) || [];
    const notifications = useSocketStore((state) => state.notifications) || [];
    const reportMathSolved = useSocketStore((state) => state.reportMathSolved); // Reusing math points for simplicity
    const sendChatMessage = useSocketStore((state) => state.sendChatMessage);
    const chatMessages = useSocketStore((state) => state.chatMessages) || [];

    // Calculate my rank
    const myRank = leaderboard.findIndex((p: any) => p.name === myName) + 1;

    // Motivational messages for kids
    const motivationalMessages = {
        correct: ['YES! 🎉', 'GREAT! 💪', 'SUPER! ⭐', 'PERFECT! ✨', 'AWESOME! 🏆'],
        wrong: ['TRY AGAIN! 💪', 'YOU CAN DO IT! 🎯', 'KEEP GOING! ⭐'],
        streak3: 'WORD MASTER! 👑',
        streak5: 'UNSTOPPABLE! 🚀',
        top3: 'TOP 3! 🏆🏆🏆'
    };

    const emojis = ['🎉', '🔥', '💯', '⭐', '👍', '💪', '🎯', '✨'];

    function generateQuestion() {
        // Pick random word
        const currentWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

        // Pick 3 wrong choices
        const wrongChoices = WORD_BANK
            .filter(w => w.tr !== currentWord.tr)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(w => w.tr);

        const allChoices = [currentWord.tr, ...wrongChoices].sort(() => Math.random() - 0.5);
        return {
            en: currentWord.en,
            tr: currentWord.tr,
            choices: allChoices
        };
    }

    useEffect(() => {
        const q = generateQuestion();
        setQuestion(q);
        setChoices(q.choices);
    }, []);

    const checkAnswer = (selected: string) => {
        if (selected === question.tr) {
            const newStreak = streak + 1;
            setStreak(newStreak);

            const points = 10 + (newStreak > 3 ? 5 : 0);
            setScore(prev => prev + points);
            reportMathSolved(points);

            setIsWrong(false);

            // Enhanced motivational messages
            let motivationMsg = motivationalMessages.correct[Math.floor(Math.random() * motivationalMessages.correct.length)];
            if (newStreak === 3) motivationMsg = motivationalMessages.streak3;
            if (newStreak >= 5) motivationMsg = motivationalMessages.streak5;
            if (myRank > 0 && myRank <= 3) {
                setTimeout(() => setMessage(motivationalMessages.top3), 800);
            }
            setMessage(motivationMsg);

            setTimeout(() => {
                const nextQ = generateQuestion();
                setQuestion(nextQ);
                setChoices(nextQ.choices);
                setMessage('');
            }, 600);
        } else {
            setStreak(0);
            setIsWrong(true);

            // Score penalty: -5 points, minimum 0
            const penalty = -5;
            setScore(prev => Math.max(0, prev + penalty));
            reportMathSolved(penalty);

            // Positive reinforcement for wrong answers
            const encouragement = motivationalMessages.wrong[Math.floor(Math.random() * motivationalMessages.wrong.length)];
            setMessage(`${encouragement} (-5)`);
            setTimeout(() => {
                setIsWrong(false);
                setMessage('');
            }, 800);
        }
    };

    const handleSendMessage = () => {
        if (chatMessage.trim()) {
            sendChatMessage(chatMessage);
            setChatMessage('');
            setShowEmojiPicker(false);
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setChatMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const onlinePlayerList = Object.values(players);

    return (
        <div className="flex flex-col h-[100dvh] bg-[#f0f9ff] font-sans overflow-hidden select-none pb-[140px]">
            {/* Header / Stats */}
            <div className="flex-none p-3 bg-white/80 backdrop-blur-md border-b border-blue-200 flex justify-between items-center shadow-sm z-30">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-md">
                        <Star fill="currentColor" size={20} />
                    </div>
                    <div>
                        <div className="text-[9px] text-blue-600 font-black uppercase tracking-widest opacity-50">PUANIN</div>
                        <div className="text-xl font-black text-blue-600 leading-none">{score}</div>
                    </div>
                </div>

                {/* Ranking Badge - Prominent Display */}
                {myRank > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl font-black text-sm shadow-lg ${myRank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                            myRank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                                myRank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900' :
                                    'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                            }`}
                    >
                        SEN: {myRank}. SIRADASIN! {myRank <= 3 ? '🏆' : '⭐'}
                    </motion.div>
                )}

                <div className="flex items-center gap-2">
                    {/* Live Players Bubble */}
                    <div className="hidden sm:flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-blue-100">
                        <Users size={14} className="text-blue-600" />
                        <span className="text-xs font-black text-blue-600">{onlinePlayerList.length}</span>
                    </div>

                    <div className="bg-orange-100 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-orange-200">
                        <span className="text-lg">🔥</span>
                        <span className="font-black text-orange-600 text-sm">{streak}</span>
                    </div>

                    <button
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                        className="p-2 bg-white rounded-xl border border-blue-200 text-blue-600 md:hidden"
                    >
                        <LayoutDashboard size={20} />
                    </button>
                </div>
            </div>

            {/* Online Players Banner (Horizontal Scroller) */}
            <div className="flex-none bg-white/40 border-b border-blue-100 px-4 py-2 overflow-hidden overflow-x-auto whitespace-nowrap hide-scrollbar">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">ÇEVRİMİÇİ:</span>
                    {onlinePlayerList.map((p: any, i: number) => (
                        <div key={i} className="inline-flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg border border-blue-100">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase">{p.name || 'Gezgin'}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                {/* Main Game Area */}
                <div className="flex-1 p-4 flex flex-col items-center justify-center gap-4 md:gap-8 relative overflow-hidden">
                    {/* Floating Ornaments */}
                    <div className="absolute top-10 left-10 text-4xl opacity-5 animate-pulse hidden md:block">🅰️</div>
                    <div className="absolute bottom-20 right-10 text-4xl opacity-5 animate-bounce hidden md:block">🅱️</div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-2">TÜRKÇESİ NE?</h2>
                        <div className="text-6xl sm:text-7xl md:text-9xl font-black text-blue-600 drop-shadow-sm flex items-center justify-center gap-2 sm:gap-4">
                            <span>{question.en}</span>
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
                                key={`${question.en}-${i}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => checkAnswer(choice)}
                                className={`p-6 sm:p-8 bg-white border-4 ${isWrong ? 'border-red-100' : 'border-blue-100'} rounded-[24px] sm:rounded-[32px] text-2xl sm:text-3xl font-black text-blue-600 shadow-lg hover:border-blue-400 active:bg-blue-50 transition-all uppercase`}
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
                    border-t md:border-t-0 md:border-l border-blue-100 
                    flex flex-col transition-transform duration-500 ease-in-out
                    ${showLeaderboard ? 'translate-y-0 h-[60vh]' : 'translate-y-full md:translate-y-0 md:h-full'}
                `}>
                    <div
                        className="flex-none p-2 flex justify-center md:hidden border-b border-blue-50"
                        onClick={() => setShowLeaderboard(false)}
                    >
                        <div className="w-12 h-1 bg-gray-300 rounded-full" />
                    </div>

                    {/* Success Feed */}
                    <div className="flex-none p-3 border-b border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="text-blue-400" size={14} />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">BAŞARI AKIŞI</span>
                        </div>
                        <div className="space-y-1.5 overflow-y-auto max-h-32 pr-1 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {notifications.map((notif: any, i: number) => (
                                    <motion.div
                                        key={notif.id || i}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="bg-white p-2.5 rounded-xl border-l-4 border-l-green-400 shadow-sm flex items-center gap-2"
                                    >
                                        <span className="text-[10px] font-bold text-blue-600 leading-tight">{notif.message}</span>
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
                                <Trophy className="text-yellow-500" size={16} />
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">PUAN SIRALAMASI</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                            {leaderboard.map((player: any, idx: number) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between p-2.5 rounded-xl ${player.name === myName ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-sm' : 'bg-white text-blue-600 border border-blue-100'}`}
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
                        <div className="mt-3 pt-3 border-t border-blue-100 flex items-center gap-2 flex-none">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-inner">
                                <User size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[8px] font-black text-blue-400 uppercase leading-none mb-0.5">BENİM ADIM</div>
                                <div className="text-xs font-black text-blue-600 truncate uppercase leading-none tracking-tighter">{myName}</div>
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

            {/* Fixed Bottom Chat Bar - Always Visible */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-blue-100 z-50 shadow-2xl">
                {/* Recent Messages Ticker */}
                <div className="px-4 py-1 overflow-x-auto whitespace-nowrap hide-scrollbar bg-blue-50 border-b border-blue-100">
                    <div className="flex gap-4 items-center flex-row-reverse justify-end min-w-full">
                        <MessageCircle size={12} className="text-blue-600 flex-shrink-0" />
                        {chatMessages.slice(-5).map((msg: any) => (
                            <div key={msg.id} className="inline-flex items-center gap-1 flex-shrink-0">
                                <span className="text-[9px] text-blue-600/60 font-black uppercase">{msg.name}:</span>
                                <span className="text-[10px] text-blue-600/80 font-bold">{msg.message}</span>
                            </div>
                        ))}
                        {chatMessages.length === 0 && (
                            <span className="text-[9px] text-gray-400 italic">Mesaj yazarak sohbete katıl!</span>
                        )}
                    </div>
                </div>

                {/* Emoji Picker - Compact */}
                <AnimatePresence>
                    {showEmojiPicker && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-3 py-2 flex gap-2 flex-wrap border-b border-blue-100 bg-white"
                        >
                            {emojis.map((emoji, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="text-xl hover:scale-125 transition-transform"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Chat Input */}
                <div className="px-3 py-2 flex gap-2 items-center">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 bg-blue-50 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                    >
                        <Smile size={14} />
                    </button>
                    <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value.slice(0, 50))}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Mesaj yaz..."
                        className="flex-1 px-3 py-2 rounded-xl border border-blue-200 text-base focus:outline-none focus:border-blue-500 bg-white"
                        maxLength={50}
                        style={{ fontSize: '16px' }}
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl text-white hover:shadow-lg transition-all flex-shrink-0"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #93c5fd;
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
