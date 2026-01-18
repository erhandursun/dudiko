import { RigidBody } from '@react-three/rapier';
import GiantSlide from './GiantSlide'; // Kept specifically if needed elsewhere or strictly updating imports
import Boundaries from './Boundaries';
import GlassHouse from './GlassHouse';
import MathBoard from './MathBoard';
import School from './School';
import MathGarden from './MathGarden';
import PlatformJumpGame from './PlatformJumpGame';
import { Text } from '@react-three/drei'; // Fixed missing import
import { useMemo, useRef } from 'react';
import React from 'react';
import { useFrame } from '@react-three/fiber';
import HouseUnit from './HouseUnit';
import Park from './Park';
import { JumpPad, PhysicsBall, SpeedGate } from './FunInteractions';
import Leaderboard from './Leaderboard';
import { ReadingNook, CafeZone, XOXBoard } from './InteractionZones';

// --- SUB-COMPONENTS ---

function Ground() {
    return (
        <RigidBody type="fixed" colliders="cuboid" friction={1}>
            <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[100, 1, 100]} />
                <meshStandardMaterial color="#81C784" /> {/* Pastel Green Grass */}
            </mesh>
        </RigidBody>
    );
}

function Road({ position, rotation = [0, 0, 0] }) {
    return (
        <group position={position} rotation={rotation}>
            <mesh receiveShadow position={[0, 0.06, 0]}>
                <boxGeometry args={[4, 0.05, 4]} />
                <meshStandardMaterial color="#F8BBD0" /> {/* Pastel Pink Road */}
            </mesh>
            {/* White Dashes */}
            <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.2, 0.8]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
}



function Tree({ position }) {
    return (
        <RigidBody type="fixed" colliders="hull">
            <group position={position}>
                {/* Trunk */}
                <mesh position={[0, 1, 0]} castShadow>
                    <cylinderGeometry args={[0.2, 0.4, 2]} />
                    <meshStandardMaterial color="#5D4037" />
                </mesh>
                {/* Leaves */}
                <mesh position={[0, 2.5, 0]} castShadow>
                    <sphereGeometry args={[1.5, 16, 16]} />
                    <meshStandardMaterial color="#2E7D32" />
                </mesh>
            </group>
        </RigidBody>
    );
}

function Flower({ position, color = "red" }) {
    return (
        <group position={position}>
            {/* Stem */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.2]} />
                <meshStandardMaterial color="green" />
            </mesh>
            {/* Petals */}
            <mesh position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshStandardMaterial color={color} />
            </mesh>
        </group>
    );
}

function FloatingLantern({ position }) {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
        }
    });
    return (
        <mesh ref={ref} position={position}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFECB3" emissive="#FFD54F" emissiveIntensity={2} />
            <pointLight distance={5} intensity={1} color="#FFD54F" />
        </mesh>
    );
}

function Balloon({ position, color }) {
    const ref = useRef();
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
            ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.3;
        }
    });
    return (
        <group ref={ref} position={position}>
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, -0.6, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.8]} />
                <meshStandardMaterial color="white" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}

function MagicPatch({ position, color }) {
    return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[4, 32]} />
            <meshStandardMaterial color={color} transparent opacity={0.2} depthWrite={false} />
        </mesh>
    );
}

