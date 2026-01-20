import React, { useState, useEffect } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import City from './City';
import ArtGallery from './ArtGallery';
import RemotePlayer from './RemotePlayer';
import GiftBox from './GiftBox';

export default function TownWorld({ onDraw }) {
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);
    const socket = useSocketStore((state) => state.socket);
    const [gifts, setGifts] = useState([]);

    useEffect(() => {
        if (!socket) return;

        socket.on('load-gifts', (loadedGifts) => setGifts(loadedGifts));
        socket.on('new-gift', (newGift) => setGifts(prev => [...prev, newGift]));
        socket.on('gift-collected', (giftId) => {
            setGifts(prev => prev.filter(g => g.id !== giftId));
        });

        // Request initial
        socket.emit('get-gifts');

        return () => {
            socket.off('load-gifts');
            socket.off('new-gift');
            socket.off('gift-collected');
        };
    }, [socket]);

    const handleCollect = (giftId) => {
        socket.emit('collect-gift', giftId);
    };

    return (
        <group>
            {/* Town Specific Assets */}
            <City onDraw={onDraw} />
            <ArtGallery />

            {/* Gifts */}
            {gifts.map(gift => (
                <GiftBox
                    key={gift.id}
                    position={gift.position}
                    onClick={() => handleCollect(gift.id)}
                />
            ))}

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
