import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FairyDust({ parentRef, isFlying }) {
    const mesh = useRef();
    const count = 30;

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                time: Math.random() * 100,
                speed: 0.05 + Math.random() * 0.1,
                offset: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 1.0, // vertical spread
                    (Math.random() - 0.5) * 0.5
                ),
                active: false
            });
        }
        return temp;
    }, []);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const lastPlayerPos = useRef(new THREE.Vector3());

    useFrame((state) => {
        if (!mesh.current || !parentRef.current) return;

        const playerPos = parentRef.current.translation();
        const pPos = new THREE.Vector3(playerPos.x, playerPos.y, playerPos.z);

        // Spawn/Emit logic
        if (isFlying) {
            // Activate random particle if inactive
            particles.forEach(p => {
                if (!p.active && Math.random() > 0.8) {
                    p.active = true;
                    p.life = 1.0;
                    p.pos = pPos.clone().add(p.offset);
                }
            });
        }

        let activeCount = 0;
        particles.forEach((p, i) => {
            if (p.active) {
                p.life -= 0.03;
                p.pos.y -= 0.02; // Gravity/Falling dust

                if (p.life <= 0) {
                    p.active = false;
                    dummy.scale.set(0, 0, 0);
                } else {
                    dummy.position.copy(p.pos);
                    const s = p.life * 0.3; // Scale down
                    dummy.scale.set(s, s, s);
                }
            } else {
                dummy.scale.set(0, 0, 0);
            }

            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });

        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} transparent opacity={0.8} />
        </instancedMesh>
    );
}
