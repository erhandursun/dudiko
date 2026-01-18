
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSocketStore } from '@/stores/socketStore';
import * as THREE from 'three';

// A simple colorful ball projectile
const Projectile = ({ position, direction }) => {
    const ref = useRef();
    const speed = 25; // Speed of paintball

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.x += direction.x * speed * delta;
            ref.current.position.y += direction.y * speed * delta;
            ref.current.position.z += direction.z * speed * delta;
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color={new THREE.Color().setHSL(Math.random(), 1, 0.5)} emissive="white" emissiveIntensity={0.5} />
        </mesh>
    );
};

export default function PaintballGun() {
    const shoot = useSocketStore(state => state.shoot);
    const projectiles = useSocketStore(state => state.projectiles);
    const hasWeapon = useSocketStore(state => state.hasWeapon);

    // If we want a separate renderer for projectiles, we can do it here or in Scene.
    // For now, let's render projectiles here globally or per-player?
    // Projectiles are synced via store, so we can render ALL of them here.

    return (
        <group>
            {/* Render all active projectiles from the store */}
            {projectiles.map(p => (
                <Projectile key={p.id} position={p.position} direction={p.direction} />
            ))}
        </group>
    );
}
