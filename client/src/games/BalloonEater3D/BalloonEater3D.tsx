'use client';

import React, { useState, useRef, useEffect, Suspense, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars, Environment, Text, Float, ContactShadows, RoundedBox, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import TouchController from '../../components/mobile/TouchController';
import { Trophy, Palette, Play, Info } from 'lucide-react';

// --- CONSTANTS ---
const WORLD_SIZE = 80;
const INITIAL_RADIUS = 0.8;
const FOOD_COUNT = 100;
const GIFT_COUNT = 12;
const BOT_COUNT = 8;

interface Entity {
    id: string;
    position: THREE.Vector3;
    radius: number;
    color: string;
    type: 'player' | 'food' | 'gift' | 'bot';
    name?: string;
}

// --- COMPONENTS ---
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

function PlayerSphere({ radius, position, color, name }: { radius: number; position: THREE.Vector3; color: string, name: string }) {
    return (
        <group position={position}>
            <mesh castShadow>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.1} metalness={0.3} />
                {/* Eyes */}
                <group position={[0, radius * 0.2, radius * 0.85]}>
                    <mesh position={[radius * 0.3, 0, 0]}>
                        <sphereGeometry args={[radius * 0.12, 16, 16]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                    <mesh position={[-radius * 0.3, 0, 0]}>
                        <sphereGeometry args={[radius * 0.12, 16, 16]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                </group>
            </mesh>
            <Text
                position={[0, radius + 1, 0]}
                fontSize={0.5 + radius * 0.2}
                color="white"
                font="/fonts/Outfit-Bold.ttf"
                anchorX="center"
                anchorY="middle"
            >
                {name.toUpperCase()}
            </Text>
        </group>
    );
}

// --- GAME LOGIC ---
function GameEngine({
    joystick,
    playerColor,
    playerName,
    onStateUpdate
}: {
    joystick: { x: number; y: number };
    playerColor: string;
    playerName: string;
    onStateUpdate: (score: number, leader: Entity[]) => void
}) {
    const { camera } = useThree();
    const playerRef = useRef<Entity>({
        id: 'me',
        position: new THREE.Vector3(0, INITIAL_RADIUS, 0),
        radius: INITIAL_RADIUS,
        color: playerColor,
        type: 'player',
        name: playerName
    });

    const [foods, setFoods] = useState<Entity[]>([]);
    const [gifts, setGifts] = useState<Entity[]>([]);
    const [bots, setBots] = useState<Entity[]>([]);
    const keys = useRef<Record<string, boolean>>({});

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
            color: 'red',
            type: 'gift'
        })));

        setBots(Array.from({ length: BOT_COUNT }).map((_, i) => ({
            id: `b-${i}`,
            position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0, (Math.random() - 0.5) * WORLD_SIZE),
            radius: 0.6 + Math.random() * 2.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'bot',
            name: ['BOT-REX', 'CYBER-X', 'NEON', 'ROBO', 'Z-BALL'][Math.floor(Math.random() * 5)]
        })));

        const kd = (e: KeyboardEvent) => keys.current[e.code] = true;
        const ku = (e: KeyboardEvent) => keys.current[e.code] = false;
        window.addEventListener('keydown', kd);
        window.addEventListener('keyup', ku);
        return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
    }, []);

    useFrame((state, delta) => {
        const player = playerRef.current;

        // 1. Movement Logic
        let mx = joystick.x;
        let mz = -joystick.y;
        if (keys.current['KeyA'] || keys.current['ArrowLeft']) mx = -1;
        if (keys.current['KeyD'] || keys.current['ArrowRight']) mx = 1;
        if (keys.current['KeyW'] || keys.current['ArrowUp']) mz = -1;
        if (keys.current['KeyS'] || keys.current['ArrowDown']) mz = 1;

        const speed = 18 * (1 / Math.sqrt(player.radius)) * delta;
        player.position.x = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, player.position.x + mx * speed));
        player.position.z = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, player.position.z + mz * speed));
        player.position.y = player.radius;

        // 2. Eating Logic
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
                player.radius += hits * 0.03;
                // Respawn
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
                player.radius += 0.8;
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

        // 3. Bot Logic & Leaderboard
        setBots(current => {
            const next = current.map(bot => {
                const time = state.clock.elapsedTime * 0.4;
                const seed = parseInt(bot.id.split('-')[1] || "0");
                bot.position.x += Math.sin(time + seed) * 0.08;
                bot.position.z += Math.cos(time + seed) * 0.08;
                bot.position.y = bot.radius;

                // Player eats bot
                if (player.radius > bot.radius * 1.1 && player.position.distanceTo(bot.position) < player.radius) {
                    player.radius += bot.radius * 0.3;
                    bot.position.set((Math.random() - 0.5) * WORLD_SIZE, bot.radius, (Math.random() - 0.5) * WORLD_SIZE);
                    bot.radius = 1 + Math.random() * 3;
                }
                // Bot eats player
                else if (bot.radius > player.radius * 1.1 && bot.position.distanceTo(player.position) < bot.radius) {
                    player.radius = INITIAL_RADIUS;
                    player.position.set(0, INITIAL_RADIUS, 0);
                }
                return bot;
            });

            // Update External UI
            const score = Math.floor((player.radius - INITIAL_RADIUS) * 100);
            const leader = [...next, player].sort((a, b) => b.radius - a.radius);
            onStateUpdate(score, leader);

            return next;
        });

        // 4. Smooth Camera
        const camHeight = 12 + player.radius * 10;
        camera.position.lerp(new THREE.Vector3(player.position.x, camHeight, player.position.z + camHeight * 0.6), 0.1);
        camera.lookAt(player.position);
    });

    return (
        <group>
            <PlayerSphere
                radius={playerRef.current.radius}
                position={playerRef.current.position}
                color={playerRef.current.color}
                name={playerRef.current.name || ''}
            />
            {foods.map(f => <Food key={f.id} position={f.position} color={f.color} />)}
            {gifts.map(g => <Gift key={g.id} position={g.position} />)}
            {bots.map(b => (
                <group key={b.id} position={b.position}>
                    <mesh castShadow>
                        <sphereGeometry args={[b.radius, 32, 16]} />
                        <meshStandardMaterial color={b.color} roughness={0.4} />
                    </mesh>
                    <Text position={[0, b.radius + 0.8, 0]} fontSize={0.8} color="white">{b.name?.toUpperCase()}</Text>
                </group>
            ))}

            {/* Ground & World FX */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[WORLD_SIZE * 2, WORLD_SIZE * 2]} />
                <MeshReflectorMaterial
                    blur={[300, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={40}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#1e1b4b"
                    metalness={0.5}
                />
            </mesh>
            <gridHelper args={[WORLD_SIZE * 2, 40, '#312e81', '#1e1b4b']} position={[0, 0.01, 0]} />
        </group>
    );
}

// --- MAIN WRAPPER ---
export default function BalloonEater3D() {
    const [gameState, setGameState] = useState<'lobby' | 'playing'>('lobby');
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState<Entity[]>([]);
    const [joystick, setJoystick] = useState({ x: 0, y: 0 });

    // Customization
    const [playerName, setPlayerName] = useState('Dudiko-Fan');
    const [playerColor, setPlayerColor] = useState('#22d3ee');
    const colors = ['#22d3ee', '#f43f5e', '#10b981', '#fbbf24', '#8b5cf6', '#f97316'];

    const handleStateUpdate = useCallback((s: number, l: Entity[]) => {
        setScore(s);
        setLeaderboard(l.slice(0, 5));
    }, []);

    return (
        <div className="relative w-full h-full bg-[#020617] overflow-hidden font-sans">
            <AnimatePresence>
                {gameState === 'lobby' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-3xl"
                    >
                        <div className="w-full max-w-xl bg-[#0f172a] border border-white/10 rounded-[48px] p-10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 bg-cyan-500 rounded-3xl shadow-lg shadow-cyan-500/20">
                                    <Palette className="text-black" size={32} />
                                </div>
                                <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">RENGİNİ SEÇ</h2>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-4 block">OYUNCU ADI</label>
                                    <input
                                        value={playerName}
                                        onChange={(e) => setPlayerName(e.target.value.slice(0, 12))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold text-xl focus:outline-none focus:border-cyan-500 transition-all"
                                        placeholder="ADINI YAZ..."
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-4 block">BALON RENGİ</label>
                                    <div className="flex gap-4 flex-wrap">
                                        {colors.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => setPlayerColor(c)}
                                                className={`w-14 h-14 rounded-2xl border-4 transition-all ${playerColor === c ? 'scale-110 border-white shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setGameState('playing')}
                                    className="w-full py-6 mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[28px] text-white font-black text-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
                                >
                                    ARENAYA GİR <Play fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Canvas shadows gl={{ antialias: true }}>
                <Sky sunPosition={[100, 40, 50]} turbidity={0.1} rayleigh={0.5} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 50, 20]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />

                <Suspense fallback={null}>
                    {gameState === 'playing' && (
                        <GameEngine
                            joystick={joystick}
                            playerColor={playerColor}
                            playerName={playerName}
                            onStateUpdate={handleStateUpdate}
                        />
                    )}
                </Suspense>
            </Canvas>

            {/* HUD & LEADERBOARD */}
            {gameState === 'playing' && (
                <>
                    <div className="absolute top-6 left-6 pointer-events-none flex flex-col gap-4">
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-black/60 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl"
                        >
                            <span className="text-[10px] text-cyan-400 font-black tracking-[4px] uppercase block mb-1">SKORUN</span>
                            <span className="text-white text-5xl font-black italic tracking-tighter">{score}</span>
                        </motion.div>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur px-5 py-2 rounded-full border border-white/5 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                            <Info size={12} className="text-cyan-400" />
                            HEDİYE PAKETLERİ (🎁) EKSTRA PUAN VERİR!
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 pointer-events-none w-64 hidden md:block">
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-8"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <Trophy size={20} className="text-yellow-400" />
                                <span className="text-xs font-black tracking-widest uppercase">SIRALAMA</span>
                            </div>
                            <div className="space-y-4">
                                {leaderboard.map((user, i) => (
                                    <div key={user.id} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center ${i === 0 ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white/40'}`}>
                                                {i + 1}
                                            </span>
                                            <span className={`text-sm font-bold ${user.id === 'me' ? 'text-cyan-400' : 'text-white/70'}`}>
                                                {user.name?.toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black text-white/30">
                                            {Math.floor((user.radius - INITIAL_RADIUS) * 100)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <TouchController
                        onMove={setJoystick}
                        actions={['Zıpla']}
                        onAction={() => console.log('HUP!')}
                    />
                </>
            )}
        </div>
    );
}
