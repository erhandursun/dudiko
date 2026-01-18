'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

export default function WeaponPickup({ position, onPickup }) {
    const ref = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (ref.current) {
            ref.current.rotation.y = time; // Spin
            ref.current.position.y = position[1] + Math.sin(time * 2) * 0.2; // Float
        }
    });

    return (
        <RigidBody type="fixed" colliders="hull" sensor onIntersectionEnter={onPickup}>
            <group ref={ref} position={position}>
                {/* Gun Body */}
                <mesh castShadow>
                    <boxGeometry args={[0.8, 0.3, 0.2]} />
                    <meshStandardMaterial color="#29B6F6" emissive="#29B6F6" emissiveIntensity={0.5} />
                </mesh>
                {/* Handle */}
                <mesh position={[0, -0.3, 0]} rotation={[0, 0, 0.2]}>
                    <boxGeometry args={[0.2, 0.4, 0.15]} />
                    <meshStandardMaterial color="#0277BD" />
                </mesh>
                {/* Rainbow Stripes */}
                <mesh position={[0.2, 0, 0.11]}>
                    <planeGeometry args={[0.4, 0.1]} />
                    <meshBasicMaterial color="red" />
                </mesh>
                <mesh position={[0.2, -0.1, 0.11]}>
                    <planeGeometry args={[0.4, 0.1]} />
                    <meshBasicMaterial color="yellow" />
                </mesh>

                {/* Glow ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                    <ringGeometry args={[0.5, 0.6, 32]} />
                    <meshBasicMaterial color="gold" transparent opacity={0.5} />
                </mesh>
            </group>
        </RigidBody>
    );
}
