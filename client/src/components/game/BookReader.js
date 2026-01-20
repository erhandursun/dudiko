'use client';

import React, { useState } from 'react';
import { Html, Text } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

const STORIES = [
    {
        title: "Minik Yıldız",
        pages: [
            "Bir varmış, bir yokmuş. Gökyüzünde parlayan minik bir yıldız varmış. ✨",
            "Bu minik yıldız, diğer büyük yıldızlar gibi parlamak istiyormuş ama ışığı azmış.",
            "Bir gün Ay Dede ona gülümsemiş: 'Senin ışığın küçük olabilir ama kalbin kocaman!' demiş.",
            "Minik yıldız çok sevinmiş. O günden sonra mutlulukla parlamış ve tüm çocuklara iyi geceler dilemiş. 🌙"
        ]
    }
];

export default function BookReader({ position, rotation }) {
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(0);

    const handleNext = () => {
        if (page < STORIES[0].pages.length - 1) {
            setPage(page + 1);
        } else {
            setIsOpen(false);
            setPage(0);
        }
    };

    return (
        <group position={position} rotation={rotation}>
            {/* Bookshelf Model */}
            <RigidBody type="fixed" colliders="hull">
                <mesh castShadow onClick={() => setIsOpen(true)}>
                    <boxGeometry args={[4, 6, 1.5]} />
                    <meshStandardMaterial color="#8D6E63" />
                </mesh>
                {/* Shelves */}
                {[...Array(3)].map((_, i) => (
                    <mesh key={i} position={[0, (i - 1) * 1.5, 0.2]}>
                        <boxGeometry args={[3.6, 0.1, 1.3]} />
                        <meshStandardMaterial color="#5D4037" />
                    </mesh>
                ))}
                {/* Books */}
                <group position={[-1.2, 0.2, 0.4]}>
                    <mesh position={[0, 0.3, 0]} castShadow>
                        <boxGeometry args={[0.2, 0.6, 0.8]} />
                        <meshStandardMaterial color="red" />
                    </mesh>
                    <mesh position={[0.3, 0.3, 0]} castShadow>
                        <boxGeometry args={[0.2, 0.5, 0.8]} />
                        <meshStandardMaterial color="blue" />
                    </mesh>
                    <mesh position={[0.6, 0.3, 0]} castShadow>
                        <boxGeometry args={[0.2, 0.7, 0.8]} />
                        <meshStandardMaterial color="green" />
                    </mesh>
                </group>
            </RigidBody>

            <Text position={[0, 3.5, 0]} fontSize={0.5} color="gold">MASAL OKU 📖</Text>

            {/* Reading Modal */}
            {isOpen && (
                <Html position={[0, 2, 0.5]} transform distanceFactor={6}>
                    <div style={{
                        background: '#FFF3E0',
                        padding: '30px',
                        borderRadius: '10px',
                        width: '400px',
                        height: '300px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        border: '10px solid #5D4037',
                        boxShadow: '10px 10px 20px rgba(0,0,0,0.5)',
                        fontFamily: 'serif'
                    }}>
                        <h2 style={{ textAlign: 'center', color: '#E65100', margin: 0 }}>{STORIES[0].title}</h2>

                        <p style={{ fontSize: '20px', lineHeight: '1.5', textAlign: 'center', color: '#3E2723' }}>
                            {STORIES[0].pages[page]}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={handleNext}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '16px',
                                    background: '#8D6E63',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '5px'
                                }}
                            >
                                {page < STORIES[0].pages.length - 1 ? "Sonraki Sayfa ➡️" : "Bitir ✨"}
                            </button>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}
