'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { useTrimesh } from '@react-three/rapier';
import { RigidBody } from '@react-three/rapier';

// Improved version with proper Collider logic
export default function GiantSlide({ position }) {
    const { geometry } = useMemo(() => {
        const points = [];
        // A nice wide spiral
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const angle = t * Math.PI * 8; // 4 turns
            const radius = 12;
            const height = 40 * (1 - t); // 40 units high at start, 0 at end

            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            ));
        }
        const curve = new THREE.CatmullRomCurve3(points);
        // Tube: radius 3 to contain player
        // openEnded false
        return { geometry: new THREE.TubeGeometry(curve, 80, 2.5, 12, false) };
    }, []);

    return (
        <group position={position}>
            <RigidBody type="fixed" colliders="trimesh" friction={0.0} restitution={0.0}>
                <mesh geometry={geometry}>
                    <meshStandardMaterial color="#E040FB" side={THREE.DoubleSide} opacity={0.6} transparent />
                </mesh>

                {/* Center Pole for visuals */}
                <mesh position={[0, 20, 0]}>
                    <cylinderGeometry args={[1, 1, 40, 16]} />
                    <meshStandardMaterial color="gold" />
                </mesh>
            </RigidBody>

            {/* Trampoline at bottom to reach top */}
            <RigidBody type="fixed" colliders="hull" restitution={2.5}>
                <mesh position={[14, 0.5, 0]}>
                    <cylinderGeometry args={[2, 2, 0.5]} />
                    <meshStandardMaterial color="cyan" />
                </mesh>
            </RigidBody>
        </group>
    );
}
