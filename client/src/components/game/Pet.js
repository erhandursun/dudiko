'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Pet({ targetParams, color = 'gold', type = 'flying' }) {
    const group = useRef();
    const wingLeft = useRef();
    const wingRight = useRef();

    // Smooth follow state
    const currentPos = useRef(new THREE.Vector3(0, 5, 0));

    useFrame((state, delta) => {
        if (!group.current) return;

        // 1. Get Target Position (Player's shoulder/side)
        let targetPos = new THREE.Vector3();

        // Handle different target types (Ref or Vector3 array)
        if (targetParams && targetParams.current && targetParams.current.translation) {
            const t = targetParams.current.translation();
            targetPos.set(t.x, t.y, t.z);
        } else if (Array.isArray(targetParams)) {
            targetPos.set(targetParams[0], targetParams[1], targetParams[2]);
        } else {
            return;
        }

        // Offset: Up and to the left
        const time = state.clock.getElapsedTime();
        const hoverY = Math.sin(time * 3) * 0.2; // Bobbing

        // Calculate desired position (Relative to player)
        // We want it to trail slightly

        const offset = new THREE.Vector3(-1.5, 1.5 + hoverY, -1);

        // Final Goal
        const goal = targetPos.clone().add(offset);

        // Lerp current position to goal
        currentPos.current.lerp(goal, 0.1);

        group.current.position.copy(currentPos.current);

        // Look at player roughly
        group.current.lookAt(targetPos);

        // Wing Animation
        if (wingLeft.current && wingRight.current) {
            const wingSpeed = 15;
            const wingAngle = Math.sin(time * wingSpeed) * 0.5;
            wingLeft.current.rotation.z = wingAngle;
            wingRight.current.rotation.z = -wingAngle;
        }
    });

    return (
        <group ref={group}>
            {/* Body */}
            <mesh castShadow>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.1, 0.1, 0.25]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.1, 0.1, 0.25]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial color="black" />
            </mesh>

            {/* Wings */}
            <group position={[-0.25, 0, 0]} ref={wingLeft}>
                <mesh position={[-0.2, 0, 0]} rotation={[0, 0, 0.2]}>
                    <boxGeometry args={[0.5, 0.05, 0.3]} />
                    <meshStandardMaterial color="white" transparent opacity={0.8} />
                </mesh>
            </group>
            <group position={[0.25, 0, 0]} ref={wingRight}>
                <mesh position={[0.2, 0, 0]} rotation={[0, 0, -0.2]}>
                    <boxGeometry args={[0.5, 0.05, 0.3]} />
                    <meshStandardMaterial color="white" transparent opacity={0.8} />
                </mesh>
            </group>

            {/* Particle Trail (Simplified: Just a Glow) */}
            <pointLight distance={3} intensity={0.5} color={color} />
        </group>
    );
}
