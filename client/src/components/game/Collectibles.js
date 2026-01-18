'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';
import * as THREE from 'three';

// Defined star locations (Sky Path)
const STAR_LOCATIONS = [
    [10, 1, 10], // Ground easy
    [-10, 1, -10],
    [5, 1, 5],
    [15, 17, 15], // On cloud 1
    [-15, 27, -15], // On cloud 2
    [0, 42, 20], // On cloud 3
    [0, 62, 0], // Moon Palace
    [0, 65, -5], // Top of Palace
    [5, 45, 5], // Mid air
    [-5, 35, 5]
];

function Star({ position, id, taken, onCollect }) {
    const ref = useRef();

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.y += delta;
        }
    });

    if (taken) return null;

    return (
        <group position={position} ref={ref}>
            <mesh
                onClick={onCollect} // Click to collect for mobile/ease
                onPointerEnter={onCollect} // Hover to collect? Need proximity check really.
                castShadow
            >
                <cylinderGeometry args={[0.5, 0.5, 0.2, 5]} />
                <meshStandardMaterial color="gold" emissive="yellow" emissiveIntensity={0.5} />
            </mesh>
        </group>
    );
}

export default function Collectibles({ playerPos }) {
    const [collected, setCollected] = useState({}); // Local tracking for now
    const unlockFlight = useSocketStore((state) => state.unlockFlight);
    const flightUnlocked = useSocketStore((state) => state.flightUnlocked);

    // Check proximity
    useFrame(() => {
        if (!playerPos || !playerPos.current) return;

        const pos = playerPos.current.translation();

        STAR_LOCATIONS.forEach((loc, index) => {
            if (collected[index]) return;

            const dist = Math.sqrt(
                Math.pow(pos.x - loc[0], 2) +
                Math.pow(pos.y - loc[1], 2) +
                Math.pow(pos.z - loc[2], 2)
            );

            if (dist < 2) {
                // Collected!
                setCollected(prev => {
                    const newState = { ...prev, [index]: true };
                    // Check if all/enough collected ? 
                    // Let's say 5 is enough for now
                    if (Object.keys(newState).length >= 5 && !flightUnlocked) {
                        unlockFlight();
                    }
                    return newState;
                });
            }
        });
    });

    return (
        <group>
            {STAR_LOCATIONS.map((pos, i) => (
                <Star
                    key={i}
                    id={i}
                    position={pos}
                    taken={collected[i]}
                    onCollect={() => { }}
                />
            ))}
        </group>
    );
}
