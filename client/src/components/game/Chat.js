'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '@/stores/socketStore';
import { Send } from 'lucide-react';

export default function Chat() {
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]);
    const socket = useSocketStore((state) => state.socket);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;
        const handleMessage = (data) => {
            setHistory(prev => [...prev, { ...data }].slice(-50));
        };
        const handleLoadChat = (chatData) => {
            setHistory(chatData);
        };
        socket.on('player-chat', handleMessage);
        socket.on('load-chat', handleLoadChat);
        return () => {
            socket.off('player-chat', handleMessage);
            socket.off('load-chat', handleLoadChat);
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socket) {
            socket.emit('chat', message);
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {history.length === 0 ? (
                        <div className="text-center text-white/30 italic py-8">
                            Kimse henüz bir şey yazmadı... <br /> İlk mesajı sen gönder! ✨
                        </div>
                    ) : (
                        history.map((msg, i) => (
                            <motion.div
                                key={`${msg.time}-${i}`}
                                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                className="flex flex-col items-start"
                            >
                                <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-2 max-w-[90%]">
                                    <span className="text-princess-gold font-black text-xs uppercase block mb-0.5">
                                        {msg.name}
                                    </span>
                                    <span className="text-white font-medium">
                                        {msg.message}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-black/20 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-princess-pink transition-all"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Buraya yaz..."
                    onFocus={(e) => e.stopPropagation()} // Prevent game controls focus leak
                />
                <button
                    type="submit"
                    className="p-2 bg-princess-pink rounded-xl text-white active:scale-95 transition-all shadow-lg shadow-princess-pink/30"
                >
                    <Send size={20} />
                </button>
            </form>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
