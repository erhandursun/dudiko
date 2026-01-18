import React, { useState, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import BubbleEffect from './BubbleEffect';

export default function PlatformJumpGame({ position }) {
    const [question, setQuestion] = useState({ q: "2 + 2 = ?", a: 4 });
    const [options, setOptions] = useState([3, 4, 5]);
    const [showBubbles, setShowBubbles] = useState(false);

    useEffect(() => {
        generateQuestion();
    }, []);

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
                    <Text position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={1} color="white">
                        {val}
                    </Text>
                </RigidBody>
            ))}
        </group>
    );
}
