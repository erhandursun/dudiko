'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Sparkles } from '@react-three/drei';
import { RigidBody, BallCollider } from '@react-three/rapier';
import * as THREE from 'three';

function Balloon({ position, color, onPop }) {
    const [popped, setPopped] = useState(false);
    const rbRef = useRef();
    const meshRef = useRef();
    const speed = useRef(0.05 + Math.random() * 0.05);

    useFrame((state) => {
        if (popped) return;
        if (rbRef.current) {
            const currentPos = rbRef.current.translation();
            let newY = currentPos.y + speed.current;

            // Reset if too high
            if (newY > 20) {
                newY = 0;
            }

            const wobbleX = Math.sin(state.clock.elapsedTime + position[0]) * 0.01;
            rbRef.current.setTranslation({
                x: currentPos.x + wobbleX,
                y: newY,
                z: currentPos.z
            }, true);
        }
    });

    const handlePop = () => {
        if (popped) return;
        setPopped(true);
        onPop();
    };

    if (popped) {
        return (
            <group position={[position[0], 5, position[2]]}>
                <Sparkles count={20} scale={3} size={4} speed={2} color={color} />
            </group>
        );
    }

    return (
        <RigidBody
            ref={rbRef}
            position={position}
            type="kinematicPosition"
            colliders={false}
            sensor
            onIntersectionEnter={handlePop}
        >
            <BallCollider args={[0.8]} />
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <mesh
                    ref={meshRef}
                    onClick={handlePop}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                    <sphereGeometry args={[0.6, 32, 32]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.8}
                        transparent
                        opacity={0.9}
                    />
                </mesh>
                <mesh position={[0, -0.7, 0]}>
                    <cylinderGeometry args={[0.01, 0.01, 1.2]} />
                    <meshStandardMaterial color="white" transparent opacity={0.4} />
                </mesh>
            </Float>
        </RigidBody>
    );
}

export default function BalloonGame({ position = [0, 0, 0] }) {
    const [score, setScore] = useState(0);
    const [balloons, setBalloons] = useState([]);

    useEffect(() => {
        const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
        const newBalloons = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            position: [
                (Math.random() - 0.5) * 30,
                Math.random() * 15,
                (Math.random() - 0.5) * 30
            ],
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
        setBalloons(newBalloons);
    }, []);

    const handlePop = () => {
        setScore(s => s + 1);
        // Optional: play sound here if asset available
    };

    return (
        <group position={position}>
            {/* Scoring Billboard */}
            <mesh position={[0, 8, -15]}>
                <boxGeometry args={[8, 4, 0.5]} />
                <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
                <Text
                    position={[0, 0, 0.3]}
                    fontSize={1.2}
                    color="#00ff00"
                    outlineColor="#004400"
                    outlineWidth={0.05}
                >
                    BALON PUANI: {score}
                </Text>
            </mesh>

            <Text position={[0, 11, -15]} fontSize={0.6} color="white" outlineColor="purple" outlineWidth={0.05}>
                BALONLARA DOKUN VE PATLAT! 🎈✨
            </Text>

            {balloons.map((b) => (
                <Balloon
                    key={b.id}
                    position={b.position}
                    color={b.color}
                    onPop={handlePop}
                />
            ))}

            {/* Game Zone markers */}
            <gridHelper args={[40, 20, 0xff00ff, 0x333333]} position={[0, 0.05, 0]} />
        </group>
    );
}
