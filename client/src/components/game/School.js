import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';

export default function School({ position = [0, 0, 0] }) {
    return (
        <group position={position}>
            {/* Main School Building */}
            <RigidBody type="fixed" colliders="cuboid">
                {/* Main Block */}
                <mesh position={[0, 4, 0]} castShadow receiveShadow>
                    <boxGeometry args={[16, 8, 10]} />
                    <meshStandardMaterial color="#FFCCBC" /> {/* Light Orange/Peach */}
                </mesh>

                {/* Roof */}
                <mesh position={[0, 8.5, 0]}>
                    <coneGeometry args={[11, 4, 4]} rotation={[0, Math.PI / 4, 0]} />
                    <meshStandardMaterial color="#D32F2F" /> {/* Red Roof */}
                </mesh>

                {/* Entrance Steps */}
                <mesh position={[0, 0.5, 6]} receiveShadow>
                    <boxGeometry args={[6, 1, 4]} />
                    <meshStandardMaterial color="#9E9E9E" />
                </mesh>

                {/* Pillars */}
                <mesh position={[-3, 4, 6]}>
                    <cylinderGeometry args={[0.5, 0.5, 8]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[3, 4, 6]}>
                    <cylinderGeometry args={[0.5, 0.5, 8]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </RigidBody>

            {/* Windows (Visual Only) */}
            <group position={[0, 4, 5.1]}>
                {[-5, -2, 2, 5].map((x, i) => (
                    <mesh key={i} position={[x, 1, 0]}>
                        <planeGeometry args={[2, 2]} />
                        <meshStandardMaterial color="#81D4FA" />
                    </mesh>
                ))}
                {[-5, -2, 2, 5].map((x, i) => (
                    <mesh key={`top-${i}`} position={[x, -2, 0]}>
                        <planeGeometry args={[2, 2]} />
                        <meshStandardMaterial color="#81D4FA" />
                    </mesh>
                ))}
            </group>

            {/* School Sign */}
            <group position={[0, 6.5, 5.2]}>
                <mesh position={[0, 0, -0.1]}>
                    <boxGeometry args={[6, 1.5, 0.2]} />
                    <meshStandardMaterial color="#F5F5F5" />
                </mesh>
                <Text
                    position={[0, 0, 0.1]}
                    fontSize={0.8}
                    color="#1A237E"
                    anchorX="center"
                    anchorY="middle"
                >
                    OKUL
                </Text>
            </group>
        </group>
    );
}
