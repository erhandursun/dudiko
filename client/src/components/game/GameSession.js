'use client';

import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { useSocketStore } from '@/stores/socketStore';

import PlayerController from './PlayerController';
import TownWorld from './TownWorld';
import SchoolWorld from './SchoolWorld';
import RaceParkourWorld from './RaceParkourWorld';
import CandyWorld from './CandyWorld';
import LibraryRaceWorld from './LibraryRaceWorld';
import DrawingBoard from './DrawingBoard';
import PaintballGun from './PaintballGun';
import Overlay from '../UI/Overlay';
import MobileControls from '../UI/MobileControls';
import PlayerList from './PlayerList';
import * as THREE from 'three';

const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
];

export default function GameSession() {
    const currentWorld = useSocketStore((state) => state.currentWorld);
    const houses = useSocketStore((state) => state.houses);

    const [showDrawingBoard, setShowDrawingBoard] = useState(false);
    const [targetPlacement, setTargetPlacement] = useState(null);

    const handleWallDraw = (houseId, side) => {
        const houseData = houses[houseId];
        if (!houseData) return;
        const [hx, hy, hz] = houseData.position || [0, 0, 0];
        const hRotY = (houseData.rotation && houseData.rotation[1]) || 0;
        const localOffset = new THREE.Vector3(side === 'left' ? -3.8 : 3.8, 3, 0);
        localOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), hRotY);
        const worldPos = [hx + localOffset.x, hy + localOffset.y, hz + localOffset.z];
        const worldRot = [0, hRotY + (side === 'left' ? -Math.PI / 2 : Math.PI / 2), 0];

        setTargetPlacement({ position: worldPos, rotation: worldRot, houseId });
        setShowDrawingBoard(true);
    };

    return (
        <KeyboardControls map={keyboardMap}>
            <div className="relative w-full h-full bg-black">

                {/* 3D ENGINE LAYER */}
                <Canvas
                    shadows
                    gl={{
                        antialias: false,
                        stencil: false,
                        depth: true,
                    }}
                >
                    <PerspectiveCamera makeDefault position={[0, 8, 20]} fov={50} />
                    <color attach="background" args={['#87CEEB']} /> {/* Fix black sky */}
                    <Suspense fallback={null}>
                        <Atmosphere world={currentWorld} />

                        <Physics gravity={[0, -30, 0]}>
                            {currentWorld === 'town' && <TownWorld onDraw={handleWallDraw} />}
                            {currentWorld === 'school' && <SchoolWorld />}
                            {currentWorld === 'race' && <RaceParkourWorld />}
                            {currentWorld === 'candy' && <CandyWorld />}
                            {currentWorld === 'library-race' && <LibraryRaceWorld />}

                            <PaintballGun />
                            <PlayerController />
                        </Physics>

                        <EffectComposer disableNormalPass>
                            <Bloom luminanceThreshold={1.1} mipmapBlur intensity={0.5} radius={0.3} />
                            <ToneMapping mode={THREE.ACESFilmicToneMapping} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>

                {/* MODERN UI LAYER (NEW) */}
                <Overlay />
                <MobileControls />
                <PlayerList />

                {/* INTERACTIVE PANELS (Draw, Shop etc) */}
                {showDrawingBoard && (
                    <DrawingBoard
                        onClose={() => { setShowDrawingBoard(false); setTargetPlacement(null); }}
                        targetPlacement={targetPlacement}
                    />
                )}
            </div>
        </KeyboardControls>
    );
}

function Atmosphere({ world }) {
    return (
        <>
            <ambientLight intensity={world === 'school' ? 1.0 : 0.8} />
            <directionalLight
                position={[50, 100, 50]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />
        </>
    );
}
