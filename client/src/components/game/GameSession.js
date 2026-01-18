'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, Sky, PerspectiveCamera, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { useSocketStore } from '@/stores/socketStore';

import PlayerController from './PlayerController';
import TownWorld from './TownWorld';
import SchoolWorld from './SchoolWorld';
import RaceParkourWorld from './RaceParkourWorld';
import DrawingBoard from './DrawingBoard';
import Joystick from './Joystick';
import PlayerList from './PlayerList';
import MiniMap from './MiniMap';
import Chat from './Chat';
import VehicleToggle from './VehicleToggle';
import OutfitSelector from './OutfitSelector';
import MovementButtons from './MovementButtons';
import Notifications from './Notifications';
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
    const coins = useSocketStore((state) => state.coins);
    const houses = useSocketStore((state) => state.houses);

    const [joystickData, setJoystickData] = useState(null);
    const [buttonMove, setButtonMove] = useState(null);
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
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>

                <Canvas
                    shadows
                    gl={{
                        antialias: false, // Performance boost for PostFX
                        stencil: false,
                        depth: true,
                    }}
                >
                    <PerspectiveCamera makeDefault position={[0, 8, 20]} fov={50} />
                    <Suspense fallback={<Html center><div style={{ color: 'white', whiteSpace: 'nowrap' }}>Yükleniyor... ✨</div></Html>}>
                        <Atmosphere world={currentWorld} />

                        <Physics gravity={[0, -30, 0]}>
                            {currentWorld === 'town' && <TownWorld onDraw={handleWallDraw} />}
                            {currentWorld === 'school' && <SchoolWorld />}
                            {currentWorld === 'race' && <RaceParkourWorld />}

                            <PlayerController joystickData={joystickData} buttonMove={buttonMove} />
                        </Physics>

                        {/* Professional & Subtle Visual Stack */}
                        <EffectComposer disableNormalPass>
                            <Bloom
                                luminanceThreshold={1.1} // Only very bright things glow
                                mipmapBlur
                                intensity={0.5} // Much more subtle
                                radius={0.3}
                            />
                            <ToneMapping mode={THREE.ACESFilmicToneMapping} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>

                {/* UI Overlay */}
                <div className="hud-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'auto' }}>
                        <PlayerList />
                    </div>

                    <Notifications />

                    <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none' }}>
                        <button
                            onClick={() => useSocketStore.getState().setWorld('hub')}
                            className="glass-panel"
                            style={{
                                padding: '6px 12px', background: 'rgba(190, 24, 93, 0.7)',
                                color: 'white', pointerEvents: 'auto', border: 'none',
                                borderRadius: '15px', fontSize: '13px', fontWeight: 'bold'
                            }}
                        >
                            ÇIKIŞ 🏠
                        </button>
                        <div className="glass-panel" style={{ padding: '4px 12px', color: '#FFD54F', fontWeight: 'bold', display: 'flex', gap: '5px', pointerEvents: 'auto' }}>
                            💰 {coins}
                        </div>
                        <div style={{ pointerEvents: 'auto' }}> <MiniMap /> </div>
                        <div className="glass-panel" style={{ padding: '4px 10px', color: '#ff85c0', fontSize: '12px', fontWeight: 'bold', pointerEvents: 'auto' }}>
                            {currentWorld === 'school' ? '🏫 OKULDA' : currentWorld === 'race' ? '🏎️ PARKURDA' : '🏰 KASABADA'}
                        </div>
                        <button onClick={() => setShowDrawingBoard(true)} className="glass-panel" style={{ padding: '8px', background: 'rgba(0,0,0,0.4)', color: 'white', pointerEvents: 'auto', border: 'none', borderRadius: '50%' }}>🎨</button>
                    </div>

                    <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', flexDirection: 'column', gap: '20px', pointerEvents: 'none' }}>
                        <div style={{ pointerEvents: 'auto' }}> <MovementButtons onMove={setButtonMove} /> </div>
                        <div style={{ pointerEvents: 'auto' }}> <Chat /> </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: 20, right: '12%', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <button
                            onPointerDown={() => setJoystickData({ ...joystickData, jump: true })}
                            onPointerUp={() => setJoystickData({ ...joystickData, jump: false })}
                            style={{ width: '60px', height: '60px', background: 'rgba(233, 30, 99, 0.6)', border: '3px solid white', borderRadius: '50%', color: 'white', fontWeight: 'bold' }}
                        >UÇ!</button>
                        <Joystick onMove={setJoystickData} />
                    </div>

                    <div style={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto' }}>
                        <VehicleToggle />
                        <OutfitSelector />
                    </div>

                    {showDrawingBoard && (
                        <DrawingBoard onClose={() => { setShowDrawingBoard(false); setTargetPlacement(null); }} targetPlacement={targetPlacement} />
                    )}
                </div>
            </div>
        </KeyboardControls>
    );
}

function Atmosphere({ world }) {
    console.log('Atmosphere Rendering for world:', world);
    return (
        <>
            <Sky sunPosition={[100, 100, 100]} turbidity={0.1} />
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
