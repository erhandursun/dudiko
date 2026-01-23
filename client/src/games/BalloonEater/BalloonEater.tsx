'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import TouchController from '../../components/mobile/TouchController';

interface Player {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    name: string;
}

interface Food {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
}

export default function BalloonEater() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [player, setPlayer] = useState<Player>({
        id: 'me',
        x: 0,
        y: 0,
        radius: 20,
        color: '#22d3ee',
        name: 'Player 1'
    });

    const [foods, setFoods] = useState<Food[]>([]);
    const [joystick, setJoystick] = useState({ x: 0, y: 0 });
    const requestRef = useRef<number>();
    const worldSize = 2000;

    // Initialize Food
    useEffect(() => {
        const initialFood: Food[] = Array.from({ length: 100 }).map((_, i) => ({
            id: `food-${i}`,
            x: (Math.random() - 0.5) * worldSize,
            y: (Math.random() - 0.5) * worldSize,
            radius: 5 + Math.random() * 5,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        }));
        setFoods(initialFood);
    }, []);

    const update = useCallback((time: number) => {
        setPlayer(prev => {
            const speed = 5 * (20 / prev.radius); // Slow down as you grow
            const newX = Math.max(-worldSize / 2, Math.min(worldSize / 2, prev.x + joystick.x * speed));
            const newY = Math.max(-worldSize / 2, Math.min(worldSize / 2, prev.y - joystick.y * speed));

            // Basic food collision
            setFoods(currentFood => {
                let collided = false;
                const remaining = currentFood.filter(f => {
                    const dist = Math.hypot(newX - f.x, newY - f.y);
                    if (dist < prev.radius) {
                        collided = true;
                        return false;
                    }
                    return true;
                });

                if (collided) {
                    // Respawn some food
                    if (remaining.length < 100) {
                        remaining.push({
                            id: `food-${Date.now()}`,
                            x: (Math.random() - 0.5) * worldSize,
                            y: (Math.random() - 0.5) * worldSize,
                            radius: 5 + Math.random() * 5,
                            color: `hsl(${Math.random() * 360}, 70%, 60%)`
                        });
                    }
                    // Increase player size slightly
                    prev.radius += 0.5;
                }
                return remaining;
            });

            return { ...prev, x: newX, y: newY };
        });

        requestRef.current = requestAnimationFrame(update);
    }, [joystick]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current!);
    }, [update]);

    // Canvas Rendering
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const draw = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Camera follow
            ctx.save();
            ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);

            // Draw Grid
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let i = -worldSize / 2; i <= worldSize / 2; i += 100) {
                ctx.beginPath();
                ctx.moveTo(i, -worldSize / 2);
                ctx.lineTo(i, worldSize / 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-worldSize / 2, i);
                ctx.lineTo(worldSize / 2, i);
                ctx.stroke();
            }

            // Draw Food
            foods.forEach(f => {
                ctx.fillStyle = f.color;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
                // Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = f.color;
                ctx.fill();
            });

            // Draw Player
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.fill();

            // Player Name Tag
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(player.name, player.x, player.y - player.radius - 10);

            ctx.restore();
            requestAnimationFrame(draw);
        };

        const animId = requestAnimationFrame(draw);
        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animId);
        };
    }, [player, foods]);

    return (
        <div className="relative w-full h-full overflow-hidden bg-[#0a0a0f]">
            <canvas ref={canvasRef} className="block" />

            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl pointer-events-none">
                <div className="text-cyan-400 font-black text-xs uppercase tracking-widest mb-1">SCORE</div>
                <div className="text-white text-2xl font-black">{Math.floor(player.radius - 20) * 10}</div>
            </div>

            <TouchController
                onMove={(data) => setJoystick(data)}
                actions={['Boost']}
                onAction={(a) => console.log('Action:', a)}
            />
        </div>
    );
}
