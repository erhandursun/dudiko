import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Fireworks({ position = [0, 10, 0], color = "gold", count = 50 }) {
    const mesh = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const speed = 0.2 + Math.random() * 0.3;

            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.sin(phi) * Math.sin(theta);
            const z = Math.cos(phi);

            temp.push({
                velocity: new THREE.Vector3(x, y, z).multiplyScalar(speed),
                position: new THREE.Vector3(0, 0, 0),
                scale: 1,
                life: 1.0
            });
        }
        return temp;
    }, [count]);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        if (!mesh.current) return;

        let activeCount = 0;

        particles.forEach((particle, i) => {
            if (particle.life > 0) {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.01; // Gravity
                particle.life -= 0.02;
                particle.scale = particle.life; // Shrink

                activeCount++;
            } else {
                particle.scale = 0;
            }

            dummy.position.copy(particle.position);
            dummy.scale.set(particle.scale, particle.scale, particle.scale);
            dummy.updateMatrix();

            mesh.current.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group position={position}>
            <instancedMesh ref={mesh} args={[null, null, count]}>
                <boxGeometry args={[0.2, 0.2, 0.2]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            </instancedMesh>
        </group>
    );
}
