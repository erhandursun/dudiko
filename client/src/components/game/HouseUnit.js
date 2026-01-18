import React, { useState, useMemo, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text, Html } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';
import * as THREE from 'three';

const COLORS = ['hotpink', '#D81B60', '#BA68C8', '#4FC3F7', '#81C784', '#FFD54F', '#FF8A65', '#90A4AE'];

function WindowBox({ position, color }) {
    return (
        <group position={position}>
            {/* Box */}
            <mesh castShadow>
                <boxGeometry args={[1.0, 0.2, 0.3]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>
            {/* Flowers */}
            <group position={[0, 0.15, 0]}>
                <mesh position={[-0.3, 0, 0]}> <sphereGeometry args={[0.1]} /> <meshStandardMaterial color="#FF4081" /> </mesh>
                <mesh position={[0, 0, 0]}> <sphereGeometry args={[0.1]} /> <meshStandardMaterial color="#F48FB1" /> </mesh>
                <mesh position={[0.3, 0, 0]}> <sphereGeometry args={[0.1]} /> <meshStandardMaterial color="#FFEB3B" /> </mesh>
            </group>
        </group>
    );
}

export default function HouseUnit({ id, position, rotation = [0, 0, 0], onDraw }) {
    const houses = useSocketStore((state) => state.houses);
    const playerId = useSocketStore((state) => state.playerId);
    const buyHouse = useSocketStore((state) => state.buyHouse);
    const upgradeHouse = useSocketStore((state) => state.upgradeHouse);
    const changeHouseColor = useSocketStore((state) => state.changeHouseColor);
    const coins = useSocketStore((state) => state.coins);

    const houseData = houses[id];
    const owner = houseData;
    const isMine = owner && owner.ownerId === playerId;
    const rank = owner ? owner.rank : 1;
    const houseColor = owner ? owner.color : '#FCE4EC';

    // Pricing & Scaling Logic
    const { nextUpgradeCost, initialPrice, scale } = useMemo(() => {
        const basePrice = 500;
        const nextCost = Math.floor(basePrice * Math.pow(1.3, rank));
        return {
            initialPrice: basePrice,
            nextUpgradeCost: nextCost,
            scale: 1 + (rank - 1) * 0.05 // Grows 5% each level
        };
    }, [rank]);

    const [hovered, setHovered] = useState(false);
    const [showPanel, setShowPanel] = useState(false);

    const handleBuy = (e) => {
        e.stopPropagation();
        if (!owner && coins >= initialPrice) {
            buyHouse(id, initialPrice);
        }
    };

    const handleUpgrade = (e) => {
        e.stopPropagation();
        if (isMine && coins >= nextUpgradeCost && rank < 30) {
            upgradeHouse(id, nextUpgradeCost);
        }
    };


    // Panel Styles
    const panelStyle = {
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '3px solid gold',
        padding: '20px',
        borderRadius: '25px',
        color: 'white',
        minWidth: '240px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        fontFamily: "'Outfit', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    };

    const btnStyle = {
        width: '100%',
        padding: '12px',
        background: 'linear-gradient(45deg, #FFD700, #FFA000)',
        border: 'none',
        borderRadius: '12px',
        fontWeight: 'bold',
        color: '#4E342E',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: '0 4px 10px rgba(255, 215, 0, 0.3)'
    };

    return (
        <group position={position}>
            {/* --- GARDEN AREA --- */}
            <group>
                {/* Grass Patch */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                    <planeGeometry args={[12, 12]} />
                    <meshStandardMaterial color={owner ? "#A5D6A7" : "#C8E6C9"} />
                </mesh>

                {/* Fence (Appears at Rank 2) */}
                {rank >= 2 && (
                    <group>
                        {[[-5.8, 0], [5.8, 0], [0, -5.8], [0, 5.8]].map((p, i) => (
                            <mesh key={i} position={[p[0], 0.4, p[1]]} rotation={[0, i < 2 ? 0 : Math.PI / 2, 0]}>
                                <boxGeometry args={[0.2, 0.8, 12]} />
                                <meshStandardMaterial color="#81C784" />
                            </mesh>
                        ))}
                    </group>
                )}

                {/* Path (Rank 5) - Now Colorful Stones */}
                {rank >= 5 && (
                    <group position={[0, 0.02, 3.5]}>
                        {[[-0.5, 1], [0.5, 2], [-0.3, 0], [0.4, -1], [-0.2, -2]].map((pos, i) => (
                            <mesh key={`stone-${i}`} position={[pos[0], 0, pos[1]]} rotation={[-Math.PI / 2, 0, 0]}>
                                <circleGeometry args={[0.4, 8]} />
                                <meshStandardMaterial color={["#FF80AB", "#81C784", "#4FC3F7", "#FFF176"][i % 4]} />
                            </mesh>
                        ))}
                    </group>
                )}

                {/* Trees (Rank 10) */}
                {rank >= 10 && (
                    <group position={[-4, 0, -4]}>
                        <mesh position={[0, 1.5, 0]} castShadow> <cylinderGeometry args={[0.2, 0.3, 3]} /> <meshStandardMaterial color="#5D4037" /> </mesh>
                        <mesh position={[0, 3.5, 0]} castShadow> <sphereGeometry args={[1.5]} /> <meshStandardMaterial color="#388E3C" /> </mesh>
                    </group>
                )}

                {/* Fountain (Rank 20) */}
                {rank >= 20 && (
                    <group position={[4, 0, -4]}>
                        <mesh position={[0, 0.2, 0]}> <cylinderGeometry args={[2, 2, 0.4, 16]} /> <meshStandardMaterial color="#90A4AE" /> </mesh>
                        <mesh position={[0, 1.2, 0]}> <sphereGeometry args={[0.6]} /> <meshStandardMaterial color="#4FC3F7" emissive="#4FC3F7" emissiveIntensity={1} /> </mesh>
                    </group>
                )}

                {/* Hanging Plants (Decorations) */}
                <group position={[0, 2.5, 2.3]}>
                    <mesh position={[-0.8, 0, 0]}> <sphereGeometry args={[0.15]} /> <meshStandardMaterial color="#4CAF50" /> </mesh>
                    <mesh position={[0.8, 0, 0]}> <sphereGeometry args={[0.15]} /> <meshStandardMaterial color="#4CAF50" /> </mesh>
                </group>
            </group>

            {/* --- THE HOUSE --- */}
            <group scale={scale} position={[0, 0, 0]}>
                <RigidBody type="fixed" colliders="trimesh">
                    {/* Main Building Walls (Hollow) */}
                    {/* Back Wall */}
                    <mesh
                        position={[0, 3, -3.9]}
                        castShadow receiveShadow
                        onPointerOver={() => setHovered(true)}
                        onPointerOut={() => setHovered(false)}
                        onClick={() => setHovered(!hovered)}
                    >
                        <boxGeometry args={[8, 6, 0.1]} />
                        <meshStandardMaterial color={owner ? houseColor : (hovered ? "#FFF9C4" : "#F8BBD0")} />
                    </mesh>
                    {/* Left Wall */}
                    <mesh
                        position={[-3.9, 3, 0]}
                        castShadow receiveShadow
                        onPointerOver={() => setHovered(true)}
                        onPointerOut={() => setHovered(false)}
                        onClick={() => setHovered(!hovered)}
                    >
                        <boxGeometry args={[0.1, 6, 8]} />
                        <meshStandardMaterial color={owner ? houseColor : (hovered ? "#FFF9C4" : "#F8BBD0")} />
                    </mesh>
                    {/* Left Wall Drawing Board */}
                    <mesh
                        position={[-3.85, 3, 0]}
                        rotation={[0, -Math.PI / 2, 0]}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDraw) onDraw(id, 'left');
                        }}
                    >
                        <boxGeometry args={[4, 4, 0.05]} />
                        <meshStandardMaterial color="#E1BEE7" emissive="#BA68C8" emissiveIntensity={0.2} />
                        <Text position={[0, 2.2, 0]} fontSize={0.3} color="white">BURAYA ÇİZ! 🎨</Text>
                    </mesh>

                    {/* Right Wall Drawing Board */}
                    <mesh
                        position={[3.85, 3, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onDraw) onDraw(id, 'right');
                        }}
                    >
                        <boxGeometry args={[4, 4, 0.05]} />
                        <meshStandardMaterial color="#E1BEE7" emissive="#BA68C8" emissiveIntensity={0.2} />
                        <Text position={[0, 2.2, 0]} fontSize={0.3} color="white">BURAYA ÇİZ! 🎨</Text>
                    </mesh>

                    {/* Right Wall */}
                    <mesh
                        position={[3.9, 3, 0]}
                        castShadow receiveShadow
                        onPointerOver={() => setHovered(true)}
                        onPointerOut={() => setHovered(false)}
                        onClick={() => setHovered(!hovered)}
                    >
                        <boxGeometry args={[0.1, 6, 8]} />
                        <meshStandardMaterial color={owner ? houseColor : (hovered ? "#FFF9C4" : "#F8BBD0")} />
                    </mesh>
                    {/* Front Wall (Left Piece) */}
                    <mesh position={[-2.5, 3, 3.9]} castShadow receiveShadow>
                        <boxGeometry args={[3, 6, 0.1]} />
                        <meshStandardMaterial color={owner ? houseColor : (hovered ? "#FFF9C4" : "#F8BBD0")} />
                    </mesh>
                    {/* Front Wall (Right Piece) */}
                    <mesh position={[2.5, 3, 3.9]} castShadow receiveShadow>
                        <boxGeometry args={[3, 6, 0.1]} />
                        <meshStandardMaterial color={owner ? houseColor : (hovered ? "#FFF9C4" : "#F8BBD0")} />
                    </mesh>
                    {/* Front Wall (Top Piece above door) */}
                    <mesh position={[0, 4.5, 3.9]} castShadow receiveShadow>
                        <boxGeometry args={[2, 3, 0.1]} />
                        <meshStandardMaterial color={owner ? houseColor : (hovered ? "#FFF9C4" : "#F8BBD0")} />
                    </mesh>

                    {/* Floor (Inside) */}
                    <mesh position={[0, 0.05, 0]} receiveShadow>
                        <boxGeometry args={[8, 0.1, 8]} />
                        <meshStandardMaterial color="#E1BEE7" />
                    </mesh>

                    {/* Roof (Scaled Up) */}
                    <mesh position={[0, 7.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                        <coneGeometry args={[7, 4, 4]} />
                        <meshStandardMaterial color="#D81B60" />
                    </mesh>

                    {/* Chimney */}
                    <mesh position={[2.5, 8.5, -2.5]} castShadow>
                        <boxGeometry args={[1, 3, 1]} />
                        <meshStandardMaterial color="#5D4037" />
                    </mesh>

                    {/* Windows Front */}
                    {[[-2.5, 3.5, 4.01], [2.5, 3.5, 4.01]].map((p, i) => (
                        <group key={`front-win-${i}`} position={p}>
                            <mesh> <planeGeometry args={[1.5, 1.5]} /> <meshStandardMaterial color="#FFEB3B" emissive="#FFEB3B" emissiveIntensity={0.5} /> </mesh>
                            <WindowBox position={[0, -1, 0.1]} />
                        </group>
                    ))}

                    {/* Decorative Towers (Scaled up) */}
                    {rank >= 8 && (
                        <group position={[4.5, 0, 4.5]}>
                            <mesh position={[0, 4, 0]} castShadow> <cylinderGeometry args={[1, 1, 8]} /> <meshStandardMaterial color={houseColor} /> </mesh>
                            <mesh position={[0, 9, 0]} castShadow> <coneGeometry args={[1.2, 3, 8]} /> <meshStandardMaterial color="#AD1457" /> </mesh>
                        </group>
                    )}
                </RigidBody>

                {/* Porch / Roof Piece */}
                <group position={[0, 0.1, 4.2]}>
                    <mesh position={[0, 3, 0]} rotation={[0.2, 0, 0]}>
                        <boxGeometry args={[3, 0.2, 1]} />
                        <meshStandardMaterial color="#D81B60" />
                    </mesh>
                </group>
            </group>

            {/* --- UI --- */}
            <Text
                position={[0, 6 + (rank * 0.1), 0]}
                fontSize={0.9}
                color={owner ? "#FFD700" : "white"}
                outlineWidth={0.1}
                outlineColor="#3E2723"
            >
                {owner ? `${owner.ownerName}'in Sarayı✨` : `🌸 Boş Arsa`}
            </Text>

            {owner && (
                <Text position={[0, 5.2 + (rank * 0.1), 0]} fontSize={0.5} color="#81C784" outlineWidth={0.05} outlineColor="black">
                    Seviye {rank}
                </Text>
            )}

            {!owner && (
                <Text position={[0, 4.5, 0]} fontSize={0.6} color="#FFEB3B" outlineWidth={0.06} outlineColor="black">
                    {initialPrice} 💰
                </Text>
            )}

            {/* Interactions */}
            {hovered && (
                <Html position={[0, 2.5, 2.5]} center>
                    {!owner ? (
                        <button
                            onClick={handleBuy}
                            style={{
                                padding: '15px 30px',
                                background: coins >= initialPrice ? 'linear-gradient(45deg, #FF4081, #C2185B)' : '#757575',
                                color: 'white',
                                border: '4px solid gold',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '20px',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
                                whiteSpace: 'nowrap',
                                transition: 'transform 0.2s'
                            }}
                        >
                            {coins >= initialPrice ? 'SAHİPLEN! ✨' : 'Altın Gerek 💎'}
                        </button>
                    ) : (
                        isMine && (
                            <button
                                onClick={() => setShowPanel(true)}
                                style={{
                                    padding: '12px 24px',
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: '2px solid white',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                }}
                            >
                                🏡 YÖNET
                            </button>
                        )
                    )}
                </Html>
            )}

            {/* Customization Window */}
            {showPanel && isMine && (
                <Html position={[0, 5, 0]} center>
                    <div style={panelStyle}>
                        <h3 style={{ margin: '0', color: 'gold' }}>SARAYIN ✨</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                            <span>Seviye:</span>
                            <span style={{ fontWeight: 'bold' }}>{rank} / 30</span>
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={coins < nextUpgradeCost || rank >= 30}
                            style={{
                                ...btnStyle,
                                opacity: (coins < nextUpgradeCost || rank >= 30) ? 0.6 : 1,
                                cursor: (coins < nextUpgradeCost || rank >= 30) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {rank < 30 ? `GELİŞTİR (${nextUpgradeCost} 💰)` : 'MAX SEVİYE! 💎'}
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', margin: '10px 0' }}>
                            {COLORS.map(c => (
                                <div
                                    key={c}
                                    onClick={() => changeHouseColor(id, c)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: c,
                                        border: houseColor === c ? '4px solid white' : '2px solid rgba(255,255,255,0.3)',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => setShowPanel(false)}
                            style={{ background: 'transparent', border: '1px solid white', color: 'white', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                        >
                            Kapat
                        </button>
                    </div>
                </Html>
            )}
        </group>
    );
}
