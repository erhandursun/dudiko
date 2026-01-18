'use client';

import React, { useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Float, Text, ContactShadows, Environment, Html } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';
import RemotePlayer from './RemotePlayer';

export default function SchoolWorld() {
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);

    return (
        <group>
            {/* 1. Floor - Warm Wood / Classroom Floor */}
            <RigidBody type="fixed" friction={1}>
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#fdf2f8" />
                </mesh>
            </RigidBody>

            {/* 2. The Main Classroom Building Outer Shell */}
            <SchoolBuilding />

            {/* 3. Interactive Classrooms (Desks & Blackboard) */}
            <ClassroomInterior position={[0, 0, -5]} />

            {/* 4. Magical Fountain (Simpler, no heavy effects) */}
            <RigidBody type="fixed" position={[20, 0, 15]}>
                <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[5, 5.5, 0.4, 32]} />
                    <meshStandardMaterial color="#fbcfe8" />
                </mesh>
                <mesh position={[0, 2.5, 0]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
                </mesh>
            </RigidBody>

            {/* Atmosphere */}
            <Environment preset="city" />
            <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={100} blur={2.5} far={15} />

            {/* Remote Players */}
            {Object.entries(players).map(([id, data]) => {
                if (id === playerId || !data.position) return null;
                if (data.currentWorld !== 'school') return null;

                return (
                    <RemotePlayer
                        key={id}
                        position={data.position}
                        rotation={data.rotation}
                        color={data.color}
                        isDriving={data.isDriving}
                        name={data.name}
                        lastChat={data.chatMessage}
                        characterType={data.characterType}
                        customization={data.customization}
                    />
                );
            })}
        </group>
    );
}

function SchoolBuilding() {
    return (
        <RigidBody type="fixed" position={[0, 0, -25]}>
            {/* Building Frame */}
            <mesh position={[0, 8, 0]} castShadow receiveShadow>
                <boxGeometry args={[50, 16, 20]} />
                <meshStandardMaterial color="#fce7f3" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 16.5, 0]}>
                <boxGeometry args={[52, 1, 22]} />
                <meshStandardMaterial color="#f472b6" />
            </mesh>
            {/* Front Label */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Text
                    position={[0, 12, 11]}
                    fontSize={3}
                    color="#db2777"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.1}
                    outlineColor="white"
                >
                    PRENSES AKADEMİSİ 🏫
                </Text>
            </Float>
        </RigidBody>
    );
}

