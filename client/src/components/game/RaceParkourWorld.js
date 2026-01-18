'use client';

import React, { useState, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Float, Text, ContactShadows, Environment, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';
import RemotePlayer from './RemotePlayer';
import { SpeedGate, JumpPad } from './FunInteractions';

export default function RaceParkourWorld() {
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);
    const [checkpoint, setCheckpoint] = useState(0);

    return (
        <group>
            {/* 1. Environment & Lighting */}
            <Environment preset="night" />
            <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={100} blur={2} far={10} />
            <Sparkles count={100} scale={50} size={2} speed={1} color="#38bdf8" />

            {/* 2. THE STARTING LINE */}
            <group position={[0, 0, 0]}>
                <RigidBody type="fixed">
                    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[20, 20]} />
                        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
                    </mesh>
                </RigidBody>
                <Text position={[0, 5, -5]} fontSize={2} color="#38bdf8" outlineWidth={0.1}>
                    BAŞLANGIÇ ÇİZGİSİ 🏎️
                </Text>
            </group>

            {/* 3. THE PARKOUR - OBSTACLES */}

            {/* Section A: Speed Run */}
            <group position={[0, 0, -30]}>
                <SpeedGate position={[0, 2, 0]} />
                <SpeedGate position={[0, 2, -15]} />
                <SpeedGate position={[0, 2, -30]} />
                <RigidBody type="fixed">
                    <mesh receiveShadow position={[0, 0.1, -15]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[10, 50]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                </RigidBody>
            </group>

            {/* Section B: The Jump Chain */}
            <group position={[0, 0, -80]}>
                <JumpPad position={[0, 0, 0]} />
                {/* Floating Platforms */}
                {[...Array(5)].map((_, i) => (
                    <RigidBody key={i} type="fixed" position={[Math.sin(i) * 5, 5 + i * 3, -10 - i * 15]}>
                        <mesh castShadow receiveShadow>
                            <boxGeometry args={[6, 0.5, 6]} />
                            <meshStandardMaterial color={i === 4 ? "#ef4444" : "#ec4899"} emissive={i === 4 ? "#ef4444" : "#ec4899"} emissiveIntensity={1} />
                        </mesh>
                        {i < 4 && <JumpPad position={[0, 0.5, 0]} />}
                        {i === 4 && (
                            <Text position={[0, 2, 0]} fontSize={1} color="white">
                                CHECKPOINT 📍
                            </Text>
                        )}
                    </RigidBody>
                ))}
            </group>

            {/* Section C: Laser Hallway */}
            <group position={[0, 20, -180]}>
                <RigidBody type="fixed">
                    <mesh receiveShadow position={[0, -0.5, -25]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[15, 60]} />
                        <meshStandardMaterial color="#0f172a" />
                    </mesh>
                </RigidBody>
                {[...Array(10)].map((_, i) => (
                    <group key={i} position={[0, 1, -i * 6]}>
                        <mesh position={[0, 2, 0]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.05, 0.05, 15]} />
                            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={5} />
                        </mesh>
                    </group>
                ))}
                <Text position={[0, 5, -55]} fontSize={2} color="#fbbf24">
                    NEREDEYSE BİTTİ! 🚀
                </Text>
            </group>

            {/* 4. THE FINISH LINE */}
            <group position={[0, 20, -250]}>
                <RigidBody type="fixed">
                    <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[30, 30]} />
                        <MeshDistortMaterial color="#10b981" speed={2} factor={0.5} />
                    </mesh>
                </RigidBody>
                <Text position={[0, 5, 0]} fontSize={3} color="#10b981" outlineWidth={0.2} outlineColor="white">
                    TEBRİKLER! 🎉🏁
                </Text>
                <JumpPad position={[0, 0, 0]} /> {/* Bounce for victory */}
            </group>

            {/* Remote Players */}
            {Object.entries(players).map(([id, data]) => {
                if (id === playerId || !data.position) return null;
                if (data.currentWorld !== 'race') return null;

                return (
                    <RemotePlayer
                        key={id}
                        position={data.position}
                        rotation={data.rotation}
                        color={data.color}
                        isDriving={data.isDriving}
                        name={data.name}
                        lastChat={data.chatMessage}
                        characterType={data.characterType}
                        customization={data.customization}
                    />
                );
            })}
        </group>
    );
}
