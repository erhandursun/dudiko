'use client';

import { RigidBody } from '@react-three/rapier';

export default function Boundaries() {
    const SIZE = 100; // Map size +/- 50
    const HEIGHT = 20;

    return (
        <group>
            {/* North Wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, HEIGHT / 2, -SIZE / 2]} visible={false}>
                    <boxGeometry args={[SIZE, HEIGHT, 1]} />
                    <meshStandardMaterial color="red" wireframe />
                </mesh>
            </RigidBody>

            {/* South Wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, HEIGHT / 2, SIZE / 2]} visible={false}>
                    <boxGeometry args={[SIZE, HEIGHT, 1]} />
                    <meshStandardMaterial color="red" wireframe />
                </mesh>
            </RigidBody>

            {/* East Wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[SIZE / 2, HEIGHT / 2, 0]} visible={false}>
                    <boxGeometry args={[1, HEIGHT, SIZE]} />
                    <meshStandardMaterial color="red" wireframe />
                </mesh>
            </RigidBody>

            {/* West Wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-SIZE / 2, HEIGHT / 2, 0]} visible={false}>
                    <boxGeometry args={[1, HEIGHT, SIZE]} />
                    <meshStandardMaterial color="red" wireframe />
                </mesh>
            </RigidBody>
        </group>
    );
}