function ClassroomInterior({ position }) {
    return (
        <group position={position}>
            {/* Blackboard */}
            <LessonBoard position={[0, 4, -10]} />

            {/* Rows of Desks */}
            {[...Array(6)].map((_, i) => (
                <Desk key={i} position={[(i % 3 - 1) * 8, 0, Math.floor(i / 3) * 6]} />
            ))}

            {/* Bookshelves */}
            <Bookshelf position={[-15, 0, -5]} rotation={[0, Math.PI / 2, 0]} />
            <Bookshelf position={[15, 0, -5]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
    );
}

function Desk({ position }) {
    return (
        <group position={position}>
            <RigidBody type="fixed">
                <mesh position={[0, 1.2, 0]} castShadow>
                    <boxGeometry args={[4, 0.2, 2.5]} />
                    <meshStandardMaterial color="#f9a8d4" />
                </mesh>
                <mesh position={[-1.8, 0.6, 1.1]}>
                    <boxGeometry args={[0.2, 1.2, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
                <mesh position={[1.8, 0.6, 1.1]}>
                    <boxGeometry args={[0.2, 1.2, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
                <mesh position={[-1.8, 0.6, -1.1]}>
                    <boxGeometry args={[0.2, 1.2, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
                <mesh position={[1.8, 0.6, -1.1]}>
                    <boxGeometry args={[0.2, 1.2, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
                {/* Chair */}
                <mesh position={[0, 0.6, 2.5]} castShadow>
                    <boxGeometry args={[2.5, 0.2, 2]} />
                    <meshStandardMaterial color="#fdf2f8" />
                </mesh>
                <mesh position={[0, 1.5, 3.4]}>
                    <boxGeometry args={[2.5, 2, 0.2]} />
                    <meshStandardMaterial color="#fdf2f8" />
                </mesh>
            </RigidBody>
            <Text position={[0, 1.35, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#db2777">
                DERS ÇALIŞ ✨
            </Text>
        </group>
    );
}

function LessonBoard({ position }) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState(generateLessonQuestion());
    const [result, setResult] = useState('');
    const reportMathSolved = useSocketStore((state) => state.reportMathSolved);

    function generateLessonQuestion() {
        const types = ['math', 'logic'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'math') {
            const a = Math.floor(Math.random() * 50) + 10;
            const b = Math.floor(Math.random() * 40) + 5;
            const op = Math.random() > 0.5 ? '+' : '-';
            const res = op === '+' ? a + b : a - b;
            const choices = [res, res + 5, res - 5].sort(() => Math.random() - 0.5);
            return { text: `${a} ${op} ${b} = ?`, res, choices, title: 'Matematik Dersi' };
        } else {
            const sequence = [2, 4, 6, 8];
            const next = 10;
            const choices = [8, 10, 12].sort(() => Math.random() - 0.5);
            return { text: '2, 4, 6, 8, ... Sıradaki sayı?', res: next, choices, title: 'Zeka Sorusu' };
        }
    }

    const handleAnswer = (val) => {
        if (val === question.res) {
            setResult('Harika! Aferin Sana 🌟');
            reportMathSolved(100);
            setTimeout(() => {
                setResult('');
                setQuestion(generateLessonQuestion());
                setIsOpen(false);
            }, 2000);
        } else {
            setResult('Tekrar dene bakalım... ❌');
        }
    };

    return (
        <group position={position}>
            <RigidBody type="fixed">
                <mesh castShadow onClick={() => setIsOpen(true)}>
                    <boxGeometry args={[12, 7, 0.5]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
                <mesh position={[0, 0, -0.3]}>
                    <boxGeometry args={[12.5, 7.5, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
            </RigidBody>

            <Text position={[0, 2.5, 0.3]} fontSize={0.6} color="#fca5a5">
                {question.title}
            </Text>
            <Text position={[0, 0.2, 0.3]} fontSize={1.2} color="white">
                {question.text}
            </Text>
            <Text position={[0, -2.5, 0.3]} fontSize={0.5} color="#94a3b8">
                (Ders Başlatmak İçin Tıkla)
            </Text>

            {isOpen && (
                <Html transform distanceFactor={8} position={[0, 0, 0.35]}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '30px',
                        borderRadius: '25px',
                        textAlign: 'center',
                        width: '350px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        border: '8px solid #f472b6',
                        fontFamily: 'Comic Sans MS, cursive'
                    }}>
                        <h2 style={{ color: '#db2777', marginBottom: '20px' }}>{question.title} 📝</h2>
                        <div style={{ fontSize: '32px', marginBottom: '30px', fontWeight: 'bold' }}>{question.text}</div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            {question.choices.map((c, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(c)}
                                    style={{
                                        padding: '15px 25px',
                                        fontSize: '24px',
                                        borderRadius: '15px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: '4px solid white',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>

                        {result && (
                            <div style={{ marginTop: '20px', color: result.includes('Harika') ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '20px' }}>
                                {result}
                            </div>
                        )}
                        <div style={{ marginTop: '15px' }}>
                            <button onClick={() => setIsOpen(false)} style={{ color: '#94a3b8', border: 'none', background: 'none', cursor: 'pointer' }}>Dersi Bitir</button>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function Bookshelf({ position, rotation }) {
    return (
        <group position={position} rotation={rotation}>
            <RigidBody type="fixed">
                <mesh castShadow>
                    <boxGeometry args={[4, 10, 1.5]} />
                    <meshStandardMaterial color="#fdf2f8" />
                </mesh>
                {[...Array(4)].map((_, i) => (
                    <mesh key={i} position={[0, (i - 1.5) * 2.5, 0.2]}>
                        <boxGeometry args={[3.8, 0.1, 1.4]} />
                        <meshStandardMaterial color="#f9a8d4" />
                    </mesh>
                ))}
            </RigidBody>
            <Text position={[0, 5.5, 0]} fontSize={0.6} color="#db2777">KİTAPLIK 📚</Text>
        </group>
    );
}
