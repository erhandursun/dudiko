import React from 'react';
import { Text, Html } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';

export default function Leaderboard({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
    const leaderboard = useSocketStore((state) => state.leaderboard);

    return (
        <group position={position} rotation={rotation}>
            {/* Screen Frame */}
            <mesh position={[0, 4, 0]} castShadow>
                <boxGeometry args={[6, 8, 0.5]} />
                <meshStandardMaterial color="#424242" />
            </mesh>

            {/* Glossy Screen Surface */}
            <mesh position={[0, 4, 0.26]}>
                <planeGeometry args={[5.5, 7.5]} />
                <meshStandardMaterial color="#1A237E" emissive="#1A237E" emissiveIntensity={0.2} />
            </mesh>

            {/* Header Text */}
            <Text
                position={[0, 7, 0.3]}
                fontSize={0.5}
                color="#FFD54F"
            >
                TOP MATH WIZARDS 🏆
            </Text>

            {/* List */}
            {leaderboard.length === 0 ? (
                <Text position={[0, 4, 0.3]} fontSize={0.3} color="white">
                    Solving math to appear here...
                </Text>
            ) : (
                leaderboard.map((entry, i) => (
                    <group key={i} position={[0, 6 - i * 0.6, 0.3]}>
                        <Text
                            position={[-2, 0, 0]}
                            fontSize={0.35}
                            color={i < 3 ? "#FFD54F" : "white"}
                            anchorX="left"
                        >
                            {i + 1}. {entry.name}
                        </Text>
                        <Text
                            position={[2, 0, 0]}
                            fontSize={0.35}
                            color="#81C784"
                            anchorX="right"
                        >
                            {entry.score} pts
                        </Text>
                    </group>
                ))
            )}

            {/* Decorative Base */}
            <mesh position={[0, 0.25, 0]}>
                <boxGeometry args={[4, 0.5, 2]} />
                <meshStandardMaterial color="#616161" />
            </mesh>
        </group>
    );
}
