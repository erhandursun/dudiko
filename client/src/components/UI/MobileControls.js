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
    const fixedOrigin = { x: 144, y: window.innerHeight - 144 }; // Matches bottom-12 left-12 (48px*3 + offset?) - Let's calculate: bottom-12 is 3rem=48px. w-48 is 12rem=192px. Center is 48px + 192/2 = 144px.
    // Actually safe to just use dynamic checks or simplified logic.

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        // Check if touch is roughly within the joystick zone (bottom-left)
        // Zone center approx: x=100, y=ScreenHeight-100. Radius ~100.
        const zoneCenterRx = 100;
        const zoneCenterRy = window.innerHeight - 100;
        const dist = Math.sqrt(Math.pow(touch.clientX - zoneCenterRx, 2) + Math.pow(touch.clientY - zoneCenterRy, 2));

        if (dist < 150) { // Generous hit area
            setStickOrigin({ x: zoneCenterRx, y: zoneCenterRy });
            // No need to set StickPos here, it will update on move
        }
    };

    const handleTouchMove = useCallback((e) => {
        if (!stickOrigin) return;
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
            onTouchStart={handleTouchStart}
        >
            {/* FIXED JOYSTICK ZONE */}
            <div className="absolute bottom-12 left-12 w-48 h-48 rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-white/30" />
            </div>

            {/* ACTIVE JOYSTICK */}
            <AnimatePresence>
                {stickOrigin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute w-32 h-32 rounded-full border-4 border-blue-400/50 bg-blue-500/20 backdrop-blur-md flex items-center justify-center translate-x-[-50%] translate-y-[-50%]"
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
