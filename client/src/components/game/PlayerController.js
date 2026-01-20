'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls, Text, OrbitControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useSocketStore } from '@/stores/socketStore';
import CharacterModel from './CharacterModel';
import VehicleModel from './VehicleModel';
import DisguiseModel from './DisguiseModel';
import Particles from './Particles';
import Collectibles from './Collectibles';
import VoiceChat from './VoiceChat';

const WALK_SPEED = 5;
const DRIVE_SPEED = 12;
const JUMP_FORCE = 10;

export default function PlayerController() {
    const joystickData = useSocketStore((state) => state.joystickData);
    const updateMyPosition = useSocketStore((state) => state.updateMyPosition);
    const currentWorld = useSocketStore((state) => state.currentWorld);
    const isDriving = useSocketStore((state) => state.isDriving);
    const toggleDriving = useSocketStore((state) => state.toggleDriving);
    const isDancing = useSocketStore((state) => state.isDancing);
    const toggleDance = useSocketStore((state) => state.toggleDance);
    const flightUnlocked = useSocketStore((state) => state.flightUnlocked);
    const hasWeapon = useSocketStore((state) => state.hasWeapon);
    const shoot = useSocketStore((state) => state.shoot);
    const myName = useSocketStore((state) => state.myName);
    const myColor = useSocketStore((state) => state.myColor);
    const characterType = useSocketStore((state) => state.characterType);
    const customization = useSocketStore((state) => state.customization);

    // Physics body
    const rb = useRef();
    const groupRef = useRef(); // For animation
    const [, getKeys] = useKeyboardControls();
    const socket = useSocketStore((state) => state.socket);

    // Animation State trackers
    const prevIsDriving = useRef(isDriving);
    const lastUpdate = useRef(0);
    const controlsRef = useRef();

    // Reset position on world change
    useEffect(() => {
        if (rb.current) {
            if (currentWorld === 'school') {
                rb.current.setTranslation({ x: 0, y: 5, z: 10 }, true);
            } else if (currentWorld === 'race') {
                rb.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
            } else {
                rb.current.setTranslation({ x: 0, y: 5, z: 20 }, true);
            }
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }
    }, [currentWorld]);

    useFrame((state, delta) => {
        if (!rb.current) return;

        // --- INPUT HANDLING ---
        const { forward: kF, backward: kB, left: kL, right: kR, jump: keyboardJump } = getKeys();
        const joystick = joystickData || { x: 0, y: 0, jump: false, action: false };

        const forward = kF;
        const backward = kB;
        const left = kL;
        const right = kR;
        const jump = keyboardJump || joystick.jump;

        // Get current velocity and position
        const linvel = rb.current.linvel();
        const translation = rb.current.translation();

        // 1. MOVEMENT FORCE
        const frontVector = new THREE.Vector3(0, 0, (backward ? 1 : 0) - (forward ? 1 : 0));
        const sideVector = new THREE.Vector3((left ? 1 : 0) - (right ? 1 : 0), 0, 0);

        // Joystick Override
        if (joystick.x !== 0 || joystick.y !== 0) {
            frontVector.set(0, 0, joystick.y);
            sideVector.set(-joystick.x, 0, 0);
        }

        const direction = new THREE.Vector3();
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(isDriving ? DRIVE_SPEED : WALK_SPEED);

        // Get camera direction
        const camDir = new THREE.Vector3();
        state.camera.getWorldDirection(camDir);
        camDir.y = 0;
        camDir.normalize();

        const camRight = new THREE.Vector3();
        camRight.crossVectors(state.camera.up, camDir).normalize();

        // Apply camera rotation to movement
        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(camDir, -frontVector.z);
        moveDir.addScaledVector(camRight, sideVector.x);

        if (joystick.x !== 0 || joystick.y !== 0) {
            moveDir.addScaledVector(camDir, -joystick.y);
            moveDir.addScaledVector(camRight, -joystick.x);
        }

        if (moveDir.length() > 0) {
            // Cancel dance if moving
            if (isDancing) toggleDance();

            moveDir.normalize().multiplyScalar(isDriving ? DRIVE_SPEED : WALK_SPEED);
            rb.current.setLinvel({
                x: moveDir.x,
                y: linvel.y,
                z: moveDir.z
            }, true);

            // ROTATION - Snappy 0.35 slerp for mobile "pro" feel
            const targetRotation = Math.atan2(moveDir.x, moveDir.z);
            const targetQuaternion = new THREE.Quaternion();
            targetQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRotation);
            if (groupRef.current) {
                groupRef.current.quaternion.slerp(targetQuaternion, 0.35);
            }
        } else {
            // Damping handled by rigid body if enabled, otherwise stop
            rb.current.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
        }

        // JUMP & FLIGHT
        if (jump) {
            if (Math.abs(linvel.y) < 0.1) {
                // Initial Jump
                rb.current.applyImpulse({ x: 0, y: JUMP_FORCE, z: 0 }, true);
            } else if (flightUnlocked && linvel.y < 20) {
                // Flight / Hover - increased force
                rb.current.applyImpulse({ x: 0, y: 1.5, z: 0 }, true);
            }
        }

        // SHOOTING (Paintball)
        if (joystick.action && (!lastUpdate.current || Date.now() - lastUpdate.current > 200)) {
            if (!rb.current.userData) rb.current.userData = { lastShot: 0 };
            const now = Date.now();
            if (now - rb.current.userData.lastShot > 300) {
                rb.current.userData.lastShot = now;

                const playerPos = rb.current.translation();
                let shootDir = new THREE.Vector3(0, 0, 1);
                if (groupRef.current) {
                    shootDir.applyQuaternion(groupRef.current.quaternion);
                }
                shootDir.normalize();

                const origin = [playerPos.x, playerPos.y + 1.2, playerPos.z];
                shoot(origin, [shootDir.x, shootDir.y, shootDir.z]);
            }
        }

        // --- CAMERA FOLLOW (TPS) ---
        if (controlsRef.current) {
            const t = rb.current.translation();
            const target = controlsRef.current.target;
            const prevTarget = target.clone();
            target.set(t.x, t.y + 1.5, t.z);

            const deltaX = t.x - prevTarget.x;
            const deltaY = (t.y + 1.5) - prevTarget.y;
            const deltaZ = t.z - prevTarget.z;

            state.camera.position.x += deltaX;
            state.camera.position.y += deltaY;
            state.camera.position.z += deltaZ;

            controlsRef.current.update();
        }

        // --- NETWORK SYNC ---
        const now = Date.now();
        if (now - lastUpdate.current > 50) { // Increased frequency to 20Hz (50ms)
            const rot = groupRef.current ? [0, groupRef.current.rotation.y, 0] : [0, 0, 0];
            updateMyPosition([translation.x, translation.y, translation.z], rot);
            lastUpdate.current = now;
        }

        // --- AUTO-FOLLOW CAMERA (SMOOTH BEHIND-THE-BACK) ---
        const isMoving = (moveDir.length() > 0.01);
        if (isMoving && controlsRef.current) {
            // Get player's current visual rotation from groupRef
            if (groupRef.current) {
                const playerRotationY = groupRef.current.rotation.y;

                // Camera target distance (minDistance = 5)
                const camDistance = controlsRef.current.getDistance();

                // Calculate idealized "behind" position
                // The character's forward is technically Z in its own space? 
                // In useFrame, we set targetRotation = Math.atan2(moveDir.x, moveDir.z)
                // So player is facing moveDir. We want camera to be at -moveDir * distance.

                const idealOffset = new THREE.Vector3(0, 3, camDistance);
                idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotationY);

                const targetCamPos = translation.x + idealOffset.x;
                const targetCamPosX = translation.x + idealOffset.x;
                const targetCamPosY = translation.y + idealOffset.y;
                const targetCamPosZ = translation.z + idealOffset.z;

                // Smoothly interpolate camera position towards ideal spot
                // But only if user isn't actively manual-rotating? 
                // OrbitControls has a 'change' event or we can check mouse/touch delta.
                // For simplicity, we just use a low lerp factor like 0.05

                const currentCamPos = state.camera.position;
                currentCamPos.x = THREE.MathUtils.lerp(currentCamPos.x, targetCamPosX, 0.05);
                currentCamPos.y = THREE.MathUtils.lerp(currentCamPos.y, targetCamPosY, 0.05);
                currentCamPos.z = THREE.MathUtils.lerp(currentCamPos.z, targetCamPosZ, 0.05);

                controlsRef.current.update();
            }
        }

        // --- FALL CHECK ---
        if (translation.y < -20) {
            rb.current.setTranslation({ x: 0, y: 10, z: 0 }, true);
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        }

        // --- ANIMATION ---
        if (groupRef.current) {
            // DANCE ANIMATION
            if (isDancing) {
                const danceSpeed = 10;
                groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * danceSpeed) * 0.5 + Math.PI; // Face camera roughly or just wiggle
                groupRef.current.position.y = Math.abs(Math.sin(state.clock.elapsedTime * danceSpeed * 2)) * 0.5; // BOUNCE
                groupRef.current.scale.lerp(new THREE.Vector3(1.1, 0.9, 1.1), 0.2); // SQUASH/STRETCH visual
            } else {
                groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                // Reset position y if not jumping/falling? The rigid body handles physics Y, but groupRef acts as offset visual.
                // We should be careful modifying groupRef.position.y if it's relative to RB.
                // Resetting to 0 is safe for walking.
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, isDriving ? 0.5 : 0, 0.1);
            }
        }
    });

    // Detect state change outside of useFrame
    if (prevIsDriving.current !== isDriving) {
        if (groupRef.current) {
            groupRef.current.scale.set(0.1, 0.1, 0.1);
        }
        prevIsDriving.current = isDriving;
    }

    return (
        <RigidBody
            ref={rb}
            colliders={false}
            enabledRotations={[false, false, false]}
            position={[0, 5, 20]} // Safe spawn outside castle
            linearDamping={1.5} // Reduced from 5 to allow flight/momentum
        >
            <CapsuleCollider args={[0.75, 0.5]} position={[0, 0.75, 0]} />

            {/* ORBIT CONTROLS - Attached to player logic for following */}
            <OrbitControls
                ref={controlsRef}
                enablePan={false}
                enableDamping={true}
                maxPolarAngle={Math.PI / 2 - 0.1} // Don't go below ground
                minDistance={5}
                maxDistance={20}
            />

            {/* VISUALS */}
            <group ref={groupRef}>
                {isDriving ? (
                    <group position={[0, 0.5, 0]}>
                        <VehicleModel color={myColor} />
                    </group>
                ) : customization?.disguiseProp ? (
                    <DisguiseModel type={customization.disguiseProp} />
                ) : (
                    <CharacterModel color={myColor} type={characterType} {...(customization || {})} />
                )}
                {/* Name Tag (Only show if NOT disguised) */}
                {!customization?.disguiseProp && (
                    <Text position={[0, 2.8, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="black">
                        {myName}
                    </Text>
                )}

                {/* Driving Particles */}
                <Particles parentRef={rb} isDriving={isDriving} />

                {/* Collectibles System - tracks player body */}
                <Collectibles playerPos={rb} />

                {/* Wings Visual (Magical Wings) */}
                {flightUnlocked && (
                    <group position={[0, 1.2, -0.3]}>
                        {/* Upper Wing Left */}
                        <mesh position={[-0.6, 0.4, 0]} rotation={[0.2, 0.4, 0.5]}>
                            <boxGeometry args={[1.2, 0.6, 0.1]} />
                            <meshStandardMaterial color="cyan" transparent opacity={0.6} emissive="cyan" emissiveIntensity={0.5} />
                        </mesh>
                        {/* Lower Wing Left */}
                        <mesh position={[-0.4, -0.1, 0]} rotation={[-0.1, 0.3, 0.3]}>
                            <boxGeometry args={[0.8, 0.4, 0.1]} />
                            <meshStandardMaterial color="lightblue" transparent opacity={0.6} emissive="cyan" emissiveIntensity={0.3} />
                        </mesh>
                        {/* Upper Wing Right */}
                        <mesh position={[0.6, 0.4, 0]} rotation={[0.2, -0.4, -0.5]}>
                            <boxGeometry args={[1.2, 0.6, 0.1]} />
                            <meshStandardMaterial color="cyan" transparent opacity={0.6} emissive="cyan" emissiveIntensity={0.5} />
                        </mesh>
                        {/* Lower Wing Right */}
                        <mesh position={[0.4, -0.1, 0]} rotation={[-0.1, -0.3, -0.3]}>
                            <boxGeometry args={[0.8, 0.4, 0.1]} />
                            <meshStandardMaterial color="lightblue" transparent opacity={0.6} emissive="cyan" emissiveIntensity={0.3} />
                        </mesh>
                    </group>
                )}

                {/* Voice Chat System - passed body ref for spatial audio */}
                <VoiceChat myPosRef={rb} />
            </group>

            {/* PET SYSTEM REMOVED */}

        </RigidBody>
    );
}
// Actually, creating a separate component for the logic inside Scene is cleaner.
// PlayerController is getting messy.
// Let's revert the PlayerController change and put VoiceChat in Scene, passing the MY PLAYER position via a ref or store.
// But we don't sync my LOCAL position to store every frame locally... wait we throttled sync.
// We need access to the local Ref.
