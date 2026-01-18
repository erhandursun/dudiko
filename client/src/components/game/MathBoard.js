'use client';

import React, { useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useSocketStore } from '@/stores/socketStore';

export default function MathBoard({ position }) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState(generateQuestion());
    const [answer, setAnswer] = useState('');
    const [message, setMessage] = useState('');
    const reportMathSolved = useSocketStore((state) => state.reportMathSolved);
    const coins = useSocketStore((state) => state.coins);

    function generateQuestion() {
        const operators = ['+', '-', '*'];
        const op = operators[Math.floor(Math.random() * operators.length)];
        let a, b, res;

        if (op === '*') {
            a = Math.floor(Math.random() * 9) + 2; // 2-10
            b = Math.floor(Math.random() * 9) + 2; // 2-10
            res = a * b;
        } else if (op === '-') {
            a = Math.floor(Math.random() * 20) + 10;
            b = Math.floor(Math.random() * 10) + 1;
            res = a - b;
        } else {
            a = Math.floor(Math.random() * 20) + 1;
            b = Math.floor(Math.random() * 20) + 1;
            res = a + b;
        }

        // Generate 3 choices (1 correct, 2 wrong)
        const choices = [res, res + (op === '*' ? a : 1), res - (op === '*' ? b : 1)].sort(() => Math.random() - 0.5);

        return { a, b, op, res, choices };
    }

    const checkAnswer = (val) => {
        if (val === question.res) {
            setMessage('DOĞRU! 🌟 +50 Puan');
            reportMathSolved(50);
            setTimeout(() => {
                setMessage('');
                setQuestion(generateQuestion());
                setIsOpen(false);
            }, 1500);
        } else {
            setMessage('Yeniden Dene! ❌');
        }
    };

    return (
        <group position={position}>
            {/* Easel / Board Stand */}
            <RigidBody type="fixed" colliders="hull">
                {/* Board */}
                <mesh position={[0, 2, 0]} castShadow onClick={() => setIsOpen(true)}>
                    <boxGeometry args={[4, 2.5, 0.2]} />
                    <meshStandardMaterial color="#2E7D32" /> {/* Green Blackboard */}
                </mesh>
                {/* Frame */}
                <mesh position={[0, 2, 0]} castShadow>
                    <boxGeometry args={[4.2, 2.7, 0.1]} />
                    <meshStandardMaterial color="#8D6E63" />
                </mesh>
                {/* Legs */}
                <mesh position={[-1.5, 1, 0]} rotation={[0, 0, 0.1]}>
                    <boxGeometry args={[0.2, 2, 0.2]} />
                    <meshStandardMaterial color="#5D4037" />
                </mesh>
                <mesh position={[1.5, 1, 0]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.2, 2, 0.2]} />
                    <meshStandardMaterial color="#5D4037" />
                </mesh>
            </RigidBody>

            {/* 3D Text on Board */}
            <Text
                position={[0, 2.7, 0.15]}
                fontSize={0.4}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                BİL-KAZAN 💰
            </Text>
            <Text
                position={[0, 2, 0.15]}
                fontSize={0.6}
                color="yellow"
                anchorX="center"
                anchorY="middle"
            >
                {question.a} {question.op === '*' ? '×' : question.op} {question.b} = ?
            </Text>
            <Text
                position={[0, 1.3, 0.15]}
                fontSize={0.25}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                {isOpen ? "Şıkkını Seç!" : "(Çözmek için Tıkla)"}
            </Text>

            {/* Interactive UI Overlay */}
            {isOpen && (
                <Html position={[0, 2, 0.2]} transform distanceFactor={5}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '20px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '15px',
                        width: '220px',
                        border: '5px solid #FFD54F',
                        fontFamily: 'Comic Sans MS, cursive, sans-serif',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#E91E63' }}>
                            {question.a} {question.op === '*' ? '×' : question.op} {question.b} kaçtır?
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                            {question.choices.map((choice, i) => (
                                <button
                                    key={i}
                                    onClick={() => checkAnswer(choice)}
                                    style={{
                                        padding: '12px 20px',
                                        background: '#2196F3',
                                        color: 'white',
                                        border: '3px solid white',
                                        borderRadius: '15px',
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        minWidth: '60px'
                                    }}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>

                        {message && (
                            <div style={{
                                color: message.includes('DOĞRU') ? '#4CAF50' : '#F44336',
                                fontWeight: 'bold',
                                fontSize: '18px',
                                animation: 'pulse 0.5s infinite alternate'
                            }}>
                                {message}
                            </div>
                        )}

                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' }}
                        >
                            Kapat
                        </button>
                    </div>
                </Html>
            )}
        </group>
    );
}
