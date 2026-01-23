'use client';

import React, { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars, Environment, Text, Float, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import TouchController from '../../components/mobile/TouchController';

// --- CONSTANTS ---
const WORLD_SIZE = 60;
const INITIAL_RADIUS = 0.8;
const FOOD_COUNT = 80;
const GIFT_COUNT = 15;
const BOT_COUNT = 10;

interface Entity {
    id: string;
    position: THREE.Vector3;
    radius: number;
    color: string;
    type: 'player' | 'food' | 'gift' | 'bot';
}

// --- COMPONENTS ---
function Food({ position, color }: { position: THREE.Vector3; color: string }) {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
    );
}

function Gift({ position }: { position: THREE.Vector3 }) {
    return (
        <Float speed={2} rotationIntensity={2}>
            <mesh position={position}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshStandardMaterial color="#ff4444" metalness={0.8} roughness={0.2} />
                {/* Ribbon */}
                <mesh scale={[1.1, 0.2, 1.1]}>
                    <boxGeometry args={[0.6, 0.6, 0.6]} />
                    <meshStandardMaterial color="gold" />
                </mesh>
            </mesh>
        </Float>
    );
}

function Bot({ bot }: { bot: Entity }) {
    return (
        <mesh position={bot.position}>
            <sphereGeometry args={[bot.radius, 32, 32]} />
            <meshStandardMaterial color={bot.color} roughness={0.3} />
        </mesh>
    );
}

function PlayerSphere({ radius, position, color }: { radius: number; position: THREE.Vector3; color: string }) {
    return (
        <mesh position={position} castShadow>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.2} />
            {/* Simple Eyes for Roblox feel */}
            <group position={[0, radius * 0.3, radius * 0.8]}>
                <mesh position={[radius * 0.3, 0, 0]}>
                    <sphereGeometry args={[radius * 0.1, 16, 16]} />
                    <meshBasicMaterial color="black" />
                </mesh>
                <mesh position={[-radius * 0.3, 0, 0]}>
                    <sphereGeometry args={[radius * 0.1, 16, 16]} />
                    <meshBasicMaterial color="black" />
                </mesh>
            </group>
        </mesh>
    );
}

