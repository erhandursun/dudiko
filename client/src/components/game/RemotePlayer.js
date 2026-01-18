import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import CharacterModel from './CharacterModel';
import VehicleModel from './VehicleModel';
import DisguiseModel from './DisguiseModel';
import * as THREE from 'three';

export default function RemotePlayer({ position, rotation, color, isDriving, isDancing, disguiseProp, name, lastChat, characterType, customization }) {
    // Merge disguise prop from root or customization
    const activeDisguise = disguiseProp || customization?.disguiseProp;
    const ref = useRef();
    const [activeChat, setActiveChat] = useState(null);

    // Animation State
    const modelGroupRef = useRef();
    const prevIsDriving = useRef(isDriving);
    const chatTimeout = useRef();

    // Check if mode changed
    if (prevIsDriving.current !== isDriving) {
        if (modelGroupRef.current) {
            modelGroupRef.current.scale.set(0.1, 0.1, 0.1); // Poof!
        }
        prevIsDriving.current = isDriving;
    }

    // Chat Logic - Moved to Effect to prevent render loops
    useEffect(() => {
        if (lastChat && (!activeChat || lastChat.time > activeChat.time)) {
            setActiveChat(lastChat);
            if (chatTimeout.current) clearTimeout(chatTimeout.current);
            chatTimeout.current = setTimeout(() => setActiveChat(null), 6000);
        }
    }, [lastChat, activeChat]);

    // Cleanup timeout
    useEffect(() => () => {
        if (chatTimeout.current) clearTimeout(chatTimeout.current);
    }, []);

    // Safe data handling
    const safePos = (position && position.length === 3) ? position : [0, -100, 0];
    const safeRot = (rotation && rotation.length === 3) ? rotation : [0, 0, 0];

    useFrame((state, delta) => {
        try {
            if (!ref.current) return;

            // Smooth Position Lerp
            const targetPos = new THREE.Vector3(safePos[0], safePos[1], safePos[2]);
            ref.current.position.lerp(targetPos, 0.15); // Smooth motion

            // Smooth Rotation Slerp
            if (modelGroupRef.current && safeRot) {
                const targetQuaternion = new THREE.Quaternion().setFromEuler(
                    new THREE.Euler(safeRot[0], safeRot[1], safeRot[2])
                );
                modelGroupRef.current.quaternion.slerp(targetQuaternion, 0.2);

                // Scale Animation Sync
                if (isDancing) {
                    const danceSpeed = 10;
                    modelGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * danceSpeed) * 0.5;
                    modelGroupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * danceSpeed * 2)) * 0.5;
                } else {
                    modelGroupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                    modelGroupRef.current.position.y = THREE.MathUtils.lerp(modelGroupRef.current.position.y, isDriving ? 0.5 : 0, 0.1);
                }
            }
        } catch (err) {
            console.error('Error in RemotePlayer useFrame:', err);
        }
    });

    // If no valid position, we used to return null but that unmounts components leading to state loss.
    // Instead render it but maybe hidden or at safePos.
    // However, if we receive NULL data from server, we should probably not render.
    if (!position || position.length !== 3) return null;

    return (
        <group ref={ref}>
            {/* Name Tag (Hide if disguised) */}
            {!activeDisguise && (
                <Text
                    position={[0, 2.8, 0]}
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="black"
                >
                    {name || 'Unknown'}
                </Text>
            )}

            {/* Chat Bubble */}
            {activeChat && (
                <group position={[0, 4.2, 0]}>
                    <Text
                        fontSize={0.4}
                        maxWidth={4}
                        lineHeight={1.2}
                        textAlign="center"
                        color="black"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {activeChat.text}
                    </Text>
                    {/* Simple white bubble background using a plane behind text would be better, but Text outline works for now */}
                    <mesh position={[0, 0, -0.01]}>
                        <planeGeometry args={[4.2, 1.2]} />
                        <meshBasicMaterial color="white" transparent opacity={0.8} />
                    </mesh>
                </group>
            )}

            {/* Model Assembly */}

            <group ref={modelGroupRef}>
                {isDriving ? (
                    <group position={[0, 0.5, 0]}>
                        <VehicleModel color={color || "hotpink"} />
                    </group>
                ) : activeDisguise ? (
                    <DisguiseModel type={activeDisguise} />
                ) : (
                    <CharacterModel color={color} type={characterType || 'child'} {...customization} />
                )}
            </group>

            {/* Wings for Remote Players (Magical Town Symmetery) */}
            {(!isDriving && (characterType === 'mother' || characterType === 'father' || characterType === 'child' || characterType === 'baby')) && (
                <group position={[0, 1.2, -0.3]}>
                    <mesh position={[-0.6, 0.4, 0]} rotation={[0.2, 0.4, 0.5]}>
                        <boxGeometry args={[1.2, 0.6, 0.1]} />
                        <meshStandardMaterial color="cyan" transparent opacity={0.6} emissive="cyan" emissiveIntensity={0.5} />
                    </mesh>
                    <mesh position={[0.6, 0.4, 0]} rotation={[0.2, -0.4, -0.5]}>
                        <boxGeometry args={[1.2, 0.6, 0.1]} />
                        <meshStandardMaterial color="cyan" transparent opacity={0.6} emissive="cyan" emissiveIntensity={0.5} />
                    </mesh>
                </group>
            )}
        </group>
    );
}
