'use client';

import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Environment, ContactShadows, Text, Float, Sparkles } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';
import RemotePlayer from './RemotePlayer';
import BookCafe from './BookCafe';
import { SpeedGate, JumpPad } from './FunInteractions';
import BalloonGame from './BalloonGame';

export default function LibraryRaceWorld() {
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);

    return (
        <group>
            {/* Environment */}
            <Environment preset="forest" />
            <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={200} blur={2.5} far={10} />
            <Sparkles count={100} scale={50} size={2} speed={0.3} opacity={0.3} color="#ffffff" />

            {/* Ground */}
            <RigidBody type="fixed">
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial color="#2d5a27" /> {/* Grass-like green */}
                </mesh>
            </RigidBody>

            {/* --- ZONE 1: THE LIBRARY --- */}
            <group position={[-20, 0, 20]}>
                <BookCafe position={[0, 0, 0]} />
                <Text position={[0, 8, 0]} fontSize={2} color="#fcd34d" outlineWidth={0.1}>
                    KÜTÜPHANE ALANI 📚
                </Text>
            </group>

            {/* --- ZONE 2: THE BALLOON HUNT --- */}
            <group position={[30, 0, 30]}>
                <BalloonGame position={[0, 0, 0]} />
            </group>

            {/* --- ZONE 3: THE RACE TRACK --- */}
            <group position={[0, 0, -50]}>
                <Text position={[0, 10, 0]} fontSize={3} color="#ef4444" outlineWidth={0.2} outlineColor="white">
                    HIZ PARKURU 🏎️
                </Text>

                {/* Starting Line */}
                <RigidBody type="fixed">
                    <mesh position={[0, 0.05, 10]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[20, 4]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                </RigidBody>

                {/* Track Obstacles */}
                <SpeedGate position={[0, 2, 0]} />
                <SpeedGate position={[10, 2, -20]} />
                <SpeedGate position={[-10, 2, -20]} />

                <JumpPad position={[0, 0, -40]} />

                <group position={[0, 0, -60]}>
                    <RigidBody type="fixed">
                        <mesh position={[0, 2, 0]}>
                            <boxGeometry args={[10, 0.5, 10]} />
                            <meshStandardMaterial color="#ec4899" />
                        </mesh>
                    </RigidBody>
                    <JumpPad position={[0, 2.5, 0]} />
                    <Text position={[0, 5, 0]} fontSize={1} color="white">YÜKSEK ATLA! 🚀</Text>
                </group>

                {/* Finish Line */}
                <group position={[0, 0, -100]}>
                    <RigidBody type="fixed">
                        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[30, 10]} />
                            <meshStandardMaterial color="#10b981" />
                        </mesh>
                    </RigidBody>
                    <Text position={[0, 6, 0]} fontSize={4} color="#fbbf24">VARİŞ! 🏆</Text>
                </group>
            </group>

            {/* Remote Players Visibility */}
            {Object.entries(players).map(([id, data]) => {
                if (id === playerId || !data.position) return null;
                if (data.currentWorld !== 'library-race') return null;

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
