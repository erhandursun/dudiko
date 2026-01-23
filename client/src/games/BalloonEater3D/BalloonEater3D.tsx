'use client';

import React, { useState, useRef, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars, Environment, Text, Float, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import TouchController from '../../components/mobile/TouchController';
import { Trophy, Palette, Play, Info, ArrowLeft } from 'lucide-react';

// --- CONSTANTS ---
const WORLD_SIZE = 100;
const INITIAL_RADIUS = 0.8;
const FOOD_COUNT = 150;
const GIFT_COUNT = 15;
const BOT_COUNT = 12;

interface Entity {
    id: string;
    position: THREE.Vector3;
    radius: number;
    color: string;
    type: 'player' | 'food' | 'gift' | 'bot';
    name?: string;
}

// --- SUB-COMPONENTS ---
function Ground() {
    return (
        <group rotation={[-Math.PI / 2, 0, 0]}>
            <mesh receiveShadow>
                <planeGeometry args={[WORLD_SIZE * 2, WORLD_SIZE * 2]} />
                <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.2} />
            </mesh>
            <Grid
                infiniteGrid
                fadeDistance={100}
                fadeStrength={5}
                cellSize={1}
                sectionSize={5}
                sectionColor="#312e81"
                cellColor="#1e1b4b"
                position={[0, 0, 0.01]}
            />
        </group>
    );
}

function Food({ position, color }: { position: THREE.Vector3; color: string }) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
        </mesh>
    );
}

function Gift({ position }: { position: THREE.Vector3 }) {
    return (
        <Float speed={3} rotationIntensity={3}>
            <mesh position={position} castShadow>
                <boxGeometry args={[0.8, 0.8, 0.8]} />
                <meshStandardMaterial color="#f43f5e" metalness={0.8} roughness={0.1} />
                <mesh scale={[1.1, 0.2, 1.1]}>
                    <boxGeometry args={[0.8, 0.8, 0.8]} />
                    <meshStandardMaterial color="#fbbf24" metalness={1} />
                </mesh>
                <mesh scale={[0.2, 1.1, 1.1]}>
                    <boxGeometry args={[0.8, 0.8, 0.8]} />
                    <meshStandardMaterial color="#fbbf24" metalness={1} />
                </mesh>
            </mesh>
        </Float>
    );
}

