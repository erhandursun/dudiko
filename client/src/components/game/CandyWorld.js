import React, { useState, useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Float, Stars, Text, Center, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function CandyWorld() {
    const [score, setScore] = useState(0);
    const [collected, setCollected] = useState([]);

    // Letters to find: A, B, C, 1, 2, 3
    const targets = [
        { id: 'A', char: 'A', pos: [10, 2, 10], col: '#ff4081', label: 'ELMA (Apple)' },
        { id: 'B', char: 'B', pos: [-10, 2, 10], col: '#2196f3', label: 'BALIK (Fish)' },
        { id: 'C', char: 'C', pos: [10, 2, -10], col: '#4caf50', label: 'CEVİZ (Walnut)' },
        { id: '1', char: '1', pos: [-10, 2, -10], col: '#ffc107', label: 'BİR (One)' },
        { id: '2', char: '2', pos: [0, 4, -20], col: '#9c27b0', label: 'İKİ (Two)' },
    ];

    const handleCollect = (item) => {
        if (!collected.includes(item.id)) {
            setCollected([...collected, item.id]);
            setScore(s => s + 10);

            // Show simple alert or UI feedback (Toast)
            const toast = document.createElement('div');
            toast.innerText = `🎉 ${item.char} - ${item.label}`;
            toast.style.position = 'fixed';
            toast.style.top = '20%';
            toast.style.left = '50%';
            toast.style.transform = 'translate(-50%, -50%)';
            toast.style.background = 'white';
            toast.style.padding = '20px';
            toast.style.borderRadius = '20px';
            toast.style.fontSize = '24px';
            toast.style.fontWeight = 'bold';
            toast.style.color = item.col;
            toast.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
            toast.style.zIndex = '9999';
            toast.style.animation = 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            document.body.appendChild(toast);

            setTimeout(() => toast.remove(), 2500);
        }
    };

    return (
        <group>
            {/* UI Overlay for Score */}
            <Html position={[0, 10, 0]} transform sprite>
                <div style={{ background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '30px', fontFamily: 'Arial', fontWeight: 'bold', color: '#e91e63', border: '3px solid white', whiteSpace: 'nowrap' }}>
                    Alfabe Puanı: {score} 🌟
                </div>
            </Html>

            {/* COLLECTIBLES */}
            {targets.map((t) => (
                !collected.includes(t.id) && (
                    <LetterCollectible
                        key={t.id}
                        {...t}
                        onCollect={() => handleCollect(t)}
                    />
                )
            ))}

            {/* GROUND */}
            <RigidBody type="fixed" colliders="cuboid" friction={1}>
                {/* Main Pink Ground */}
                <mesh receiveShadow position={[0, -1, 0]}>
                    <cylinderGeometry args={[100, 100, 2, 64]} />
                    <meshStandardMaterial color="#f8bbd0" />
                </mesh>

                {/* Chocolate River Path */}
                <mesh receiveShadow position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[15, 25, 64]} />
                    <meshStandardMaterial color="#5d4037" roughness={0.2} />
                </mesh>
            </RigidBody>

            {/* CANDY CANES */}
            <CandyCane position={[10, 0, 10]} />
            <CandyCane position={[-10, 0, 10]} />
            <CandyCane position={[10, 0, -10]} />
            <CandyCane position={[-10, 0, -10]} />

            <CandyCane position={[20, 0, 20]} scale={1.5} />
            <CandyCane position={[-25, 0, 15]} scale={1.2} />

            {/* GIANT LOLLIPOPS */}
            <Lollipop position={[5, 0, 30]} color="red" />
            <Lollipop position={[-5, 0, 35]} color="blue" />
            <Lollipop position={[15, 0, 25]} color="yellow" />

            {/* DONUT PLATFORMS */}
            <RigidBody type="fixed" colliders="hull">
                <mesh position={[0, 2, -20]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[3, 1, 16, 50]} />
                    <meshStandardMaterial color="#f06292" />
                </mesh>
            </RigidBody>

            <RigidBody type="fixed" colliders="hull">
                <mesh position={[8, 4, -25]} rotation={[Math.PI / 2, 0.5, 0]}>
                    <torusGeometry args={[3, 1, 16, 50]} />
                    <meshStandardMaterial color="#4fc3f7" />
                </mesh>
            </RigidBody>

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

function LetterCollectible({ char, pos, col, onCollect }) {
    const ref = useRef();

    // Simple distance check instead of collision for ease
    return (
        <RigidBody type="fixed" sensor onIntersectionEnter={onCollect}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <group position={pos}>
                    <Center>
                        <Text
                            fontSize={3}
                            color={col}
                        >
                            {char}
                        </Text>
                    </Center>
                    {/* Glow Effect */}
                    <pointLight distance={5} intensity={2} color={col} />
                </group>
            </Float>
        </RigidBody>
    );
}

function CandyCane({ position, scale = 1 }) {
    return (
        <RigidBody type="fixed" colliders="hull">
            <group position={position} scale={[scale, scale, scale]}>
                <mesh position={[0, 2.5, 0]} castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[0, 2.5, 0]} scale={[1.01, 0.8, 1.01]}>
                    <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
                    <meshStandardMaterial color="red" wireframe />
                </mesh>
                <mesh position={[0.7, 4.8, 0]} rotation={[0, 0, -Math.PI]}>
                    <torusGeometry args={[0.7, 0.3, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>
        </RigidBody>
    );
}

function Lollipop({ position, color }) {
    return (
        <RigidBody type="fixed" colliders="hull">
            <group position={position}>
                <mesh position={[0, 2, 0]} castShadow>
                    <cylinderGeometry args={[0.1, 0.1, 4, 16]} />
                    <meshStandardMaterial color="#fff" />
                </mesh>
                <mesh position={[0, 4.5, 0]} castShadow>
                    <cylinderGeometry args={[1.5, 1.5, 0.5, 32]} rotation={[Math.PI / 2, 0, 0]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>
        </RigidBody>
    );
}
