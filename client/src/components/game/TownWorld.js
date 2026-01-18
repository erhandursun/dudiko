'use client';

import React from 'react';
import { useSocketStore } from '@/stores/socketStore';
import City from './City';
import ArtGallery from './ArtGallery';
import RemotePlayer from './RemotePlayer';

export default function TownWorld({ onDraw }) {
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);

    return (
        <group>
            {/* Town Specific Assets */}
            <City onDraw={onDraw} />
            <ArtGallery />

            {/* Remote Players - Technically can be common, but keep here for world-scoping if needed later */}
            {Object.entries(players).map(([id, data]) => {
                if (id === playerId || !data.position) return null;
                // Only show players in the same world? 
                // For now, let's assume world sync happens on server too (we'll need to update server)
                // But for a simple start, everyone is everywhere or we filter by world property.
                if (data.currentWorld !== 'town') return null;

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
