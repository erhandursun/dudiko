'use client';

import { RigidBody } from '@react-three/rapier';

export default function GlassHouse({ position, color = "#E040FB" }) {
    const SIZE = 10;
    const WALL_HEIGHT = 6;
    const THICKNESS = 0.5;

    return (
        <group position={position}>
            {/* FLOOR */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, 0.1, 0]} receiveShadow>
                    <boxGeometry args={[SIZE, 0.2, SIZE]} />
                    <meshStandardMaterial color="#F8BBD0" />
                </mesh>
            </RigidBody>

            {/* WALLS (Glass) - Separate rigid bodies to allow entry */}

            {/* Back Wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, WALL_HEIGHT / 2, -SIZE / 2]} castShadow>
                    <boxGeometry args={[SIZE, WALL_HEIGHT, THICKNESS]} />
                    <meshPhysicalMaterial
                        color="lightblue"
                        transparent
                        opacity={0.3}
                        roughness={0}
                        metalness={0.1}
                        transmission={0.5} // Glass effect
                        thickness={1}
                    />
                </mesh>
            </RigidBody>

            {/* Right Wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[SIZE / 2, WALL_HEIGHT / 2, 0]} castShadow>
                    <boxGeometry args={[THICKNESS, WALL_HEIGHT, SIZE]} />
                    <meshPhysicalMaterial color="lightblue" transparent opacity={0.3} transmission={0.5} />
                </mesh>
            </RigidBody>

            {/* Left Wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-SIZE / 2, WALL_HEIGHT / 2, 0]} castShadow>
                    <boxGeometry args={[THICKNESS, WALL_HEIGHT, SIZE]} />
                    <meshPhysicalMaterial color="lightblue" transparent opacity={0.3} transmission={0.5} />
                </mesh>
            </RigidBody>

            {/* Front Wall (With Door Gap) */}
            {/* Left part of front wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-3, WALL_HEIGHT / 2, SIZE / 2]} castShadow>
                    <boxGeometry args={[4, WALL_HEIGHT, THICKNESS]} />
                    <meshPhysicalMaterial color="lightblue" transparent opacity={0.3} transmission={0.5} />
                </mesh>
            </RigidBody>
            {/* Right part of front wall */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[3, WALL_HEIGHT / 2, SIZE / 2]} castShadow>
                    <boxGeometry args={[4, WALL_HEIGHT, THICKNESS]} />
                    <meshPhysicalMaterial color="lightblue" transparent opacity={0.3} transmission={0.5} />
                </mesh>
            </RigidBody>
            {/* Top part of door frame */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, WALL_HEIGHT - 1, SIZE / 2]} castShadow>
                    <boxGeometry args={[2, 2, THICKNESS]} />
                    <meshPhysicalMaterial color="lightblue" transparent opacity={0.3} transmission={0.5} />
                </mesh>
            </RigidBody>

            {/* ROOF */}
            <RigidBody type="fixed" colliders="hull">
                <mesh position={[0, WALL_HEIGHT + 2, 0]} castShadow>
                    <coneGeometry args={[8, 4, 4]} rotation={[0, Math.PI / 4, 0]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </RigidBody>

            {/* Interior Light */}
            <pointLight position={[0, WALL_HEIGHT - 1, 0]} intensity={0.5} color="orange" distance={15} decay={2} />
        </group>
    );
}
