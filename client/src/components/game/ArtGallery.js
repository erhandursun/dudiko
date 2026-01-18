'use client';

import { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';
import * as THREE from 'three';

function Painting({ id, position, rotation, url, artist, houseId }) {
    const texture = useMemo(() => {
        if (!url) return null;
        try {
            return new THREE.TextureLoader().load(url);
        } catch (e) {
            console.error('Texture load failed:', e);
            return null;
        }
    }, [url]);
    const deleteArt = useSocketStore((state) => state.deleteArt);
    const [hovered, setHovered] = useState(false);

    const isWall = !!houseId;

    return (
        <group position={position} rotation={rotation || [0, 0, 0]}>
            {!isWall && (
                <group>
                    {/* Legs */}
                    <mesh position={[-0.5, -1.2, -0.15]} rotation={[0, 0, 0.2]}>
                        <boxGeometry args={[0.1, 2.5, 0.1]} />
                        <meshStandardMaterial color="#8D6E63" />
                    </mesh>
                    <mesh position={[0.5, -1.2, -0.15]} rotation={[0, 0, -0.2]}>
                        <boxGeometry args={[0.1, 2.5, 0.1]} />
                        <meshStandardMaterial color="#8D6E63" />
                    </mesh>
                    <mesh position={[0, -1.2, -0.95]} rotation={[-0.3, 0, 0]}>
                        <boxGeometry args={[0.1, 2.5, 0.1]} />
                        <meshStandardMaterial color="#8D6E63" />
                    </mesh>
                    {/* Canvas Holder */}
                    <mesh position={[0, -0.7, -0.05]}>
                        <boxGeometry args={[1.5, 0.1, 0.2]} />
                        <meshStandardMaterial color="#8D6E63" />
                    </mesh>
                </group>
            )}

            {/* The Painting */}
            <mesh
                position={[0, 0, 0.01]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <planeGeometry args={[isWall ? 3.5 : 1.4, isWall ? 3.5 : 1.4]} />
                <meshBasicMaterial map={texture || undefined} side={THREE.DoubleSide} transparent opacity={texture ? 1 : 0} />
            </mesh>

            {/* Label & Delete Button */}
            {hovered && (
                <Html position={[0, isWall ? 2 : 1, 0.1]} center>
                    <div style={{
                        background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 20px',
                        borderRadius: '15px', display: 'flex', flexDirection: 'column', gap: '5px',
                        pointerEvents: 'auto', border: '2px solid white', minWidth: '100px', textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '12px' }}>Sanatçı: {artist}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteArt(id);
                            }}
                            style={{
                                background: '#FF5252', border: 'none', color: 'white', padding: '5px',
                                borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            SİL 🗑️
                        </button>
                    </div>
                </Html>
            )}
        </group>
    );
}

export default function ArtGallery() {
    const artworks = useSocketStore((state) => state.artworks);

    return (
        <group>
            {artworks.map((art) => (
                <Painting
                    key={art.id}
                    id={art.id}
                    position={art.position}
                    rotation={art.rotation}
                    url={art.image}
                    artist={art.artist}
                    houseId={art.houseId}
                />
            ))}
        </group>
    );
}
