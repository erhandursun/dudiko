import React, { useState, useEffect, useRef } from 'react';
import { RigidBody, vec3 } from '@react-three/rapier';
import { Text, Float } from '@react-three/drei'; // Imported Float
import { useFrame } from '@react-three/fiber';
import { useSocketStore } from '@/stores/socketStore'; // Import store to get player pos
import BubbleEffect from './BubbleEffect';

export default function PlatformJumpGame({ position }) {
    const [question, setQuestion] = useState({ q: "2 + 2 = ?", a: 4 });
    const [options, setOptions] = useState([3, 4, 5]);
    const [showBubbles, setShowBubbles] = useState(false);

    // We need to access player position to check if they fell
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);
    const myPlayer = players[playerId];

    useEffect(() => {
        generateQuestion();
    }, []);

    // Check if player fell
    useFrame(() => {
        if (myPlayer && myPlayer.position && myPlayer.position[1] < -5) {
            // In a real scenario we would need a way to reset the player's rigid body.
            // Since we can't easily access the main player's RB here without passing refs,
            // we will just show a message or handle it via the main PlayerController if possible.
            // For now, let's just generate a new question to "reset" the game state visually.
            if (!showBubbles) generateQuestion();
        }
    });

    const generateQuestion = () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        const ans = a + b;
        setQuestion({ q: `${a} + ${b} = ?`, a: ans });

        // Generate options ensuring one is correct
        const wrong1 = ans + 1;
        const wrong2 = ans - 1;
        // Shuffle simply
        const opts = [wrong1, ans, wrong2].sort(() => Math.random() - 0.5);
        setOptions(opts);
        setShowBubbles(false);
    };

    const handleLand = (val) => {
        if (val === question.a) {
            // Correct!
            setShowBubbles(true);
            // Award coins
            import('@/stores/socketStore').then(m => {
                m.useSocketStore.getState().reportMathSolved(20);
            });
            setTimeout(generateQuestion, 3000); // New question after 3s
        }
    };

    return (
        <group position={position}>
            {/* Question Text */}
            <Text position={[0, 4, 0]} fontSize={2} color="black">
                {question.q}
            </Text>

            {/* Bubble Effect on Success */}
            {showBubbles && <BubbleEffect position={[0, 0, 0]} count={50} />}

            {/* Platforms */}
            {options.map((val, i) => (
                <RigidBody
                    key={i}
                    type="fixed"
                    colliders="cuboid"
                    position={[(i - 1) * 3, 1, 0]}
                    onCollisionEnter={({ other }) => {
                        if (other.rigidBodyObject && other.rigidBodyObject.name === 'player') {
                            handleLand(val);
                        }
                    }}
                >
                    <mesh receiveShadow>
                        <boxGeometry args={[2, 0.5, 2]} />
                        <meshStandardMaterial color={val === question.a && showBubbles ? "#66BB6A" : "#FFA726"} />
                    </mesh>

                    {/* Floating Number & Icon */}
                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <Text position={[0, 1.5, 0]} fontSize={1} color="white" outlineWidth={0.1} outlineColor="black">
                            {val}
                        </Text>
                        <Text position={[0, 0.8, 0]} fontSize={0.5} color="white">
                            {val === question.a && showBubbles ? "⭐" : "☁️"}
                        </Text>
                    </Float>
                </RigidBody>
            ))}
        </group>
    );
}