// --- MAIN GAME ENGINE ---
function GameEngine({
    joystick,
    playerColor,
    playerName,
    onStateUpdate,
    onExit
}: {
    joystick: { x: number; y: number };
    playerColor: string;
    playerName: string;
    onStateUpdate: (score: number, leader: Entity[]) => void;
    onExit: () => void;
}) {
    const { camera } = useThree();
    const playerMeshRef = useRef<THREE.Group>(null);
    const playerPhysics = useRef({
        radius: INITIAL_RADIUS,
        position: new THREE.Vector3(0, INITIAL_RADIUS, 0)
    });

    const [foods, setFoods] = useState<Entity[]>([]);
    const [gifts, setGifts] = useState<Entity[]>([]);
    const [bots, setBots] = useState<Entity[]>([]);
    const keys = useRef<Record<string, boolean>>({});

    // Initialize World
    useEffect(() => {
        const colors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#f87171'];

        setFoods(Array.from({ length: FOOD_COUNT }).map((_, i) => ({
            id: `f-${i}`,
            position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.4, (Math.random() - 0.5) * WORLD_SIZE),
            radius: 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'food'
        })));

        setGifts(Array.from({ length: GIFT_COUNT }).map((_, i) => ({
            id: `g-${i}`,
            position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.6, (Math.random() - 0.5) * WORLD_SIZE),
            radius: 0.8,
            color: '#f43f5e',
            type: 'gift'
        })));

        setBots(Array.from({ length: BOT_COUNT }).map((_, i) => ({
            id: `b-${i}`,
            position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.6, (Math.random() - 0.5) * WORLD_SIZE),
            radius: 0.8 + Math.random() * 2.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'bot',
            name: ['REX', 'CYBER', 'ZOD', 'NEON', 'VOID'][Math.floor(Math.random() * 5)]
        })));

        const kd = (e: KeyboardEvent) => keys.current[e.code] = true;
        const ku = (e: KeyboardEvent) => keys.current[e.code] = false;
        window.addEventListener('keydown', kd);
        window.addEventListener('keyup', ku);
        return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
    }, []);

    useFrame((state, delta) => {
        const player = playerPhysics.current;
        const mesh = playerMeshRef.current;
        if (!mesh) return;

        // 1. Movement Logic
        let mx = joystick.x;
        let mz = -joystick.y;
        if (keys.current['KeyA'] || keys.current['ArrowLeft']) mx = -1;
        if (keys.current['KeyD'] || keys.current['ArrowRight']) mx = 1;
        if (keys.current['KeyW'] || keys.current['ArrowUp']) mz = -1;
        if (keys.current['KeyS'] || keys.current['ArrowDown']) mz = 1;

        const speed = 20 * (1 / Math.sqrt(player.radius)) * delta;
        player.position.x = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, player.position.x + mx * speed));
        player.position.z = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, player.position.z + mz * speed));
        player.position.y = player.radius;

        // Sync Mesh
        mesh.position.copy(player.position);
        mesh.scale.setScalar(player.radius / INITIAL_RADIUS);

        // 2. Collision Detection (Optimized with a slight throttle if needed, but simple distance is fine now)
        setFoods(current => {
            let hits = 0;
            const next = current.filter(f => {
                if (player.position.distanceTo(f.position) < player.radius) {
                    hits++;
                    return false;
                }
                return true;
            });
            if (hits > 0) {
                player.radius += hits * 0.04;
                for (let i = 0; i < hits; i++) {
                    next.push({
                        id: `f-${Date.now()}-${i}`,
                        position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.4, (Math.random() - 0.5) * WORLD_SIZE),
                        radius: 0.3,
                        color: ['#60a5fa', '#34d399', '#f472b6', '#fbbf24'][Math.floor(Math.random() * 4)],
                        type: 'food'
                    });
                }
            }
            return next;
        });

        setGifts(current => {
            let hit = false;
            const next = current.filter(g => {
                if (player.position.distanceTo(g.position) < player.radius + 0.4) {
                    hit = true;
                    return false;
                }
                return true;
            });
            if (hit) {
                player.radius += 1.0;
                next.push({
                    id: `g-${Date.now()}`,
                    position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.6, (Math.random() - 0.5) * WORLD_SIZE),
                    radius: 0.8,
                    color: 'red',
                    type: 'gift'
                });
            }
            return next;
        });

        // 3. Bot Logic
        setBots(current => {
            const next = current.map(bot => {
                const time = state.clock.elapsedTime * 0.4;
                const seed = parseInt(bot.id.split('-')[1] || "0");
                bot.position.x += Math.sin(time + seed) * 0.1;
                bot.position.z += Math.cos(time + seed) * 0.1;
                bot.position.y = bot.radius;

                // Collision
                const dist = player.position.distanceTo(bot.position);
                if (player.radius > bot.radius * 1.1 && dist < player.radius) {
                    player.radius += bot.radius * 0.4;
                    bot.position.set((Math.random() - 0.5) * WORLD_SIZE, bot.radius, (Math.random() - 0.5) * WORLD_SIZE);
                    bot.radius = 0.8 + Math.random() * 3;
                } else if (bot.radius > player.radius * 1.1 && dist < bot.radius) {
                    player.radius = INITIAL_RADIUS;
                    player.position.set(0, INITIAL_RADIUS, 0);
                }
                return bot;
            });

            // Update UI State
            const currentScore = Math.floor((player.radius - INITIAL_RADIUS) * 100);
            const leader = [...next, { id: 'me', name: playerName, radius: player.radius, color: playerColor }]
                .sort((a, b) => b.radius - a.radius);
            onStateUpdate(currentScore, leader as Entity[]);

            return next;
        });

        // 4. Camera (Top-Down Smooth)
        const camDistance = Math.max(15, player.radius * 12);
        const targetPos = new THREE.Vector3(player.position.x, camDistance, player.position.z + camDistance * 0.7);
        camera.position.lerp(targetPos, 0.1);
        camera.lookAt(player.position);
    });

    return (
        <group>
            {/* Player Mesh Wrapper */}
            <group ref={playerMeshRef}>
                <mesh castShadow>
                    <sphereGeometry args={[INITIAL_RADIUS, 32, 32]} />
                    <meshStandardMaterial color={playerColor} roughness={0.1} metalness={0.2} />
                    {/* Character Face */}
                    <group position={[0, INITIAL_RADIUS * 0.2, INITIAL_RADIUS * 0.85]}>
                        <mesh position={[INITIAL_RADIUS * 0.3, 0, 0]}>
                            <sphereGeometry args={[INITIAL_RADIUS * 0.1, 16, 16]} />
                            <meshBasicMaterial color="black" />
                        </mesh>
                        <mesh position={[-INITIAL_RADIUS * 0.3, 0, 0]}>
                            <sphereGeometry args={[INITIAL_RADIUS * 0.1, 16, 16]} />
                            <meshBasicMaterial color="black" />
                        </mesh>
                    </group>
                </mesh>
                <Text
                    position={[0, INITIAL_RADIUS + 1.2, 0]}
                    fontSize={1}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {playerName.toUpperCase()}
                </Text>
            </group>

            {foods.map(f => <Food key={f.id} position={f.position} color={f.color} />)}
            {gifts.map(g => <Gift key={g.id} position={g.position} />)}
            {bots.map(b => (
                <group key={b.id} position={b.position}>
                    <mesh castShadow>
                        <sphereGeometry args={[b.radius, 32, 16]} />
                        <meshStandardMaterial color={b.color} roughness={0.4} />
                    </mesh>
                    <Text position={[0, b.radius + 1.2, 0]} fontSize={1.2} color="white">{b.name?.toUpperCase()}</Text>
                </group>
            ))}

            <Ground />
        </group>
    );
}

