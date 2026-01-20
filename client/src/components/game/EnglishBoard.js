'use client';

import React, { useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useSocketStore } from '@/stores/socketStore';

export default function EnglishBoard({ position }) {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState(generateQuestion());
    const [message, setMessage] = useState('');
    const reportMathSolved = useSocketStore((state) => state.reportMathSolved); // Reusing same point system

    function generateQuestion() {
        const vocab = [
            { tr: 'Elma', en: 'Apple' },
            { tr: 'Kedi', en: 'Cat' },
            { tr: 'Köpek', en: 'Dog' },
            { tr: 'Okul', en: 'School' },
            { tr: 'Araba', en: 'Car' },
            { tr: 'Kırmızı', en: 'Red' },
            { tr: 'Mavi', en: 'Blue' },
            { tr: 'Güneş', en: 'Sun' },
            { tr: 'Ay', en: 'Moon' },
            { tr: 'Su', en: 'Water' },
            { tr: 'Süt', en: 'Milk' },
            { tr: 'Kitap', en: 'Book' },
            { tr: 'Kalem', en: 'Pencil' },
            { tr: 'Anne', en: 'Mother' },
            { tr: 'Baba', en: 'Father' }
        ];

        const target = vocab[Math.floor(Math.random() * vocab.length)];

        // Generate 2 wrong choices
        const others = vocab.filter(v => v.en !== target.en).sort(() => Math.random() - 0.5).slice(0, 2);

        const choices = [target.en, others[0].en, others[1].en].sort(() => Math.random() - 0.5);

        return { text: target.tr, res: target.en, choices };
    }

    const checkAnswer = (val) => {
        if (val === question.res) {
            setMessage('AFERİN! 🎉');
            reportMathSolved(50); // Give points

            setTimeout(() => {
                setMessage('');
                setQuestion(generateQuestion());
                setIsOpen(false);
            }, 1500);
        } else {
            setMessage('Tekrar Dene! 🤔');
        }
    };

    return (
        <group position={position}>
            {/* Whiteboard Stand */}
            <RigidBody type="fixed" colliders="hull">
                {/* Board */}
                <mesh position={[0, 2, 0]} castShadow onClick={() => setIsOpen(true)}>
                    <boxGeometry args={[4, 2.5, 0.2]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Frame */}
                <mesh position={[0, 2, 0]} castShadow>
                    <boxGeometry args={[4.2, 2.7, 0.1]} />
                    <meshStandardMaterial color="#607D8B" />
                </mesh>
                {/* Legs */}
                <mesh position={[-1.5, 1, 0]} rotation={[0, 0, 0.1]}>
                    <boxGeometry args={[0.2, 2, 0.2]} />
                    <meshStandardMaterial color="#455A64" />
                </mesh>
                <mesh position={[1.5, 1, 0]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.2, 2, 0.2]} />
                    <meshStandardMaterial color="#455A64" />
                </mesh>
            </RigidBody>

            {/* 3D Text on Board */}
            <Text
                position={[0, 2.8, 0.15]}
                fontSize={0.35}
                color="#0D47A1"
                anchorX="center"
                anchorY="middle"
            >
                ENGLISH TIME 🇬🇧
            </Text>

            <Text
                position={[0, 2, 0.15]}
                fontSize={0.5}
                color="#333"
                anchorX="center"
                anchorY="middle"
            >
                {question.text} = ?
            </Text>

            <Text
                position={[0, 1.3, 0.15]}
                fontSize={0.25}
                color="#555"
                anchorX="center"
                anchorY="middle"
            >
                (Öğrenmek için Tıkla)
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
                        width: '280px',
                        border: '5px solid #2196F3',
                        fontFamily: 'Comic Sans MS, cursive, sans-serif',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1565C0' }}>
                            "{question.text}" İngilizce ne demek?
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {question.choices.map((choice, i) => (
                                <button
                                    key={i}
                                    onClick={() => checkAnswer(choice)}
                                    style={{
                                        padding: '10px 15px',
                                        background: '#E3F2FD',
                                        color: '#1565C0',
                                        border: '2px solid #BBDEFB',
                                        borderRadius: '10px',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>

                        {message && (
                            <div style={{
                                color: message.includes('❌') || message.includes('Dene') ? '#F44336' : '#4CAF50',
                                fontWeight: 'bold',
                                fontSize: '18px'
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
