import React from 'react';
import { RigidBody } from '@react-three/rapier';
import MathBoard from './MathBoard';
import GiantSlide from './GiantSlide';
import PlatformJumpGame from './PlatformJumpGame';

export default function MathGarden({ position = [0, 0, 0] }) {
    return (
        <group position={position}>
            {/* Green Grass Ground for Garden */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#AED581" />
            </mesh>

            {/* Fences Removed for Open Concept */}

            {/* Components in Garden */}

            {/* 1. The Blackboard Math Game */}
            <group position={[-10, 0, -10]} rotation={[0, Math.PI / 4, 0]}>
                <MathBoard />
            </group>

            {/* 2. Giant Slide */}
            <group position={[10, 0, 10]} rotation={[0, -Math.PI / 4, 0]}>
                <GiantSlide />
            </group>

            {/* 3. Platform Jump Game */}
            <PlatformJumpGame position={[0, 0, 0]} />

            {/* 4. Decorations (Reduced) */}
            <mesh position={[-15, 2, 15]}>
                <coneGeometry args={[2, 6, 8]} />
                <meshStandardMaterial color="#2E7D32" />
            </mesh>
            <mesh position={[15, 2, -15]}>
                <coneGeometry args={[2, 6, 8]} />
                <meshStandardMaterial color="#2E7D32" />
            </mesh>
        </group>
    );
}