// --- MAIN PORTAL COMPONENT ---
export default function BalloonEater3D() {
    const [gameState, setGameState] = useState<'lobby' | 'playing'>('lobby');
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState<Entity[]>([]);
    const [joystick, setJoystick] = useState({ x: 0, y: 0 });

    // Customization
    const [playerName, setPlayerName] = useState('SuperBalloon');
    const [playerColor, setPlayerColor] = useState('#22d3ee');
    const colors = ['#22d3ee', '#f43f5e', '#10b981', '#fbbf24', '#8b5cf6', '#f97316'];

    const handleStateUpdate = useCallback((s: number, l: Entity[]) => {
        setScore(s);
        setLeaderboard(l.slice(0, 5));
    }, []);

    return (
        <div className="relative w-full h-full bg-[#020617] overflow-hidden">
            <AnimatePresence>
                {gameState === 'lobby' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl"
                    >
                        <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[56px] p-12 shadow-2xl">
                            <div className="text-center mb-10">
                                <h1 className="text-5xl font-black italic tracking-tighter text-white mb-2">BALLOON 3D</h1>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">RENK SEÇ ve ARENAYA GİR</p>
                            </div>

                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">KAHRAMAN ADIN</label>
                                    <input
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value.slice(0, 15))}
                                        className="w-full h-16 bg-white/5 border border-white/10 rounded-3xl px-6 text-white text-xl font-black placeholder:text-white/10 focus:border-cyan-500 outline-none transition-all shadow-inner"
                                        placeholder="ADINI YAZ..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">BALON RENGİ</label>
                                    <div className="flex gap-4 flex-wrap justify-between">
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setPlayerColor(c)}
                                                className={`w-14 h-14 rounded-2xl transition-all duration-300 ${playerColor === c ? 'scale-110 ring-4 ring-white shadow-xl' : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-100'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setGameState('playing')}
                                    className="w-full h-20 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-[32px] text-white font-black text-2xl flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(8,145,178,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    OYNA <Play fill="currentColor" size={28} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Canvas shadows gl={{ antialias: true, alpha: false }}>
                <Sky sunPosition={[100, 20, 100]} turbidity={0.1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.7} />
                <pointLight position={[10, 50, 10]} intensity={2.5} castShadow shadow-mapSize={[1024, 1024]} />

                <Suspense fallback={null}>
                    {gameState === 'playing' && (
                        <GameEngine
                            joystick={joystick}
                            playerColor={playerColor}
                            playerName={playerName}
                            onStateUpdate={handleStateUpdate}
                            onExit={() => setGameState('lobby')}
                        />
                    )}
                    <Environment preset="park" />
                    <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={100} blur={2} far={10} color="#000000" />
                </Suspense>
            </Canvas>

            {/* INTERFACE */}
            {gameState === 'playing' && (
                <>
                    <div className="absolute top-8 left-8 pointer-events-none flex flex-col gap-4">
                        <div className="bg-black/40 backdrop-blur-2xl px-8 py-6 rounded-[36px] border border-white/10 shadow-2xl">
                            <span className="text-[10px] text-cyan-400 font-black tracking-[4px] uppercase mb-1 block">SKORUN</span>
                            <span className="text-white text-5xl font-black italic tracking-tighter">{score}</span>
                        </div>
                    </div>

                    <div className="absolute top-8 right-8 pointer-events-none w-72 hidden md:block">
                        <div className="bg-black/30 backdrop-blur-3xl border border-white/10 rounded-[44px] p-8 shadow-2xl">
                            <div className="flex items-center gap-4 mb-6 text-yellow-500">
                                <Trophy size={20} fill="currentColor" />
                                <span className="text-xs font-black tracking-widest uppercase text-white">LIDERLER</span>
                            </div>
                            <div className="space-y-5">
                                {leaderboard.map((user, i) => (
                                    <div key={user.id} className="flex justify-between items-center animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center ${i === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-white/5 text-white/30'}`}>
                                                {i + 1}
                                            </span>
                                            <span className={`text-sm font-black tracking-tight ${user.id === 'me' ? 'text-cyan-400' : 'text-white/80'}`}>
                                                {user.name?.toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black text-white/20">{Math.floor((user.radius - 0.8) * 100)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-10 pointer-events-auto">
                        <button
                            onClick={() => setGameState('lobby')}
                            className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-90 shadow-xl"
                        >
                            <ArrowLeft size={28} />
                        </button>
                    </div>

                    <TouchController
                        onMove={setJoystick}
                        actions={['Turbo']}
                        onAction={() => console.log('BOOST!')}
                    />
                </>
            )}
        </div>
    );
}
