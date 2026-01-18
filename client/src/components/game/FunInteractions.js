'use client';

import { useRef, useState } from 'react';
import { RigidBody, CylinderCollider, BallCollider } from '@react-three/rapier';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

export function JumpPad({ position }) {
    const handleCollision = (e) => {
        const other = e.rigidBodyObject;
        if (other && other.applyImpulse) {
            // Launch player/objects up
            other.applyImpulse({ x: 0, y: 25, z: 0 }, true);
        }
    };

    return (
        <group position={position}>
            <RigidBody type="fixed" colliders={false} onCollisionEnter={handleCollision} sensor>
                <CylinderCollider args={[0.2, 1.5]} />
                <mesh receiveShadow>
                    <cylinderGeometry args={[1.5, 1.6, 0.3, 32]} />
                    <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} transparent opacity={0.6} />
                </mesh>
            </RigidBody>
            <Float speed={5} rotationIntensity={0.1} floatIntensity={1}>
                <Text position={[0, 0.5, 0]} fontSize={0.3} color="white" outlineColor="cyan" outlineWidth={0.05}>
                    ZIPLAT! 🚀
                </Text>
            </Float>
            <pointLight position={[0, 1, 0]} color="#00E5FF" intensity={2} distance={5} />
        </group>
    );
}

export function PhysicsBall({ position }) {
    const meshRef = useRef();

    return (
        <RigidBody
            position={position}
            colliders="ball"
            restitution={0.8}
            friction={0.2}
            linearDamping={0.5}
            angularDamping={0.5}
            mass={1}
        >
            <mesh ref={meshRef} castShadow receiveShadow>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshStandardMaterial color="#FF4081" roughness={0.1} metalness={0.2} />
            </mesh>
            {/* Colorful stripes */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.51, 0.1, 16, 100]} />
                <meshStandardMaterial color="yellow" />
            </mesh>
            <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[1.51, 0.1, 16, 100]} />
                <meshStandardMaterial color="cyan" />
            </mesh>
        </RigidBody>
    );
}

export function SpeedGate({ position, rotation = [0, 0, 0] }) {
    const handleCollision = (e) => {
        const other = e.rigidBodyObject;
        if (other && other.linvel) {
            // Push forward in the direction of the gate
            const forwardVector = new THREE.Vector3(0, 0, -10); // Standard forward in R3F/Three is -Z
            forwardVector.applyEuler(new THREE.Euler(...rotation));
            other.applyImpulse({ x: forwardVector.x, y: forwardVector.y, z: forwardVector.z }, true);
        }
    };

    return (
        <group position={position} rotation={rotation}>
            <RigidBody type="fixed" colliders={false} onCollisionEnter={handleCollision} sensor>
                <CylinderCollider args={[2, 0.2]} rotation={[Math.PI / 2, 0, 0]} />
                <mesh>
                    <torusGeometry args={[2.5, 0.1, 16, 100]} />
                    <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={5} transparent opacity={0.8} />
                </mesh>
            </RigidBody>
            <pointLight color="yellow" intensity={3} distance={6} />
        </group>
    );
}
