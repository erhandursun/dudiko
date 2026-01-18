'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, RigidBody } from '@react-three/rapier';
import { Sky, Stars, KeyboardControls } from '@react-three/drei';
import PlayerController from './PlayerController';
import Joystick from './Joystick';
import React, { useState, useCallback, useRef } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import RemotePlayer from './RemotePlayer';
import City from './City';
import OutfitSelector from './OutfitSelector';
import VehicleToggle from './VehicleToggle';
import PlayerList from './PlayerList';
import MiniMap from './MiniMap';
import Chat from './Chat';
import DrawingBoard from './DrawingBoard';
import ArtGallery from './ArtGallery';
import CharacterSelector from './CharacterSelector';
import MovementButtons from './MovementButtons';
import * as THREE from 'three';

const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'right', keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump', keys: ['Space'] },
];

export default function Scene() {
    const [joystickData, setJoystickData] = useState(null);
    const [buttonMove, setButtonMove] = useState(null);
    const [showDrawingBoard, setShowDrawingBoard] = useState(false);
    const [targetPlacement, setTargetPlacement] = useState(null);

    // Load player data from store
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);

    const handleJoystickMove = useCallback((data) => {
        if (data) {
            setJoystickData(data);
        } else {
            setJoystickData(null);
        }
    }, []);

    const handleJoystickEnd = useCallback(() => {
        setJoystickData(null);
    }, []);

    const coins = useSocketStore((state) => state.coins);
    const houses = useSocketStore((state) => state.houses);

    const handleWallDraw = (houseId, side) => {
        const houseData = houses[houseId];
        if (!houseData) return;

        const [hx, hy, hz] = houseData.position || [0, 0, 0];
        const hRotY = (houseData.rotation && houseData.rotation[1]) || 0;

        const localOffset = new THREE.Vector3(side === 'left' ? -3.8 : 3.8, 3, 0);
        localOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), hRotY);

        const worldPos = [hx + localOffset.x, hy + localOffset.y, hz + localOffset.z];
        const worldRot = [0, hRotY + (side === 'left' ? -Math.PI / 2 : Math.PI / 2), 0];

        setTargetPlacement({
            position: worldPos,
            rotation: worldRot,
            houseId: houseId
        });
        setShowDrawingBoard(true);
    };

    return (
        <KeyboardControls map={keyboardMap}>
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                {/* ... UI Elements ... */}

                <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }} style={{ width: '100%', height: '100%' }}>

                    {/* Fog for depth blending */}
                    <fog attach="fog" args={['#87CEEB', 10, 60]} />

                    {/* Dynamic Atmosphere */}
                    <Atmosphere />

                    <Physics gravity={[0, -30, 0]}>
                        <City onDraw={handleWallDraw} />
                        <PlayerController joystickData={joystickData} buttonMove={buttonMove} />
                        <ArtGallery />

                        {/* Remote Players */}
                        {Object.entries(players).map(([id, data]) => {
                            if (id === playerId || !data.position) return null;
                            return (
                                <RemotePlayer
                                    key={id}
                                    position={data.position}
                                    rotation={data.rotation}
                                    color={data.color}
                                    isDriving={data.isDriving}
                                    name={data.name}
                                    lastEmote={data.lastEmote}
                                    lastChat={data.chatMessage} // Ensure this property matches what socketStore has
                                    characterType={data.characterType}
                                    petType={data.petType}
                                    customization={data.customization}
                                />
                            );
                        })}
                    </Physics>
                </Canvas>
            </div>

            {/* UI Overlay - Anchored Zones */}
            <div className="hud-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>

                {/* TOP LEFT: Player List */}
                <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'auto' }}>
                    <PlayerList />
                </div>

                {/* TOP HUD: Coins and MiniMap */}
                <div style={{
                    position: 'absolute', top: '15px', right: '15px',
                    display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'none'
                }}>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        padding: '4px 10px',
                        borderRadius: '15px',
                        color: '#FFD54F',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        border: '1px solid rgba(255, 213, 79, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        pointerEvents: 'auto'
                    }}>
                        <span style={{ fontSize: '18px' }}>💰</span> {coins}
                    </div>
                    <div style={{ pointerEvents: 'auto' }}>
                        <MiniMap />
                    </div>
                    <button
                        onClick={() => setShowDrawingBoard(true)}
                        style={{
                            background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 213, 79, 0.5)', padding: '6px', borderRadius: '50%',
                            fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)',
                            color: '#FFD54F', pointerEvents: 'auto'
                        }}
                    >
                        🎨
                    </button>
                </div>

                {/* BOTTOM LEFT: Chat & Movement Buttons */}
                <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', flexDirection: 'column', gap: '20px', pointerEvents: 'none' }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <MovementButtons onMove={setButtonMove} />
                    </div>
                    <div style={{ pointerEvents: 'auto' }}>
                        <Chat />
                    </div>
                </div>

                {/* BOTTOM RIGHT: Joystick & Jump button */}
                <div style={{ position: 'absolute', bottom: 20, right: '12%', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <button
                        onPointerDown={() => setJoystickData({ ...joystickData, jump: true })}
                        onPointerUp={() => setJoystickData({ ...joystickData, jump: false })}
                        style={{
                            width: '60px', height: '60px', background: 'rgba(233, 30, 99, 0.6)',
                            border: '3px solid white', borderRadius: '50%', fontSize: '18px',
                            color: 'white', fontWeight: 'bold', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', backdropFilter: 'blur(3px)'
                        }}
                    >
                        UÇ! ✨
                    </button>
                    <Joystick onMove={setJoystickData} />
                </div>

                {/* CENTER RIGHT: Character Settings */}
                <div style={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto' }}>
                    <VehicleToggle />
                    <OutfitSelector />
                </div>

                {showDrawingBoard && (
                    <DrawingBoard
                        onClose={() => {
                            setShowDrawingBoard(false);
                            setTargetPlacement(null);
                        }}
                        targetPlacement={targetPlacement}
                    />
                )}
            </div>
        </KeyboardControls>
    );
}

function Atmosphere() {
    const skyRef = useRef();
    const dirLight = useRef();
    const ambLight = useRef();

    useFrame((state) => {
        // PERMANENT DAY MODE requested by user
        // We just keep the sun high and bright

        const sunPos = [100, 100, 50];

        if (dirLight.current) {
            dirLight.current.position.set(...sunPos);
            dirLight.current.intensity = 1.5;
        }

        if (ambLight.current) {
            ambLight.current.intensity = 0.8;
        }
    });

    return (
        <>
            {/* SUNNY DAY SKY */}
            <Sky sunPosition={[100, 100, 100]} turbidity={0.5} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />

            <ambientLight ref={ambLight} intensity={0.8} />
            <directionalLight ref={dirLight} position={[50, 100, 50]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
        </>
    );
}