// --- MAIN GAME ENGINE ---
function GameWorld({ joystick, onScoreUpdate }: { joystick: { x: number; y: number }; onScoreUpdate: (s: number) => void }) {
    const { camera } = useThree();
    const [player, setPlayer] = useState<Entity>({
        id: 'me',
        position: new THREE.Vector3(0, INITIAL_RADIUS, 0),
        radius: INITIAL_RADIUS,
        color: '#22d3ee',
        type: 'player'
    });

    const [foods, setFoods] = useState<Entity[]>([]);
    const [gifts, setGifts] = useState<Entity[]>([]);
    const [bots, setBots] = useState<Entity[]>([]);
    const keys = useRef<Record<string, boolean>>({});

    // Init World
    useEffect(() => {
        const colors = ['#f87171', '#4ade80', '#60a5fa', '#fbbf24', '#c084fc'];

        setFoods(Array.from({ length: FOOD_COUNT }).map((_, i) => ({
            id: `f-${i}`,
            position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.3, (Math.random() - 0.5) * WORLD_SIZE),
            radius: 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'food'
        })));

        setGifts(Array.from({ length: GIFT_COUNT }).map((_, i) => ({
            id: `g-${i}`,
            position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.5, (Math.random() - 0.5) * WORLD_SIZE),
            radius: 0.6,
            color: 'red',
            type: 'gift'
        })));

        setBots(Array.from({ length: BOT_COUNT }).map((_, i) => ({
            id: `b-${i}`,
            position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0, (Math.random() - 0.5) * WORLD_SIZE),
            radius: 0.5 + Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'bot'
        })));

        const kd = (e: KeyboardEvent) => keys.current[e.code] = true;
        const ku = (e: KeyboardEvent) => keys.current[e.code] = false;
        window.addEventListener('keydown', kd);
        window.addEventListener('keyup', ku);
        return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
    }, []);

    useFrame((state, delta) => {
        // 1. Movement
        let mx = joystick.x;
        let mz = -joystick.y;
        if (keys.current['KeyA'] || keys.current['ArrowLeft']) mx = -1;
        if (keys.current['KeyD'] || keys.current['ArrowRight']) mx = 1;
        if (keys.current['KeyW'] || keys.current['ArrowUp']) mz = -1;
        if (keys.current['KeyS'] || keys.current['ArrowDown']) mz = 1;

        const speed = 15 * (1 / player.radius) * delta;
        const newX = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, player.position.x + mx * speed));
        const newZ = Math.max(-WORLD_SIZE / 2, Math.min(WORLD_SIZE / 2, player.position.z + mz * speed));

        player.position.set(newX, player.radius, newZ);

        // 2. Collision Detection
        setFoods(current => {
            let hits = 0;
            const next = current.filter(f => {
                if (player.position.distanceTo(f.position) < player.radius + 0.2) {
                    hits++;
                    return false;
                }
                return true;
            });
            if (hits > 0) {
                player.radius += hits * 0.02;
                onScoreUpdate(Math.floor((player.radius - INITIAL_RADIUS) * 100));
                // Add new food
                for (let i = 0; i < hits; i++) {
                    next.push({
                        id: `f-${Date.now()}-${i}`,
                        position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.3, (Math.random() - 0.5) * WORLD_SIZE),
                        radius: 0.3,
                        color: player.color,
                        type: 'food'
                    });
                }
            }
            return next;
        });

        setGifts(current => {
            let hit = false;
            const next = current.filter(g => {
                if (player.position.distanceTo(g.position) < player.radius + 0.5) {
                    hit = true;
                    return false;
                }
                return true;
            });
            if (hit) {
                player.radius += 0.5;
                onScoreUpdate(Math.floor((player.radius - INITIAL_RADIUS) * 100));
                next.push({
                    id: `g-${Date.now()}`,
                    position: new THREE.Vector3((Math.random() - 0.5) * WORLD_SIZE, 0.5, (Math.random() - 0.5) * WORLD_SIZE),
                    radius: 0.6,
                    color: 'red',
                    type: 'gift'
                });
            }
            return next;
        });

        // Bot Movement & Eating
        setBots(current => {
            return current.map(bot => {
                // Move randomly
                const time = state.clock.elapsedTime * 0.5;
                bot.position.x += Math.sin(time + parseInt(bot.id.split('-')[1] || "0")) * 0.05;
                bot.position.z += Math.cos(time + parseInt(bot.id.split('-')[1] || "0")) * 0.05;
                bot.position.y = bot.radius;

                // Player eats bot
                if (player.radius > bot.radius && player.position.distanceTo(bot.position) < player.radius) {
                    player.radius += bot.radius * 0.2;
                    bot.position.set((Math.random() - 0.5) * WORLD_SIZE, 0, (Math.random() - 0.5) * WORLD_SIZE);
                    bot.radius = 0.5 + Math.random() * 2;
                }
                // Bot eats player (Reset)
                else if (bot.radius > player.radius && bot.position.distanceTo(player.position) < bot.radius) {
                    player.radius = INITIAL_RADIUS;
                    player.position.set(0, INITIAL_RADIUS, 0);
                    onScoreUpdate(0);
                }

                return bot;
            });
        });

        // 3. Camera (Top-Down Follow)
        const camY = Math.max(15, player.radius * 20);
        camera.position.lerp(new THREE.Vector3(player.position.x, camY, player.position.z + 10), 0.1);
        camera.lookAt(player.position);
    });

    return (
        <>
            <PlayerSphere radius={player.radius} position={player.position} color={player.color} />
            {foods.map(f => <Food key={f.id} position={f.position} color={f.color} />)}
            {gifts.map(g => <Gift key={g.id} position={g.position} />)}
            {bots.map(b => <Bot key={b.id} bot={b} />)}

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[WORLD_SIZE + 20, WORLD_SIZE + 20]} />
                <meshStandardMaterial color="#0f172a" />
            </mesh>
            <gridHelper args={[WORLD_SIZE, 30, '#1e293b', '#020617']} position={[0, 0.01, 0]} />
        </>
    );
}

export default function BalloonEater3D() {
    const [score, setScore] = useState(0);
    const [joystick, setJoystick] = useState({ x: 0, y: 0 });

    return (
        <div className="relative w-full h-full bg-[#020617]">
            <Canvas shadows camera={{ position: [0, 20, 10], fov: 50 }}>
                <Sky sunPosition={[100, 10, 100]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="night" />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 50, 10]} intensity={1.5} castShadow />

                <Suspense fallback={null}>
                    <GameWorld joystick={joystick} onScoreUpdate={setScore} />
                    <ContactShadows opacity={0.5} scale={100} blur={1} far={10} resolution={256} color="#000000" />
                </Suspense>
            </Canvas>

            {/* HUD */}
            <div className="absolute top-6 left-6 pointer-events-none flex flex-col gap-4">
                <div className="bg-black/60 backdrop-blur-2xl p-6 rounded-[32px] border border-white/10 shadow-2xl flex flex-col">
                    <span className="text-[10px] text-cyan-400 font-black tracking-[4px] uppercase mb-1">MASSA</span>
                    <span className="text-white text-4xl font-black italic tracking-tighter">{score}</span>
                </div>
                <div className="bg-white/5 backdrop-blur px-4 py-2 rounded-full border border-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    HEDİYELERİ TOPLA VE BÜYÜ! 🎁
                </div>
            </div>

            <TouchController
                onMove={setJoystick}
                actions={['Turbo']}
                onAction={() => console.log('Turbo!')}
            />
        </div>
    );
}
