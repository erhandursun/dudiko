'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 20;

export default function Particles({ parentRef, isDriving }) {
    const meshRef = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Store particle data: position (vec3), scale (float), life (float 0-1)
    const particles = useMemo(() => {
        return new Array(PARTICLE_COUNT).fill(0).map(() => ({
            position: new THREE.Vector3(0, -100, 0), // Start hidden
            velocity: new THREE.Vector3(),
            life: 0,
            active: false
        }));
    }, []);

    useFrame((state, delta) => {
        if (!meshRef.current || !parentRef.current) return;

        const parentPos = parentRef.current.translation ? parentRef.current.translation() : parentRef.current.position;

        // Spawn new particles if driving and moving
        if (isDriving) {
            // Simple spawn rate check or just spawn 1 per frame if slot available
            const spawnIdx = particles.findIndex(p => !p.active);
            if (spawnIdx !== -1 && Math.random() > 0.5) {
                const p = particles[spawnIdx];
                p.active = true;
                p.life = 1.0;
                // Spawn behind the car slightly
                p.position.set(parentPos.x, parentPos.y + 0.2, parentPos.z);
                // Random drift
                p.velocity.set(
                    (Math.random() - 0.5) * 2,
                    Math.random() * 2,
                    (Math.random() - 0.5) * 2
                );
            }
        }

        // Update all particles
        meshRef.current.instanceMatrix.needsUpdate = true;

        particles.forEach((p, i) => {
            if (p.active) {
                p.life -= delta * 2; // Fade out speed
                if (p.life <= 0) {
                    p.active = false;
                    p.position.set(0, -100, 0); // Hide
                } else {
                    p.position.addScaledVector(p.velocity, delta);
                    p.velocity.y += delta * 0.5; // Rise up
                }
            }

            dummy.position.copy(p.position);
            const scale = p.active ? p.life * 0.3 : 0;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        });
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
            <sphereGeometry args={[0.5, 6, 6]} />
            <meshBasicMaterial color="#FFEB3B" transparent opacity={0.6} />
        </instancedMesh>
    );
}
