'use client';

import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, PointerLockControls, Stars, Environment, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import TouchController from '../../components/mobile/TouchController';

// --- CORE ENGINE: Voxel Logic ---
const CHUNK_SIZE = 16;
const WORLD_HEIGHT = 8;

interface Block {
    position: [number, number, number];
    type: string;
    color: string;
}

function VoxelBlock({ position, color, onPointerDown }: { position: [number, number, number], color: string, onPointerDown: (e: any) => void }) {
    return (
        <mesh position={position} onPointerDown={onPointerDown} castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} map={null} roughness={0.7} metalness={0.2} />
        </mesh>
    );
}

// --- PLAYER: 3D Controller ---
function PlayerCharacter({ joystick, onAction }: { joystick: { x: number, y: number }, onAction: (action: string) => void }) {
    const group = useRef<THREE.Group>(null);
    const charMesh = useRef<THREE.Mesh>(null);
    const { camera } = useThree();

    // Movement logic
    useFrame((state, delta) => {
        if (!group.current) return;

        const speed = 5;
        const moveX = joystick.x;
        const moveZ = -joystick.y;

        // Calculate world movement based on camera orientation
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        forward.y = 0;
        right.y = 0;
        forward.normalize();
        right.normalize();

        const velocity = forward.multiplyScalar(moveZ * speed * delta).add(right.multiplyScalar(moveX * speed * delta));
        group.current.position.add(velocity);

        // Rotation
        if (moveX !== 0 || moveZ !== 0) {
            const angle = Math.atan2(moveX, moveZ);
            charMesh.current?.rotation.set(0, angle, 0);
        }

        // Camera follow (Third Person)
        const targetPos = group.current.position.clone().add(new THREE.Vector3(0, 5, 8).applyQuaternion(camera.quaternion));
        camera.position.lerp(targetPos, 0.1);
        camera.lookAt(group.current.position.clone().add(new THREE.Vector3(0, 1.5, 0)));
    });

    return (
        <group ref={group} position={[0, 1, 0]}>
            <mesh ref={charMesh}>
                <boxGeometry args={[0.8, 1.8, 0.5]} />
                <meshStandardMaterial color="#22d3ee" />
                {/* Eyes */}
                <mesh position={[0.2, 0.5, 0.3]}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshBasicMaterial color="white" />
                </mesh>
                <mesh position={[-0.2, 0.5, 0.3]}>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            </mesh>
        </group>
    );
}

// --- WORLD: Game logic ---
export default function VoxelWorld() {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [joystick, setJoystick] = useState({ x: 0, y: 0 });
    const [buildMode, setBuildMode] = useState<'place' | 'break'>('place');

    // Initial World Gen
    useEffect(() => {
        const initialBlocks: Block[] = [];
        for (let x = -8; x < 8; x++) {
            for (let z = -8; z < 8; z++) {
                initialBlocks.push({
                    position: [x, 0, z],
                    type: 'grass',
                    color: '#4ade80'
                });
            }
        }
        setBlocks(initialBlocks);
    }, []);

    const handleBlockAction = (e: any, pos: [number, number, number]) => {
        e.stopPropagation();
        if (buildMode === 'break') {
            setBlocks(prev => prev.filter(b => !(b.position[0] === pos[0] && b.position[1] === pos[1] && b.position[2] === pos[2])));
        } else {
            // Calculate new block position based on face normal
            const normal = e.face.normal.map(Math.round);
            const newPos: [number, number, number] = [pos[0] + normal[0], pos[1] + normal[1], pos[2] + normal[2]];
            setBlocks(prev => [...prev, { position: newPos, type: 'dirt', color: '#fbbf24' }]);
        }
    };

    return (
        <div className="relative w-full h-full bg-slate-950">
            <Canvas shadows camera={{ position: [5, 5, 5], fov: 75 }}>
                <Sky sunPosition={[100, 20, 100]} />
                <Stars />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} castShadow />

                <Suspense fallback={null}>
                    {blocks.map((block, i) => (
                        <VoxelBlock
                            key={i}
                            position={block.position}
                            color={block.color}
                            onPointerDown={(e) => handleBlockAction(e, block.position)}
                        />
                    ))}
                    <PlayerCharacter joystick={joystick} onAction={(a) => console.log(a)} />
                    <Environment preset="city" />
                </Suspense>

                <OrbitControls
                    makeDefault
                    minDistance={3}
                    maxDistance={15}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.1}
                />
            </Canvas>

            {/* HUD */}
            <div className="absolute top-6 left-6 flex flex-col gap-4 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 flex flex-col gap-1 shadow-2xl">
                    <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase">MOD</span>
                    <span className="text-white text-xl font-black italic uppercase">{buildMode === 'place' ? '🏗️ İNŞA ET' : '⚒️ PARÇALA'}</span>
                </div>
                <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest bg-black/20 p-2 rounded-lg">
                    DOKUNARAK BLOK KOY/YIK
                </div>
            </div>

            {/* Controls */}
            <TouchController
                onMove={setJoystick}
                actions={['Mod Değiştir']}
                onAction={() => setBuildMode(prev => prev === 'place' ? 'break' : 'place')}
            />
        </div>
    );
}
