'use client';

import React from 'react';
import { Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function TeacherDesk({ position, text = "Öğretmen" }) {
    return (
        <group position={position}>
            <RigidBody type="fixed">
                {/* Desk Top */}
                <mesh position={[0, 1.5, 0]} castShadow>
                    <boxGeometry args={[6, 0.3, 3]} />
                    <meshStandardMaterial color="#5D4037" />
                </mesh>
                {/* Front Panel */}
                <mesh position={[0, 0.75, 1.4]} castShadow>
                    <boxGeometry args={[6, 1.5, 0.1]} />
                    <meshStandardMaterial color="#4E342E" />
                </mesh>
                {/* Legs */}
                <mesh position={[-2.8, 0.75, 0]}>
                    <boxGeometry args={[0.3, 1.5, 2.8]} />
                    <meshStandardMaterial color="#4E342E" />
                </mesh>
                <mesh position={[2.8, 0.75, 0]}>
                    <boxGeometry args={[0.3, 1.5, 2.8]} />
                    <meshStandardMaterial color="#4E342E" />
                </mesh>

                {/* Apple */}
                <mesh position={[2, 1.8, 0.5]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="red" />
                </mesh>
                <mesh position={[2, 2.0, 0.5]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.2]} />
                    <meshStandardMaterial color="brown" />
                </mesh>
            </RigidBody>

            {/* Nameplate - User Request: "Minik Bir Elif Duha" */}
            <group position={[0, 1.5, 1.6]}>
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[4, 0.6, 0.1]} />
                    <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
                </mesh>
                <Text
                    position={[0, 0, 0.06]}
                    fontSize={0.35}
                    color="black"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/Inter-Bold.woff" // Ensure font availability or fallback
                >
                    {text}
                </Text>
            </group>
        </group>
    );
}
