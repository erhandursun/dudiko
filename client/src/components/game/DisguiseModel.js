
import React from 'react';

export default function DisguiseModel({ type }) {
    // Simple low-poly props for disguises
    return (
        <group dispose={null}>
            {type === 'tree' && (
                <group scale={1.5}>
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.2, 0.4, 1, 8]} />
                        <meshStandardMaterial color="#8D6E63" />
                    </mesh>
                    <mesh position={[0, 1.5, 0]}>
                        <coneGeometry args={[1, 2, 8]} />
                        <meshStandardMaterial color="#2E7D32" />
                    </mesh>
                    <mesh position={[0, 2.5, 0]}>
                        <coneGeometry args={[0.8, 1.5, 8]} />
                        <meshStandardMaterial color="#4CAF50" />
                    </mesh>
                </group>
            )}

            {type === 'lamp' && (
                <group scale={1.2}>
                    <mesh position={[0, 1.5, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
                        <meshStandardMaterial color="#424242" />
                    </mesh>
                    <mesh position={[0, 3, 0]}>
                        <boxGeometry args={[0.5, 0.5, 0.5]} />
                        <meshStandardMaterial color="#FFEB3B" emissive="#FFEB3B" emissiveIntensity={0.8} />
                    </mesh>
                </group>
            )}

            {type === 'trash' && (
                <group scale={1.2}>
                    <mesh position={[0, 0.75, 0]}>
                        <cylinderGeometry args={[0.4, 0.35, 1.5, 16]} />
                        <meshStandardMaterial color="#78909C" metallic={0.5} roughness={0.2} />
                    </mesh>
                    <mesh position={[0, 1.55, 0]}>
                        <cylinderGeometry args={[0.42, 0.42, 0.1, 16]} />
                        <meshStandardMaterial color="#546E7A" />
                    </mesh>
                </group>
            )}
        </group>
    );
}
