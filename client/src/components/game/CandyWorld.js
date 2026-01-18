import React, { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Float, Stars, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

export default function CandyWorld() {
    return (
        <group>
            {/* AMBIENT MUSIC / SOUNDS would go here */}

            {/* GROUND */}
            <RigidBody type="fixed" colliders="cuboid" friction={1}>
                {/* Main Pink Ground */}
                <mesh receiveShadow position={[0, -1, 0]}>
                    <cylinderGeometry args={[100, 100, 2, 64]} />
                    <meshStandardMaterial color="#f8bbd0" />
                </mesh>

                {/* Chocolate River Path (Visual) */}
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

            {/* FLOATING TEXT */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Center position={[0, 8, 0]}>
                    <mesh>
                        <boxGeometry args={[10, 2, 1]} />
                        <meshStandardMaterial color="#e1bee7" />
                    </mesh>
                    {/* Placeholder for text if we had a font */}
                </Center>
            </Float>

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

function CandyCane({ position, scale = 1 }) {
    return (
        <RigidBody type="fixed" colliders="hull">
            <group position={position} scale={[scale, scale, scale]}>
                {/* Stick */}
                <mesh position={[0, 2.5, 0]} castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Stripes would be texture, keeping simple white for now or logic */}
                <mesh position={[0, 2.5, 0]} scale={[1.01, 0.8, 1.01]}>
                    <cylinderGeometry args={[0.3, 0.3, 5, 16]} />
                    <meshStandardMaterial color="red" wireframe />
                </mesh>

                {/* Hook */}
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
                {/* Stick */}
                <mesh position={[0, 2, 0]} castShadow>
                    <cylinderGeometry args={[0.1, 0.1, 4, 16]} />
                    <meshStandardMaterial color="#fff" />
                </mesh>
                {/* Candy */}
                <mesh position={[0, 4.5, 0]} castShadow>
                    <cylinderGeometry args={[1.5, 1.5, 0.5, 32]} rotation={[Math.PI / 2, 0, 0]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>
        </RigidBody>
    );
}
