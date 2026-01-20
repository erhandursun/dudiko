'use client';

import React, { useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Float, Text, ContactShadows, Environment, Html } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';
import RemotePlayer from './RemotePlayer';
import MathBoard from './MathBoard';
import EnglishBoard from './EnglishBoard';
import BookReader from './BookReader';
import TeacherDesk from './TeacherDesk';

export default function SchoolWorld() {
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);

    return (
        <group>
            {/* 1. Floor - Warm Wood / Classroom Floor */}
            <RigidBody type="fixed" friction={1}>
                <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#fdf2f8" />
                </mesh>
            </RigidBody>

            {/* 2. The Main Classroom Building Outer Shell */}
            <SchoolBuilding />

            {/* 3. Interactive Classrooms (Desks & Blackboard) */}
            <ClassroomInterior position={[0, 0, -5]} />

            {/* 4. Magical Fountain (Simpler, no heavy effects) */}
            <RigidBody type="fixed" position={[20, 0, 15]}>
                <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[5, 5.5, 0.4, 32]} />
                    <meshStandardMaterial color="#fbcfe8" />
                </mesh>
                <mesh position={[0, 2.5, 0]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
                </mesh>
            </RigidBody>

            {/* Atmosphere */}
            <Environment preset="city" />
            <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={100} blur={2.5} far={15} />

            {/* Remote Players */}
            {Object.entries(players).map(([id, data]) => {
                if (id === playerId || !data.position) return null;
                if (data.currentWorld !== 'school') return null;

                return (
                    <RemotePlayer
                        key={id}
                        position={data.position}
                        rotation={data.rotation}
                        color={data.color}
                        isDriving={data.isDriving}
                        name={data.name}
                        lastChat={data.chatMessage}
                        characterType={data.characterType}
                        customization={data.customization}
                    />
                );
            })}
        </group>
    );
}

function SchoolBuilding() {
    return (
        <RigidBody type="fixed" position={[0, 0, -25]}>
            {/* Building Frame */}
            <mesh position={[0, 8, 0]} castShadow receiveShadow>
                <boxGeometry args={[80, 16, 20]} />
                <meshStandardMaterial color="#fce7f3" />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 16.5, 0]}>
                <boxGeometry args={[82, 1, 22]} />
                <meshStandardMaterial color="#f472b6" />
            </mesh>

            {/* Room Divider Walls Inside */}
            {/* Left Divider */}
            <mesh position={[-15, 8, 0]}>
                <boxGeometry args={[1, 15, 18]} />
                <meshStandardMaterial color="white" />
            </mesh>
            {/* Right Divider */}
            <mesh position={[15, 8, 0]}>
                <boxGeometry args={[1, 15, 18]} />
                <meshStandardMaterial color="white" />
            </mesh>

            {/* Front Label */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Text
                    position={[0, 12, 11]}
                    fontSize={3}
                    color="#db2777"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.1}
                    outlineColor="white"
                >
                    PRENSES AKADEMİSİ 🏫
                </Text>
            </Float>
        </RigidBody>
    );
}

function ClassroomInterior({ position }) {
    return (
        <group position={position}>

            {/* --- CENTRAL HALL: TEACHER & READING --- */}
            <TeacherDesk position={[0, 0, 12]} text="Minik Bir Elif Duha" />

            {/* Reading Nook at the back of center hall */}
            <group position={[0, 0, -20]}>
                <Text position={[0, 6, 0]} fontSize={2} color="#FBC02D">KÜTÜPHANE 📚</Text>
                <BookReader position={[-6, 0, 0]} rotation={[0, 0.5, 0]} />
                <BookReader position={[6, 0, 0]} rotation={[0, -0.5, 0]} />
            </group>


            {/* --- LEFT ROOM: MATH CLASS --- */}
            <group position={[-28, 0, -5]}>
                <Text position={[0, 6, 0]} fontSize={1.5} color="#0288D1">MATEMATİK 📐</Text>
                <MathBoard position={[0, 0, -8]} />

                <Desk position={[-3, 0, 0]} />
                <Desk position={[3, 0, 0]} />
                <Desk position={[-3, 0, 5]} />
                <Desk position={[3, 0, 5]} />
            </group>

            {/* --- RIGHT ROOM: ENGLISH CLASS --- */}
            <group position={[28, 0, -5]}>
                <Text position={[0, 6, 0]} fontSize={1.5} color="#E91E63">İNGİLİZCE 🇬🇧</Text>
                <EnglishBoard position={[0, 0, -8]} />

                <Desk position={[-3, 0, 0]} />
                <Desk position={[3, 0, 0]} />
                <Desk position={[-3, 0, 5]} />
                <Desk position={[3, 0, 5]} />
            </group>

        </group>
    );
}

function Desk({ position }) {
    return (
        <group position={position}>
            <RigidBody type="fixed">
                <mesh position={[0, 1.2, 0]} castShadow>
                    <boxGeometry args={[4, 0.2, 2.5]} />
                    <meshStandardMaterial color="#f9a8d4" />
                </mesh>
                <mesh position={[-1.8, 0.6, 1.1]}>
                    <boxGeometry args={[0.2, 1.2, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
                <mesh position={[1.8, 0.6, 1.1]}>
                    <boxGeometry args={[0.2, 1.2, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
                <mesh position={[-1.8, 0.6, -1.1]}>
                    <boxGeometry args={[0.2, 1.2, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
                <mesh position={[1.8, 0.6, -1.1]}>
                    <boxGeometry args={[0.2, 1.2, 0.2]} />
                    <meshStandardMaterial color="#f472b6" />
                </mesh>
                {/* Chair */}
                <mesh position={[0, 0.6, 2.5]} castShadow>
                    <boxGeometry args={[2.5, 0.2, 2]} />
                    <meshStandardMaterial color="#fdf2f8" />
                </mesh>
                <mesh position={[0, 1.5, 3.4]}>
                    <boxGeometry args={[2.5, 2, 0.2]} />
                    <meshStandardMaterial color="#fdf2f8" />
                </mesh>
            </RigidBody>
            <Text position={[0, 1.35, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#db2777">
                DERS ÇALIŞ ✨
            </Text>
        </group>
    );
}
