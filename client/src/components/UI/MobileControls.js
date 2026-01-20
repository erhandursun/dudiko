'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '@/stores/socketStore';
import { ArrowUp, Zap, Target } from 'lucide-react';

export default function MobileControls() {
    const setJoystickData = useSocketStore((state) => state.setJoystickData);
    const [stickOrigin, setStickOrigin] = useState(null);
    const [stickPos, setStickPos] = useState({ x: 0, y: 0 });

    // Joystick Logic - FIXED ZONE MODE
    // Zone is at bottom-12 (48px) left-12 (48px). Width 48 (192px).
    // Center X = 48 + 192/2 = 144.
    // Center Y = window.innerHeight - (48 + 192/2) = window.innerHeight - 144.

    const handleTouchStart = (e) => {
        // Prevent default to stop scrolling/zooming/selection behaviors
        // e.preventDefault(); // React synthetic events might not need this if touch-action is none

        const zoneCenterX = 144;
        const zoneCenterY = window.innerHeight - 144;

        setStickOrigin({ x: zoneCenterX, y: zoneCenterY });
        // Start tracking
    };

    const handleTouchMove = useCallback((e) => {
        if (!stickOrigin) return;
        // We use the first touch changed or targettouches? 
        // Window listener gives us all touches. We just grab the first one.
        const touch = e.touches[0];

        // Calculate raw delta from Center
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
        >
            {/* FIXED JOYSTICK ZONE - INTERACTIVE */}
            <div
                className="absolute bottom-12 left-12 w-48 h-48 rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center pointer-events-auto touch-none"
                onTouchStart={handleTouchStart}
            >
                <div className="w-2 h-2 rounded-full bg-white/30" />
            </div>

            {/* ACTIVE JOYSTICK VISUAL */}
            <AnimatePresence>
                {stickOrigin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute w-32 h-32 rounded-full border-4 border-blue-400/50 bg-blue-500/20 backdrop-blur-md flex items-center justify-center translate-x-[-50%] translate-y-[-50%] pointer-events-none"
                        style={{ left: stickOrigin.x, top: stickOrigin.y }}
                    >
                        <motion.div
                            className="w-16 h-16 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center border-4 border-white"
                            style={{ x: stickPos.x, y: stickPos.y }}
                        >
                            <div className="w-4 h-4 rounded-full bg-white opacity-50" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Visual Guide Text */}
            <div className="absolute bottom-6 left-16 text-white/30 font-bold text-xs pointer-events-none uppercase tracking-widest">
                Hareket Alanı
            </div>
        </div>
    );
}
