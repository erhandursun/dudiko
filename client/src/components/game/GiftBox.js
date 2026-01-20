'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

export default function GiftBox({ position, onClick }) {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 1.5;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group position={position} onClick={onClick}>
                {/* Main Box */}
                <mesh ref={meshRef} castShadow receiveShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#FF5252" roughness={0.3} metallic={0.1} />
                </mesh>

                {/* Ribbon Vertical */}
                <mesh position={[0, 0, 0]} rotation={[0, 0, 0]} castShadow>
                    <boxGeometry args={[1.05, 1.05, 0.2]} />
                    <meshStandardMaterial color="#FFD740" emissive="#FFD740" emissiveIntensity={0.2} />
                </mesh>

                {/* Ribbon Horizontal */}
                <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                    <boxGeometry args={[1.05, 1.05, 0.2]} />
                    <meshStandardMaterial color="#FFD740" emissive="#FFD740" emissiveIntensity={0.2} />
                </mesh>

                {/* Bow */}
                <group position={[0, 0.6, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 4]} position={[-0.2, 0, 0]}>
                        <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI * 1.5]} />
                        <meshStandardMaterial color="#FFD740" />
                    </mesh>
                    <mesh rotation={[0, 0, -Math.PI / 4]} position={[0.2, 0, 0]}>
                        <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI * 1.5]} />
                        <meshStandardMaterial color="#FFD740" />
                    </mesh>
                </group>

                {/* Sparkles/Attention */}
                <pointLight position={[0, 2, 0]} distance={5} intensity={1} color="gold" />
            </group>
        </Float>
    );
}
