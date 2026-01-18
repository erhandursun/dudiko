'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';

export default function Projectile({ position, direction }) {
    const ref = useRef();
    const SPEED = 0.8;
    // Simple state to force re-render for color cycle if needed, but shader/material is better.
    // We'll use a ref for position update.

    useFrame(() => {
        if (ref.current) {
            ref.current.position.x += direction[0] * SPEED;
            ref.current.position.y += direction[1] * SPEED;
            ref.current.position.z += direction[2] * SPEED;
        }
    });

    return (
        <group ref={ref} position={position}>
            <Trail width={0.4} length={4} color={'white'} attenuation={(t) => t * t}>
                <mesh>
                    <sphereGeometry args={[0.2]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            </Trail>
            {/* Rainbow Core */}
            <pointLight distance={5} intensity={2} color="cyan" />
        </group>
    );
}
