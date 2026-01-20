'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '@/stores/socketStore';
import { ArrowUp, Zap, Target } from 'lucide-react';

export default function MobileControls() {
    const setJoystickData = useSocketStore((state) => state.setJoystickData);
    const [stickOrigin, setStickOrigin] = useState(null);
    const [stickPos, setStickPos] = useState({ x: 0, y: 0 });

    // Joystick Logic
    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        // Only trigger on Left Half of screen
        if (touch.clientX < window.innerWidth / 2) {
            // Clamp Position to avoid clipping
            const padding = 70; // Half of joystick size + margin
            let originX = touch.clientX;
            let originY = touch.clientY;

            if (originX < padding) originX = padding;
            if (originY < padding) originY = padding;
            if (originY > window.innerHeight - padding) originY = window.innerHeight - padding;

            setStickOrigin({ x: originX, y: originY });
            setStickPos({ x: 0, y: 0 });
        }
    };

    const handleTouchMove = useCallback((e) => {
        if (!stickOrigin) return;
        const touch = e.touches[0];
        const dx = touch.clientX - stickOrigin.x;
        const dy = touch.clientY - stickOrigin.y;

        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 50;
        const scale = dist > maxDist ? maxDist / dist : 1;

        const finalX = dx * scale;
        const finalY = dy * scale;

        setStickPos({ x: finalX, y: finalY });

        // Update Game State (Normalized -1 to 1)
        setJoystickData({
            x: finalX / maxDist,
            y: finalY / maxDist
        });
    }, [stickOrigin, setJoystickData]);

    const handleTouchEnd = useCallback(() => {
        setStickOrigin(null);
        setStickPos({ x: 0, y: 0 });
        setJoystickData({ x: 0, y: 0 });
    }, [setJoystickData]);

    // Cleanup listeners on unmount
    useEffect(() => {
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchMove, handleTouchEnd]);

    const handleAction = (key, val) => {
        setJoystickData(prev => ({ ...prev, [key]: val }));
    };

    return (
        <div
            className="fixed inset-0 z-[500] pointer-events-none select-none touch-none"
            onTouchStart={handleTouchStart}
        >
            {/* DYNAMIC JOYSTICK UI */}
            <AnimatePresence>
                {stickOrigin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute w-32 h-32 rounded-full border-4 border-white/50 bg-white/30 backdrop-blur-md flex items-center justify-center translate-x-[-50%] translate-y-[-50%]"
                        style={{ left: stickOrigin.x, top: stickOrigin.y }}
                    >
                        <motion.div
                            className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center border-4 border-blue-400"
                            style={{ x: stickPos.x, y: stickPos.y }}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500 opacity-80" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ACTION BUTTONS (RIGHT SIDE) */}
            <div className="absolute bottom-10 right-10 flex flex-col items-end gap-6 pointer-events-auto">
                <div className="flex gap-4">
                    {/* INTERACT / SHOOT */}
                    <button
                        onPointerDown={() => handleAction('action', true)}
                        onPointerUp={() => handleAction('action', false)}
                        className="w-20 h-20 rounded-full glass border-2 border-princess-gold flex items-center justify-center text-princess-gold shadow-lg shadow-yellow-500/20 active:scale-90 transition-all"
                    >
                        <Zap size={36} fill="currentColor" />
                    </button>

                    {/* AIM / TARGET */}
                    <button
                        onPointerDown={() => handleAction('aim', true)}
                        onPointerUp={() => handleAction('aim', false)}
                        className="w-20 h-20 rounded-full glass border-2 border-white/50 flex items-center justify-center text-white active:scale-90 transition-all"
                    >
                        <Target size={36} />
                    </button>
                </div>

                {/* GIANT JUMP BUTTON */}
                <button
                    onPointerDown={() => handleAction('jump', true)}
                    onPointerUp={() => handleAction('jump', false)}
                    className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-xl border-4 border-white/60 flex items-center justify-center text-white shadow-2xl active:scale-75 transition-all"
                    style={{ transform: 'rotate(-10deg)' }}
                >
                    <ArrowUp size={48} strokeWidth={3} />
                </button>
            </div>

            {/* Visual Guide for Kids */}
            {!stickOrigin && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-20 left-20 text-white/40 font-bold pointer-events-none"
                >
                    👈 BURADAN YÖNET
                </motion.div>
            )}
        </div>
    );
}
