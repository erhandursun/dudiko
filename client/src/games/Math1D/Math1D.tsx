'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';

interface Player {
    name: string;
    position: number;
    color: string;
}

export default function Math1D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [question, setQuestion] = useState(generateQuestion());
    const [choices, setChoices] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [message, setMessage] = useState('');
    const [playerPosition, setPlayerPosition] = useState(0);
    const [leaderboard, setLeaderboard] = useState<Player[]>([]);
    const [isStarted, setIsStarted] = useState(false);

    const myName = useSocketStore((state) => state.myName);
    const myColor = useSocketStore((state) => state.myColor);
    const reportMathSolved = useSocketStore((state) => state.reportMathSolved);

    const FINISH_LINE = 100;
    const MOVE_AMOUNT = 8;

    function generateQuestion() {
        const tables = [1, 2, 3];
        const table = tables[Math.floor(Math.random() * tables.length)];
        const multiplier = Math.floor(Math.random() * 10) + 1; // 1-10
        const answer = table * multiplier;

        // Generate 4 choices (1 correct, 3 wrong)
        const wrongChoices: number[] = [];
        while (wrongChoices.length < 3) {
            const wrong = answer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1);
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

    useEffect(() => {
        if (!isStarted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#fdf2f8');
            gradient.addColorStop(1, '#fce7f3');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw track
            const trackY = canvas.height / 2;
            const trackWidth = canvas.width * 0.8;
            const trackX = canvas.width * 0.1;

            // Track background
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(trackX, trackY - 30, trackWidth, 60);

            // Track border
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 3;
            ctx.strokeRect(trackX, trackY - 30, trackWidth, 60);

            // Progress markers (every 20%)
            ctx.fillStyle = '#6b7280';
            ctx.font = 'bold 12px sans-serif';
            for (let i = 0; i <= 5; i++) {
                const x = trackX + (trackWidth * i) / 5;
                ctx.fillRect(x - 1, trackY - 35, 2, 70);
                ctx.fillText(`${i * 20}%`, x - 15, trackY + 55);
            }

            // Finish line
            ctx.fillStyle = '#10b981';
            ctx.fillRect(trackX + trackWidth - 5, trackY - 40, 10, 80);
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('🏁', trackX + trackWidth - 10, trackY - 45);

            // Draw player
            const playerX = trackX + (trackWidth * playerPosition) / FINISH_LINE;
            
            // Player shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(playerX, trackY + 35, 15, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Player avatar
            ctx.fillStyle = myColor || '#ec4899';
            ctx.beginPath();
            ctx.arc(playerX, trackY, 20, 0, Math.PI * 2);
            ctx.fill();

            // Player outline
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Player name
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(myName || 'Sen', playerX, trackY - 30);

            // Score display
            ctx.textAlign = 'left';
            ctx.fillStyle = '#831843';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText(`Puan: ${score}`, 20, 30);

            if (streak > 0) {
                ctx.fillStyle = '#ea580c';
                ctx.fillText(`🔥 Seri: ${streak}`, 20, 55);
            }
        };

        draw();
    }, [playerPosition, score, streak, myName, myColor, isStarted]);

    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = 300;
        }
    };

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const checkAnswer = (selectedAnswer: number) => {
        if (selectedAnswer === question.answer) {
            const newStreak = streak + 1;
            setStreak(newStreak);

            const points = 10 + newStreak * 2;
            setScore(score + points);
            reportMathSolved(points);

            const newPosition = Math.min(playerPosition + MOVE_AMOUNT, FINISH_LINE);
            setPlayerPosition(newPosition);

            let winMsg = 'DOĞRU! 🌟';
            if (newStreak > 2) winMsg = 'HARİKA! 🔥';
            if (newStreak > 4) winMsg = 'EFSANE! 🚀';

            setMessage(`${winMsg} +${points} Puan`);

            // Check if won
            if (newPosition >= FINISH_LINE) {
                setMessage('🎉 KAZANDIN! Yarışı tamamladın! 🎉');
                setTimeout(() => {
                    // Add to leaderboard
                    const newLeaderboard = [...leaderboard, { name: myName, position: FINISH_LINE, color: myColor }];
                    newLeaderboard.sort((a, b) => b.position - a.position);
                    setLeaderboard(newLeaderboard.slice(0, 5));
                    
                    // Reset game
                    setPlayerPosition(0);
                    setScore(0);
                    setStreak(0);
                    setMessage('');
                }, 2000);
            }

            setTimeout(() => {
                setMessage('');
                const q = generateQuestion();
                setQuestion(q);
                setChoices(q.choices);
            }, 1000);
        } else {
            setStreak(0);
            const penalty = Math.max(0, playerPosition - 3);
            setPlayerPosition(penalty);
            setMessage('❌ Yanlış! Geri gittin!');
            setTimeout(() => setMessage(''), 1500);
        }
    };

    if (!isStarted) {
        return (
            <div className="relative w-full h-full bg-gradient-to-br from-pink-50 to-purple-100 flex flex-col items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <h1 className="text-5xl font-black text-princess-hot mb-4">
                        Matematik Yarışı 🎯
                    </h1>
                    <p className="text-xl text-princess-hot/70 font-bold mb-8">
                        1, 2 ve 3 çarpım tablolarını öğren ve yarışı kazan!
                    </p>
                    <button
                        onClick={() => setIsStarted(true)}
                        className="px-12 py-6 bg-gradient-to-r from-princess-pink to-princess-gold text-white font-black text-2xl rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                    >
                        BAŞLA! 🚀
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-gradient-to-br from-pink-50 to-purple-100 flex flex-col overflow-hidden">
            {/* Top HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-none z-20">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border-2 border-princess-pink">
                    <div className="text-xs text-princess-hot/60 font-bold uppercase">İlerleme</div>
                    <div className="text-2xl font-black text-princess-hot">{Math.round((playerPosition / FINISH_LINE) * 100)}%</div>
                </div>
            </div>

            {/* Canvas Track */}
            <div className="flex-1 flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full" />
            </div>

            {/* Question Panel */}
            <div className="bg-white/95 backdrop-blur-xl p-6 rounded-t-[48px] shadow-2xl border-t-4 border-princess-pink">
                {message && (
                    <div className={`text-center text-xl font-black mb-4 animate-pulse ${message.includes('❌') ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </div>
                )}

                <div className="text-center mb-6">
                    <div className="text-4xl font-black text-princess-hot mb-2">
                        {question.table} × {question.multiplier} = ?
                    </div>
                    <div className="text-sm text-princess-hot/60 font-bold">Doğru cevabı seç!</div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    {choices.map((choice, i) => (
                        <button
                            key={i}
                            onClick={() => checkAnswer(choice)}
                            className="p-6 bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-black text-3xl rounded-3xl shadow-lg hover:scale-105 active:scale-95 transition-all border-4 border-white"
                        >
                            {choice}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-lg border-2 border-princess-gold max-w-[200px]">
                    <div className="text-xs text-princess-hot uppercase font-black mb-2">🏆 Liderler</div>
                    {leaderboard.map((player, i) => (
                        <div key={i} className="text-xs font-bold text-princess-hot/70 flex items-center gap-2 mb-1">
                            <span>{i + 1}.</span>
                            <span className="truncate">{player.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
