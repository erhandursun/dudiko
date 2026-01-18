import React, { useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';
import { RigidBody } from '@react-three/rapier';

export function ReadingNook({ position }) {
    const [reading, setReading] = useState(false);
    return (
        <group position={position}>
            <RigidBody type="fixed">
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[3, 0.5, 2]} />
                    <meshStandardMaterial color="#8D6E63" />
                </mesh>
            </RigidBody>
            <Text position={[0, 1.5, 0]} fontSize={0.4} color="white">KİTAP KÖŞESİ 📖</Text>
            <Html position={[0, 1, 0]} center>
                <button
                    onClick={() => setReading(!reading)}
                    style={{
                        padding: '8px 15px',
                        background: '#5D4037',
                        color: 'white',
                        border: '2px solid gold',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    {reading ? 'Kitabı Kapat 📕' : 'Kitap Oku 📖'}
                </button>
                {reading && (
                    <div style={{
                        marginTop: '10px',
                        padding: '15px',
                        background: 'rgba(255,255,255,0.9)',
                        color: '#3E2723',
                        borderRadius: '10px',
                        width: '200px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                        fontSize: '14px',
                        fontFamily: 'serif'
                    }}>
                        "Bir zamanlar Prenses'in kasabasında herkes neşe içindeydi..." ✨📖
                    </div>
                )}
            </Html>
        </group>
    );
}

export function CafeZone({ position }) {
    const [drinking, setDrinking] = useState(false);
    return (
        <group position={position}>
            {/* Table */}
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[1, 1, 0.1, 16]} />
                <meshStandardMaterial color="#6A1B9A" />
            </mesh>
            <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 0.5]} />
                <meshStandardMaterial color="silver" />
            </mesh>
            <Text position={[0, 1.5, 0]} fontSize={0.4} color="white">CAFE ☕</Text>
            <Html position={[0, 0.8, 0]} center>
                <button
                    onClick={() => {
                        setDrinking(true);
                        setTimeout(() => setDrinking(false), 3000);
                    }}
                    style={{
                        padding: '8px 15px',
                        background: '#9C27B0',
                        color: 'white',
                        border: '2px solid white',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}
                >
                    {drinking ? 'Hüpletiyor... ☕' : 'Kahve İç ☕'}
                </button>
            </Html>
        </group>
    );
}

export function XOXBoard({ position, boardId = "plaza-xox" }) {
    const xoxBoards = useSocketStore((state) => state.xoxBoards);
    const makeXOXMove = useSocketStore((state) => state.makeXOXMove);
    const board = (xoxBoards && xoxBoards[boardId]) || Array(9).fill(null);
    const [mySymbol, setMySymbol] = useState('X');

    const handleCellClick = (idx) => {
        if (board[idx]) return;
        makeXOXMove(boardId, idx, mySymbol);
    };

    return (
        <group position={position}>
            <Text position={[0, 2.5, 0]} fontSize={0.5} color="#FFD54F">XOX OYNA ❌⭕</Text>
            <group position={[0, 1, 0]}>
                {board.map((cell, i) => (
                    <mesh
                        key={i}
                        position={[(i % 3) - 1, 1 - Math.floor(i / 3), 0]}
                        onClick={() => handleCellClick(i)}
                    >
                        <boxGeometry args={[0.9, 0.9, 0.1]} />
                        <meshStandardMaterial color={cell ? (cell === 'X' ? '#E91E63' : '#2196F3') : '#424242'} />
                        {cell && (
                            <Text position={[0, 0, 0.1]} fontSize={0.6} color="white">{cell}</Text>
                        )}
                    </mesh>
                ))}
            </group>
            <Html position={[0, -1, 0]} center>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => setMySymbol('X')} style={{ background: mySymbol === 'X' ? '#E91E63' : '#757575', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>X Ol</button>
                    <button onClick={() => setMySymbol('O')} style={{ background: mySymbol === 'O' ? '#2196F3' : '#757575', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>O Ol</button>
                </div>
            </Html>
            {/* Table/Stand */}
            <mesh position={[0, -0.5, -0.2]}>
                <boxGeometry args={[3.2, 3.2, 0.2]} />
                <meshStandardMaterial color="#616161" />
            </mesh>
        </group>
    );
}
