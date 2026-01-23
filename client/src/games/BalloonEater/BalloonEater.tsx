'use client';

import React, { useEffect, useRef, useState } from 'react';
import TouchController from '../../components/mobile/TouchController';

interface Entity {
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
    name?: string;
}

export default function BalloonEater() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Game State in Refs for 60fps stability
    const playerRef = useRef<Entity>({
        id: 'me',
        x: 0,
        y: 0,
        radius: 20,
        color: '#22d3ee',
        name: 'Sen'
    });

    const foodsRef = useRef<Entity[]>([]);
    const joystickRef = useRef({ x: 0, y: 0 });
    const keysRef = useRef<Record<string, boolean>>({});
    const requestRef = useRef<number | null>(null);

    // React State only for HUD
    const [score, setScore] = useState(0);
    const worldSize = 3000;

    useEffect(() => {
        console.log("BalloonEater: Initializing Game Engine...");

        // Spawn initial food
        const colors = ['#f87171', '#4ade80', '#60a5fa', '#fbbf24', '#c084fc', '#2dd4bf'];
        foodsRef.current = Array.from({ length: 150 }).map((_, i) => ({
            id: `food-${i}`,
            x: (Math.random() - 0.5) * worldSize,
            y: (Math.random() - 0.5) * worldSize,
            radius: 4 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));

        const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const gameLoop = () => {
            const player = playerRef.current;
            const joystick = joystickRef.current;
            const keys = keysRef.current;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // 1. Update Physics
            let moveX = joystick.x;
            let moveY = -joystick.y;

            if (keys['ArrowLeft'] || keys['KeyA']) moveX = -1;
            if (keys['ArrowRight'] || keys['KeyD']) moveX = 1;
            if (keys['ArrowUp'] || keys['KeyW']) moveY = -1;
            if (keys['ArrowDown'] || keys['KeyS']) moveY = 1;

            const speed = 6 * (20 / player.radius); // Balance speed vs size
            player.x = Math.max(-worldSize / 2, Math.min(worldSize / 2, player.x + moveX * speed));
            player.y = Math.max(-worldSize / 2, Math.min(worldSize / 2, player.y + moveY * speed));

            // Collision Detection
            let collided = false;
            foodsRef.current = foodsRef.current.filter(f => {
                const dist = Math.hypot(player.x - f.x, player.y - f.y);
                if (dist < player.radius) {
                    collided = true;
                    return false;
                }
                return true;
            });

            if (collided) {
                player.radius += 0.2;
                setScore(Math.floor((player.radius - 20) * 10));

                // Replenish food
                while (foodsRef.current.length < 150) {
                    foodsRef.current.push({
                        id: `food-${Date.now()}-${Math.random()}`,
                        x: (Math.random() - 0.5) * worldSize,
                        y: (Math.random() - 0.5) * worldSize,
                        radius: 4 + Math.random() * 6,
                        color: colors[Math.floor(Math.random() * colors.length)]
                    });
                }
            }

            // 2. Render
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);

            // Draw Bounds
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 10;
            ctx.strokeRect(-worldSize / 2, -worldSize / 2, worldSize, worldSize);

            // Draw Grid
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1;
            for (let i = -worldSize / 2; i <= worldSize / 2; i += 200) {
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
            foodsRef.current.forEach(f => {
                ctx.fillStyle = f.color;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Player
            ctx.shadowBlur = 20;
            ctx.shadowColor = player.color;
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Player Label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(player.name || '', player.x, player.y - player.radius - 12);

            ctx.restore();
            requestRef.current = requestAnimationFrame(gameLoop);
        };

        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        requestRef.current = requestAnimationFrame(gameLoop);

        return () => {
            console.log("BalloonEater: Cleaning up...");
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#020617]">
            <canvas ref={canvasRef} className="block" />

            {/* Minimal HUD */}
            <div className="absolute top-6 left-6 flex items-center gap-6 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex flex-col min-w-[120px]">
                    <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase mb-1">SKOR</span>
                    <span className="text-white text-3xl font-black italic">{score}</span>
                </div>
            </div>

            <div className="absolute top-6 right-6 pointer-events-none opacity-40">
                <div className="text-right text-white/50 text-[10px] font-bold uppercase tracking-widest">
                    HASD / OKLAR : HAREKET
                </div>
            </div>

            <TouchController
                onMove={(data) => { joystickRef.current = data; }}
                actions={['Boost']}
                onAction={(a) => console.log('Action:', a)}
            />
        </div>
    );
}
