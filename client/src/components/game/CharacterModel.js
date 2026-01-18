/*
  Family Character Model
  Handles rendering for: Mother, Father, Child, Baby, Cat, Dog, Car
*/
import { useMemo } from 'react';
import * as THREE from 'three';
import VehicleModel from './VehicleModel';

export default function CharacterModel({
    color = "mediumpurple",
    type = "child",
    hairStyle = "classic",
    hairColor = "#3E2723",
    faceType = "happy",
    glassesType = "none", // none, round, sunglasses
    hatType = "none" // none, cap, wizard
}) {

    // Scale and Geometry logic based on type
    const scale = useMemo(() => {
        switch (type) {
            case 'mother': return [1.1, 1.1, 1.1];
            case 'father': return [1.2, 1.2, 1.2];
            case 'baby': return [0.5, 0.5, 0.5];
            case 'cat':
            case 'dog': return [0.6, 0.6, 0.6];
            case 'car': return [1, 1, 1];
            default: return [1, 1, 1]; // child
        }
    }, [type]);

    if (type === 'car') {
        return (
            <group position={[0, -0.75, 0]}>
                <VehicleModel color={color} />
            </group>
        );
    }

    // --- ANIMAL TYPES ---
    if (type === 'cat' || type === 'dog' || type === 'dino' || type === 'fairy') {
        const isCat = type === 'cat';
        const isDino = type === 'dino';
        const isFairy = type === 'fairy';
        const furColor = isFairy ? '#CE93D8' : (isDino ? '#81C784' : (isCat ? (color === 'mediumpurple' ? 'orange' : color) : (color === 'mediumpurple' ? '#8D6E63' : color)));

        return (
            <group position={[0, -0.85, 0]} scale={0.8}>
                <mesh position={[0, isFairy ? 1.0 : 0.4, 0]} castShadow>
                    <boxGeometry args={isFairy ? [0.2, 0.4, 0.2] : [0.4, 0.35, 0.7]} />
                    <meshStandardMaterial color={furColor} />
                </mesh>
                {isFairy && (
                    <group position={[0, 1.2, -0.1]}>
                        <mesh rotation={[0, 0, 0.5]}> <planeGeometry args={[0.5, 0.3]} /> <meshBasicMaterial color="white" transparent opacity={0.6} side={THREE.DoubleSide} /> </mesh>
                        <mesh rotation={[0, 0, -0.5]}> <planeGeometry args={[0.5, 0.3]} /> <meshBasicMaterial color="white" transparent opacity={0.6} side={THREE.DoubleSide} /> </mesh>
                    </group>
                )}
                {isDino && (
                    <group>
                        <mesh position={[0, 0.6, -0.3]}> <coneGeometry args={[0.1, 0.2, 4]} /> <meshStandardMaterial color="darkgreen" /> </mesh>
                        <mesh position={[0, 0.4, -0.5]}> <coneGeometry args={[0.1, 0.2, 4]} /> <meshStandardMaterial color="darkgreen" /> </mesh>
                    </group>
                )}
                <mesh position={[0, isFairy ? 1.3 : 0.7, 0.3]} castShadow>
                    <boxGeometry args={[0.3, 0.3, 0.3]} />
                    <meshStandardMaterial color={isFairy ? "#FFCC80" : furColor} />
                </mesh>
                {!isFairy && !isDino && (
                    <>
                        <mesh position={[0.1, 0.95, 0.3]}>
                            <coneGeometry args={[0.05, 0.15, 4]} rotation={[0, Math.PI / 4, 0]} />
                            <meshStandardMaterial color={furColor} />
                        </mesh>
                        <mesh position={[-0.1, 0.95, 0.3]}>
                            <coneGeometry args={[0.05, 0.15, 4]} rotation={[0, Math.PI / 4, 0]} />
                            <meshStandardMaterial color={furColor} />
                        </mesh>
                    </>
                )}
                {!isFairy && (
                    <mesh position={[0, 0.5, -0.4]} rotation={[isCat ? 0.5 : -0.2, 0, 0]}>
                        <boxGeometry args={[0.05, 0.05, 0.4]} />
                        <meshStandardMaterial color={furColor} />
                    </mesh>
                )}
                {!isFairy && [[-0.15, 0.2], [0.15, 0.2], [-0.15, -0.2], [0.15, -0.2]].map((pos, i) => (
                    <mesh key={i} position={[pos[0], 0.1, pos[1]]}>
                        <boxGeometry args={[0.1, 0.3, 0.1]} />
                        <meshStandardMaterial color={furColor} />
                    </mesh>
                ))}
            </group>
        );
    }

    // --- HUMAN TYPES (Mother, Father, Child, Baby) ---
    return (
        <group dispose={null} position={[0, -0.75, 0]} scale={scale}>

            {/* 1. Body / Outfit */}
            {type === 'father' ? (
                <group>
                    <mesh position={[-0.2, 0.75, 0]}> <boxGeometry args={[0.2, 1.5, 0.2]} /> <meshStandardMaterial color="darkblue" /> </mesh>
                    <mesh position={[0.2, 0.75, 0]}> <boxGeometry args={[0.2, 1.5, 0.2]} /> <meshStandardMaterial color="darkblue" /> </mesh>
                    <mesh position={[0, 1.8, 0]}> <boxGeometry args={[0.7, 1.2, 0.3]} /> <meshStandardMaterial color={color} /> </mesh>
                </group>
            ) : (
                <mesh position={[0, 0.75, 0]} castShadow>
                    <coneGeometry args={[0.6, 1.5, 32]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )}

            {/* Belt */}
            {type !== 'father' && type !== 'baby' && (
                <mesh position={[0, 1.0, 0]}>
                    <cylinderGeometry args={[0.36, 0.36, 0.1, 32]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            )}

            {/* 2. Head */}
            <mesh position={[0, type === 'father' ? 2.6 : 1.85, 0]} castShadow>
                <sphereGeometry args={[0.35, 32, 32]} />
                <meshStandardMaterial color="#FFE0BD" />
            </mesh>

            {/* 3. Hair Styles */}
            <group position={[0, type === 'father' ? 2.6 : 1.85, 0]}>
                {hairStyle === 'bob' && (
                    <mesh position={[0, 0.05, -0.05]}>
                        <sphereGeometry args={[0.38, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5]} />
                        <meshStandardMaterial color={hairColor} />
                    </mesh>
                )}
                {hairStyle === 'long' && (
                    <group>
                        <mesh position={[0, 0.1, 0]}> <sphereGeometry args={[0.36, 32, 32]} /> <meshStandardMaterial color={hairColor} /> </mesh>
                        <mesh position={[0, -0.2, -0.2]}> <boxGeometry args={[0.6, 0.6, 0.1]} /> <meshStandardMaterial color={hairColor} /> </mesh>
                    </group>
                )}
                {hairStyle === 'spiky' && (
                    <group>
                        <mesh position={[0, 0.1, 0]}> <sphereGeometry args={[0.36, 32, 32]} /> <meshStandardMaterial color={hairColor} /> </mesh>
                        {[0, 1, 2, 3, 4].map(i => (
                            <mesh key={i} position={[Math.sin(i) * 0.2, 0.35, Math.cos(i) * 0.2]} rotation={[0.5, i, 0]}>
                                <coneGeometry args={[0.1, 0.3, 8]} />
                                <meshStandardMaterial color={hairColor} />
                            </mesh>
                        ))}
                    </group>
                )}
                {(hairStyle === 'bun' || hairStyle === 'classic') && (
                    <group>
                        <mesh position={[0, 0.1, -0.1]} castShadow> <sphereGeometry args={[0.38, 32, 32]} /> <meshStandardMaterial color={hairColor} /> </mesh>
                        <mesh position={[0, 0.25, -0.2]} castShadow> <sphereGeometry args={[0.2, 32, 32]} /> <meshStandardMaterial color={hairColor} /> </mesh>
                    </group>
                )}
                {hairStyle === 'short' && (
                    <mesh position={[0, 0.2, 0]}>
                        <boxGeometry args={[0.5, 0.2, 0.5]} />
                        <meshStandardMaterial color={hairColor} />
                    </mesh>
                )}
            </group>

            {/* 4. Face Expressions */}
            <group position={[0, type === 'father' ? 2.6 : 1.85, 0.28]}>
                {/* Eyes */}
                {faceType === 'cool' ? (
                    <mesh position={[0, 0.05, 0.05]}>
                        <boxGeometry args={[0.5, 0.15, 0.05]} />
                        <meshStandardMaterial color="black" />
                    </mesh>
                ) : (
                    <>
                        <mesh position={[-0.12, 0.05, 0]}> <sphereGeometry args={[faceType === 'cute' ? 0.03 : 0.04, 16, 16]} /> <meshStandardMaterial color="black" /> </mesh>
                        <mesh position={[0.12, 0.05, 0]}> <sphereGeometry args={[faceType === 'cute' ? 0.03 : 0.04, 16, 16]} /> <meshStandardMaterial color="black" /> </mesh>
                    </>
                )}
                {/* Cheeks for Cute */}
                {faceType === 'cute' && (
                    <>
                        <mesh position={[-0.18, -0.05, -0.02]}> <sphereGeometry args={[0.06]} /> <meshBasicMaterial color="#FF80AB" transparent opacity={0.4} /> </mesh>
                        <mesh position={[0.18, -0.05, -0.02]}> <sphereGeometry args={[0.06]} /> <meshBasicMaterial color="#FF80AB" transparent opacity={0.4} /> </mesh>
                    </>
                )}
                {/* Mouth */}
                <mesh position={[0, -0.1, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.08, 0.1, 16, 1, 0, Math.PI]} />
                    <meshStandardMaterial color="black" side={THREE.DoubleSide} />
                </mesh>

                {/* GLASSES ACCESSORY */}
                {glassesType === 'round' && (
                    <group position={[0, 0.05, 0.05]}>
                        <mesh position={[-0.12, 0, 0]}> <ringGeometry args={[0.06, 0.08, 32]} /> <meshStandardMaterial color="black" side={THREE.DoubleSide} /> </mesh>
                        <mesh position={[0.12, 0, 0]}> <ringGeometry args={[0.06, 0.08, 32]} /> <meshStandardMaterial color="black" side={THREE.DoubleSide} /> </mesh>
                        <mesh position={[0, 0.0, 0]}> <boxGeometry args={[0.1, 0.02, 0.01]} /> <meshStandardMaterial color="black" /> </mesh>
                    </group>
                )}
                {glassesType === 'sunglasses' && (
                    <group position={[0, 0.05, 0.1]}>
                        <mesh position={[0, 0, 0]}> <boxGeometry args={[0.5, 0.15, 0.05]} /> <meshStandardMaterial color="#1A237E" /> </mesh>
                    </group>
                )}
            </group>

            {/* HAT ACCESSORY - Attached safely to head position */}
            <group position={[0, type === 'father' ? 2.6 : 1.85, 0]}>
                {hatType === 'cap' && (
                    <group position={[0, 0.35, 0.1]} rotation={[-0.2, 0, 0]}>
                        {/* Cap Base */}
                        <mesh position={[0, 0, -0.1]}> <sphereGeometry args={[0.39, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /> <meshStandardMaterial color="#1565C0" /> </mesh>
                        {/* Peak */}
                        <mesh position={[0, 0, 0.3]} rotation={[0.2, 0, 0]}> <boxGeometry args={[0.4, 0.05, 0.3]} /> <meshStandardMaterial color="#0D47A1" /> </mesh>
                    </group>
                )}
                {hatType === 'wizard' && (
                    <group position={[0, 0.3, 0]}>
                        <mesh position={[0, 0, 0]}> <cylinderGeometry args={[0.6, 0.6, 0.05]} /> <meshStandardMaterial color="#4A148C" /> </mesh>
                        <mesh position={[0, 0.5, 0]}> <coneGeometry args={[0.4, 1.2, 32]} /> <meshStandardMaterial color="#7B1FA2" /> </mesh>
                        <mesh position={[0, 0.5, 0.2]}> <sphereGeometry args={[0.1]} /> <meshStandardMaterial color="gold" /> </mesh>
                    </group>
                )}
            </group>

            {/* 5. Arms */}
            <mesh position={[-0.45, 1.1, 0]} rotation={[0, 0, 0.5]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.8]} />
                <meshStandardMaterial color="#FFE0BD" />
            </mesh>
            <mesh position={[0.45, 1.1, 0]} rotation={[0, 0, -0.5]} castShadow>
                <cylinderGeometry args={[0.1, 0.1, 0.8]} />
                <meshStandardMaterial color="#FFE0BD" />
            </mesh>
        </group>
    );
}
