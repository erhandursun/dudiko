'use client';

import React, { useState } from 'react';
import { Html, Text } from '@react-three/drei';

const RIDDLES = [
    { q: "Ben giderim o gider, arkamdan beni izler.", a: "gölge" },
    { q: "Şehirleri var ama evleri yok. Dağları var ama ağaçları yok.", a: "harita" },
    { q: "Kanadı var uçamaz, ağzı var konuşamaz.", a: "balık" },
    { q: "Yer altında sakallı dede.", a: "pırasa" },
    { q: "İki camlı pencere, bakıp durur her yere.", a: "gözlük" },
    { q: "Bağlarsam yürür, çözersem durur.", a: "ayakkabı" }
];

export default function RiddleBoard() {
    const [current, setCurrent] = useState(0);
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [showInput, setShowInput] = useState(false);

    const checkAnswer = () => {
        if (input.toLowerCase().trim() === RIDDLES[current].a) {
            setFeedback('DOĞRU! 🎉');
            setTimeout(() => {
                setFeedback('');
                setInput('');
                setCurrent((current + 1) % RIDDLES.length);
                setShowInput(false);
            }, 2000);
        } else {
            setFeedback('Tekrar dene! 🤔');
            setTimeout(() => setFeedback(''), 2000);
        }
    };

    return (
        <group>
            {/* Board Background */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[3, 2, 0.2]} />
                <meshStandardMaterial color="#8D6E63" />
            </mesh>
            <mesh position={[0, 1.5, 0.11]}>
                <planeGeometry args={[2.8, 1.8]} />
                <meshStandardMaterial color="#3E2723" />
            </mesh>

            {/* Stand */}
            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.2, 1, 0.2]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>

            {/* Question Text */}
            <Text
                position={[0, 1.8, 0.13]}
                fontSize={0.15}
                color="white"
                maxWidth={2.5}
                textAlign="center"
            >
                BİLMECE VAKTİ! ✨
            </Text>
            <Text
                position={[0, 1.4, 0.13]}
                fontSize={0.2}
                color="#FFEB3B"
                maxWidth={2.5}
                textAlign="center"
            >
                {RIDDLES[current].q}
            </Text>

            {/* Interactive Part */}
            <Html position={[0, 0.5, 0.2]} center>
                <div style={{ textAlign: 'center' }}>
                    {!showInput ? (
                        <button
                            onClick={() => setShowInput(true)}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(45deg, #FF4081, #C2185B)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '15px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '14px',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            CEVABI BİLİYOR MUSUN? ✨
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.8)', padding: '15px', borderRadius: '15px' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Cevabın..."
                                style={{ padding: '8px', borderRadius: '8px', border: 'none', textAlign: 'center' }}
                                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                            />
                            <button
                                onClick={checkAnswer}
                                style={{
                                    padding: '8px',
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                GÖNDER! 🚀
                            </button>
                            <button onClick={() => setShowInput(false)} style={{ color: 'white', background: 'transparent', border: 'none', fontSize: '10px', cursor: 'pointer' }}>Kapat</button>
                        </div>
                    )}
                    {feedback && <div style={{ marginTop: '10px', fontSize: '20px', color: 'white', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{feedback}</div>}
                </div>
            </Html>
        </group>
    );
}
