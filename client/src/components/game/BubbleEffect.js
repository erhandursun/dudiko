import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BubbleEffect({ position = [0, 0, 0], count = 20 }) {
    const mesh = useRef();

    // Create random initial positions for bubbles
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 5;
            const z = (Math.random() - 0.5) * 5;
            const y = Math.random() * 2;
            const speed = 0.02 + Math.random() * 0.05;
            const scale = 0.2 + Math.random() * 0.3;
            temp.push({ x, y, z, speed, scale, offset: Math.random() * 100 });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;

        particles.forEach((particle, i) => {
            // Update position
            particle.y += particle.speed;

            // Wiggle
            const wiggle = Math.sin(state.clock.elapsedTime * 2 + particle.offset) * 0.02;

            // Reset if too high
            if (particle.y > 5) {
                particle.y = 0;
            }

            dummy.position.set(
                particle.x + wiggle,
                position[1] + particle.y,
                particle.z + wiggle
            );
            dummy.scale.set(particle.scale, particle.scale, particle.scale);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group position={[position[0], 0, position[2]]}>
            <instancedMesh ref={mesh} args={[null, null, count]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial
                    color="#E1F5FE"
                    transparent
                    opacity={0.6}
                    roughness={0}
                    metalness={0.1}
                />
            </instancedMesh>
        </group>
    );
}
