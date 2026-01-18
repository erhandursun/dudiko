import React, { useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import { STORIES } from '../../data/stories';
import BookReader from './BookReader';
import QuizBoard from './QuizBoard';

export default function BookCafe({ position, rotation = [0, 0, 0] }) {
    const [activeBook, setActiveBook] = useState(null); // The book currently being read
    const [showQuiz, setShowQuiz] = useState(false);
    const [lastReadBook, setLastReadBook] = useState(null); // Stores the last read book for the quiz

    const handleReadBook = (story) => {
        setActiveBook(story);
        setLastReadBook(story); // Remember this book for the quiz
    };

    return (
        <group position={position} rotation={rotation}>
            {/* --- CAFE STRUCTURE --- */}
            <RigidBody type="fixed" colliders="trimesh">
                {/* Floor */}
                <mesh position={[0, 0.1, 0]} receiveShadow>
                    <boxGeometry args={[12, 0.2, 12]} />
                    <meshStandardMaterial color="#5D4037" /> {/* Dark Wood */}
                </mesh>

                {/* Roof */}
                <mesh position={[0, 6, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                    <coneGeometry args={[9, 4, 4]} />
                    <meshStandardMaterial color="#D84315" /> {/* Orange Roof */}
                </mesh>

                {/* Walls */}
                <mesh position={[0, 3, -5.5]}>
                    <boxGeometry args={[11, 6, 1]} />
                    <meshStandardMaterial color="#FFECB3" /> {/* Cream Walls */}
                </mesh>
                <mesh position={[5.5, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[11, 6, 1]} />
                    <meshStandardMaterial color="#FFECB3" />
                </mesh>
                <mesh position={[-5.5, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
                    <boxGeometry args={[11, 6, 1]} />
                    <meshStandardMaterial color="#FFECB3" />
                </mesh>

                {/* Entrance Pillars */}
                <mesh position={[-3, 2, 5.5]}>
                    <cylinderGeometry args={[0.5, 0.5, 4]} />
                    <meshStandardMaterial color="#8D6E63" />
                </mesh>
                <mesh position={[3, 2, 5.5]}>
                    <cylinderGeometry args={[0.5, 0.5, 4]} />
                    <meshStandardMaterial color="#8D6E63" />
                </mesh>

                {/* Sign Board */}
                <mesh position={[0, 4.5, 5.6]}>
                    <boxGeometry args={[4, 1, 0.2]} />
                    <meshStandardMaterial color="#3E2723" />
                </mesh>
            </RigidBody>

            <Text position={[0, 4.5, 5.8]} fontSize={0.5} color="#FFD54F" outlineWidth={0.05} outlineColor="black">
                📚 KİTAP KAFE ☕
            </Text>

            {/* --- BOOKSHELVES & BOOKS --- */}
            <group position={[0, 0, -4]}>
                {/* Shelf Unit */}
                <mesh position={[0, 2, 0]}>
                    <boxGeometry args={[8, 3, 1]} />
                    <meshStandardMaterial color="#8D6E63" />
                </mesh>

                {/* Books */}
                {STORIES.map((story, i) => {
                    const row = Math.floor(i / 5);
                    const col = i % 5;
                    const xPos = (col - 2) * 1.2;
                    const yPos = row === 0 ? 2.8 : 1.3;
                    const color = ["#ef5350", "#42a5f5", "#66bb6a", "#ffa726", "#ab47bc"][i % 5];

                    return (
                        <group key={story.id} position={[xPos, yPos, 0.6]}>
                            <mesh
                                onClick={() => handleReadBook(story)}
                                onPointerOver={(e) => document.body.style.cursor = 'pointer'}
                                onPointerOut={(e) => document.body.style.cursor = 'auto'}
                            >
                                <boxGeometry args={[0.8, 1, 0.2]} />
                                <meshStandardMaterial color={color} />
                            </mesh>
                            <Text position={[0, 0, 0.11]} fontSize={0.15} color="white" maxWidth={0.7} textAlign="center">
                                {story.title}
                            </Text>
                        </group>
                    );
                })}
            </group>

            {/* --- QUIZ BOARD --- */}
            <group position={[4, 0, 2]} rotation={[0, -Math.PI / 4, 0]}>
                <RigidBody type="fixed">
                    <mesh position={[0, 2, 0]} onClick={() => setShowQuiz(true)}>
                        <boxGeometry args={[3, 2, 0.2]} />
                        <meshStandardMaterial color="#212121" />
                    </mesh>
                    <mesh position={[0, 2, 0]}>
                        <boxGeometry args={[3.2, 2.2, 0.1]} />
                        <meshStandardMaterial color="#8D6E63" />
                    </mesh>
                </RigidBody>
                <Text position={[0, 2, 0.15]} fontSize={0.3} color="white">
                    SORU TAHTASI ❓
                </Text>
                <Text position={[0, 1.5, 0.15]} fontSize={0.15} color="#81C784">
                    (Kitaptan Sonra Tıkla)
                </Text>
            </group>

            {/* --- UI OVERLAYS --- */}
            {activeBook && (
                <BookReader
                    book={activeBook}
                    onClose={() => setActiveBook(null)}
                />
            )}

            {showQuiz && (
                <QuizBoard
                    lastReadBook={lastReadBook}
                    onClose={() => setShowQuiz(false)}
                />
            )}
        </group>
    );
}
