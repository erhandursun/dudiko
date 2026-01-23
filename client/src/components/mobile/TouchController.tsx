'use client';

import React, { useEffect, useRef, useState } from 'react';
import nipplejs from 'nipplejs';

interface TouchControllerProps {
    onMove?: (data: { x: number; y: number }) => void;
    onAction?: (action: string) => void;
    actions?: string[];
}

export default function TouchController({ onMove, onAction, actions = ['Action'] }: TouchControllerProps) {
    const joystickRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isMobile || !joystickRef.current) return;

        const manager = nipplejs.create({
            zone: joystickRef.current,
            mode: 'static',
            position: { left: '80px', bottom: '80px' },
            color: 'cyan',
            size: 120,
        });

        manager.on('move', (evt, data) => {
            if (onMove) {
                // Normalize to -1 to 1 range
                const x = data.vector.x;
                const y = data.vector.y;
                onMove({ x, y });
            }
        });

        manager.on('end', () => {
            if (onMove) onMove({ x: 0, y: 0 });
        });

        return () => {
            manager.destroy();
        };
    }, [isMobile, onMove]);

    if (!isMobile) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[2000] select-none">
            {/* Joystick Zone */}
            <div
                ref={joystickRef}
                className="absolute bottom-0 left-0 w-1/2 h-1/2 pointer-events-auto"
                style={{ touchAction: 'none' }}
            />

            {/* Actions Zone */}
            <div className="absolute bottom-10 right-10 flex flex-col gap-4 pointer-events-auto">
                {actions.map((action) => (
                    <button
                        key={action}
                        onTouchStart={() => onAction && onAction(action)}
                        className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 font-bold active:scale-90 active:bg-cyan-400/20 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    >
                        {action.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>
    );
}