function Castle({ position = [0, 0, 0] }) {
    return (
        <RigidBody type="fixed" colliders="trimesh">
            <group position={position}>
                {/* Central Keep */}
                <mesh position={[0, 4, 0]} castShadow receiveShadow>
                    {/* ... (Kept same geometry but inside positioned group) ... */}
                    <boxGeometry args={[6, 8, 6]} />
                    <meshStandardMaterial color="#E1BEE7" /> {/* Lavender */}
                </mesh>
                <mesh position={[0, 9, 0]} castShadow>
                    <coneGeometry args={[4.5, 4, 4]} rotation={[0, Math.PI / 4, 0]} />
                    <meshStandardMaterial color="#AB47BC" /> {/* Deep Purple */}
                </mesh>

                {/* Corner Towers */}
                {[[-4, -4], [-4, 4], [4, -4], [4, 4]].map(([x, z], i) => (
                    <group key={i} position={[x, 0, z]}>
                        <mesh position={[0, 5, 0]} castShadow>
                            <cylinderGeometry args={[1.5, 1.5, 10]} />
                            <meshStandardMaterial color="#CE93D8" />
                        </mesh>
                        <mesh position={[0, 11, 0]} castShadow>
                            <coneGeometry args={[2, 3, 16]} />
                            <meshStandardMaterial color="#AB47BC" />
                        </mesh>
                        {/* Flag */}
                        <mesh position={[0, 13, 0]}>
                            <cylinderGeometry args={[0.05, 0.05, 2]} />
                            <meshStandardMaterial color="gold" />
                        </mesh>
                        <mesh position={[0.5, 13.5, 0]} rotation={[0, 0, -Math.PI / 2]}>
                            <coneGeometry args={[0.5, 1, 3]} />
                            <meshStandardMaterial color="hotpink" />
                        </mesh>
                    </group>
                ))}

                {/* Gatehouse */}
                <mesh position={[0, 2, 4.5]} castShadow>
                    <boxGeometry args={[3, 4, 2]} />
                    <meshStandardMaterial color="#E1BEE7" />
                </mesh>
                <mesh position={[0, 1.5, 5.6]}>
                    <planeGeometry args={[1.5, 2.5]} />
                    <meshStandardMaterial color="#3E2723" />
                </mesh>

                {/* Walls connecting towers */}
                <mesh position={[0, 3, -4]} castShadow>
                    <boxGeometry args={[8, 6, 1]} />
                    <meshStandardMaterial color="#E1BEE7" />
                </mesh>
                <mesh position={[0, 3, 4]} castShadow>
                    <boxGeometry args={[8, 6, 1]} />
                    <meshStandardMaterial color="#E1BEE7" />
                </mesh>
                <mesh position={[-4, 3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                    <boxGeometry args={[8, 6, 1]} />
                    <meshStandardMaterial color="#E1BEE7" />
                </mesh>
                <mesh position={[4, 3, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                    <boxGeometry args={[8, 6, 1]} />
                    <meshStandardMaterial color="#E1BEE7" />
                </mesh>
            </group>
        </RigidBody>
        // ... (End of Castle)
    );
}

function CloudPlatform({ position, size = [5, 0.5, 5] }) {
    return (
        <RigidBody type="fixed" colliders="trimesh">
            <group position={position}>
                {/* Fluffy Cloud (Made of spheres) */}
                <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={size} />
                    <meshStandardMaterial color="white" transparent opacity={0.9} />
                </mesh>
                <mesh position={[size[0] / 2, 0.5, size[2] / 2]} castShadow>
                    <sphereGeometry args={[2]} />
                    <meshStandardMaterial color="white" transparent opacity={0.8} />
                </mesh>
                <mesh position={[-size[0] / 2, 0.5, -size[2] / 2]} castShadow>
                    <sphereGeometry args={[1.5]} />
                    <meshStandardMaterial color="white" transparent opacity={0.8} />
                </mesh>
            </group>
        </RigidBody>
    );
}

function MoonPalace({ position }) {
    return (
        <group position={position}>
            {/* Main Platform */}
            <RigidBody type="fixed" colliders="trimesh">
                <mesh receiveShadow>
                    <cylinderGeometry args={[15, 2, 2, 8]} />
                    <meshStandardMaterial color="#FFF9C4" /> {/* Pale Yellow */}
                </mesh>
            </RigidBody>

            {/* The Palace */}
            <RigidBody type="fixed" colliders="trimesh">
                <mesh position={[0, 5, -5]} castShadow>
                    <boxGeometry args={[10, 10, 5]} />
                    <meshStandardMaterial color="#6A1B9A" /> {/* Deep Purple */}
                </mesh>
                <mesh position={[0, 12, -5]}>
                    <coneGeometry args={[6, 8, 4]} rotation={[0, Math.PI / 4, 0]} />
                    <meshStandardMaterial color="#FFD54F" /> {/* Gold */}
                </mesh>
                <mesh position={[0, 16, -5]}>
                    <sphereGeometry args={[1]} />
                    <meshStandardMaterial color="white" emissive="white" emissiveIntensity={2} />
                </mesh>
            </RigidBody>
        </group>
    );
}

// Trampoline moved to FunInteractions as JumpPad


function Rainbow({ position = [0, 40, 0] }) {
    const colors = ["#FF5252", "#FF9800", "#FFEB3B", "#4CAF50", "#2196F3", "#9C27B0"];
    return (
        <group position={position} rotation={[0, Math.PI / 4, 0]}>
            {colors.map((color, i) => (
                <mesh key={color} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[50 - i * 1.5, 0.6, 16, 100, Math.PI]} />
                    <meshStandardMaterial color={color} transparent opacity={0.6} emissive={color} emissiveIntensity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

export default function City({ onDraw }) {
    const natureSlots = useMemo(() => {
        const slots = [];
        const flowerCount = 250; // More flowers!
        const flowers = ["#FF80AB", "#F48FB1", "#CE93D8", "#FFF59D", "#FFAB91", "#4FC3F7", "#81C784", "#FFB74D"];

        // Colorful Ground Patches
        const patchColors = ["#E1BEE7", "#C8E6C9", "#B3E5FC", "#FFF9C4", "#FFCCBC"];
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 110;
            const z = (Math.random() - 0.5) * 110;
            if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
            slots.push(<MagicPatch key={`patch-${i}`} position={[x, 0.02, z]} color={patchColors[i % patchColors.length]} />);
        }

        // Flowers
        for (let i = 0; i < flowerCount; i++) {
            const x = (Math.random() - 0.5) * 130;
            const z = (Math.random() - 0.5) * 130;
            if (Math.abs(x) < 20 && Math.abs(z) < 20) continue;
            const color = flowers[Math.floor(Math.random() * flowers.length)];
            slots.push(<Flower key={`flower-rand-${i}`} position={[x, 0, z]} color={color} />);
        }

        // Floating Lanterns
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            const y = 3 + Math.random() * 5;
            slots.push(<FloatingLantern key={`lantern-${i}`} position={[x, y, z]} />);
        }

        // Balloon Clusters
        const balloonColors = ["#FF5252", "#FF4081", "#E040FB", "#7C4DFF", "#536DFE", "#448AFF", "#40C4FF", "#18FFFF"];
        for (let i = 0; i < 8; i++) {
            const baseX = (Math.random() - 0.5) * 80;
            const baseZ = (Math.random() - 0.5) * 80;
            if (Math.abs(baseX) < 25 && Math.abs(baseZ) < 25) continue;
            for (let j = 0; j < 3; j++) {
                const x = baseX + (Math.random() - 0.5) * 2;
                const z = baseZ + (Math.random() - 0.5) * 2;
                const y = 2 + Math.random() * 2;
                slots.push(<Balloon key={`balloon-${i}-${j}`} position={[x, y, z]} color={balloonColors[Math.floor(Math.random() * balloonColors.length)]} />);
            }
        }

        return slots;
    }, []);

    const houseSlots = useMemo(() => {
        const slots = [];
        const count = 20;
        const radius = 45; // Spaced out for larger houses

        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            // Calculate rotation to face center [0,0,0]
            // Default HouseUnit faces +Z (front wall is at +3.9)
            // atan2(x, z) gives the angle to the point
            const rotY = Math.atan2(x, z);

            slots.push(
                <HouseUnit
                    key={`house-${i}`}
                    id={`house-${i}`}
                    position={[x, 0, z]}
                    rotation={[0, rotY, 0]}
                    onDraw={onDraw}
                />
            );
        }
        return slots;
    }, []);

    return (
        <group>
            {/* Ground */}
            <Ground />

            {/* Castle at a distance */}
            <Castle position={[0, 0, -80]} />

            {/* Central Landmark / Plaza */}
            <RigidBody type="fixed" colliders="hull">
                <group position={[0, 0, 0]}>
                    <mesh position={[0, 0.2, 0]}>
                        <cylinderGeometry args={[12, 12, 0.4, 32]} />
                        <meshStandardMaterial color="#ECEFF1" />
                    </mesh>
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[4, 5, 1, 8]} />
                        <meshStandardMaterial color="#FFD54F" />
                    </mesh>
                    <Text
                        position={[0, 8, 0]}
                        fontSize={2.5}
                        color="white"
                        outlineWidth={0.12}
                        outlineColor="#D81B60"
                    >
                        PRENSES MEYDANI ✨
                    </Text>

                    {/* Soru Tahtaları (Math Boards) etrafa diziliyor */}
                    {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
                        <group key={i} position={[Math.cos(angle) * 8, 0, Math.sin(angle) * 8]} rotation={[0, -angle + Math.PI / 2, 0]}>
                            <MathBoard />
                        </group>
                    ))}
                </group>
            </RigidBody>

            {/* The 20 Garden Houses */}
            {houseSlots}

            <Rainbow position={[0, 40, -20]} />

            <Boundaries />

            {/* Magical Atmosphere */}
            <FloatingLantern position={[5, 4, 5]} />
            <FloatingLantern position={[-5, 5, -8]} />
            <FloatingLantern position={[10, 6, -3]} />

            {/* Balloons near the plaza */}
            <Balloon position={[7, 3, 7]} color="hotpink" />
            <Balloon position={[-8, 4, 6]} color="#4FC3F7" />

            {/* Nature Distribution */}
            {natureSlots}

            {/* Ground JumpPad for extra fun */}
            <JumpPad position={[15, 0, -15]} />

            {/* Physics Ball near the plaza */}
            <PhysicsBall position={[10, 5, 10]} />
            <PhysicsBall position={[-10, 5, -10]} />

            {/* Speed Gates around the center */}
            <SpeedGate position={[20, 2, 0]} rotation={[0, Math.PI / 2, 0]} />
            <SpeedGate position={[-20, 2, 0]} rotation={[0, -Math.PI / 2, 0]} />

            {/* Keep Sky Kingdom for elevation gameplay */}
            <CloudPlatform position={[15, 15, 15]} size={[8, 1, 8]} />
            <CloudPlatform position={[-15, 25, -15]} size={[8, 1, 8]} />
            <CloudPlatform position={[0, 40, 20]} size={[10, 1, 10]} />
            <MoonPalace position={[0, 60, 0]} />

            <JumpPad position={[15, 16, 15]} />
            <JumpPad position={[-15, 26, -15]} />
            <JumpPad position={[0, 41, 20]} />

            {/* --- PLAZA LIFE --- */}
            {/* Top Leaderboard in the center */}
            <Leaderboard position={[0, 0, -10]} rotation={[0, 0, 0]} />

            {/* Reading Nook in the park area */}
            <ReadingNook position={[-20, 0, -20]} />

            {/* Cafe in the plaza */}
            <CafeZone position={[8, 0, -5]} />

            {/* XOX Game board */}
            <XOXBoard position={[-8, 0, -5]} />

            {/* Park Area */}
            <Park position={[-25, 0, -25]} />

            {/* Math Garden & Games (Restored) */}
            <MathGarden position={[30, 0, 30]} />

            {/* Individal trees removed as requested */}
        </group>
    );
}
