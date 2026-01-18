'use client';

import { useSocketStore } from '@/stores/socketStore';
import styles from './MiniMap.module.css';

const MAP_SCALE = 2; // Scale factor for the map dots (e.g. 1 unit in game = 2px on map)
const MAP_SIZE = 150; // Map width/height in px

export default function MiniMap() {
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);

    const getMapPos = (pos) => {
        if (!pos) return { left: '50%', top: '50%' };
        // Game world: X is horizontal, Z is vertical (forward/back)
        // Map: X is left, Y is top
        // Assuming map center (0,0) is at 50%, 50%

        // Offset center
        const centerX = MAP_SIZE / 2;
        const centerY = MAP_SIZE / 2;

        const x = centerX + (pos[0] * MAP_SCALE);
        const y = centerY + (pos[2] * MAP_SCALE); // Z becomes Y on 2D map

        return { left: `${x}px`, top: `${y}px` };
    };

    return (
        <div className={styles.mapContainer}>
            <div className={styles.map}>
                {Object.entries(players).map(([id, player]) => {
                    const style = getMapPos(player.position);
                    const isMe = id === playerId;
                    return (
                        <div
                            key={id}
                            className={`${styles.playerDot} ${isMe ? styles.selfDot : ''}`}
                            style={{
                                ...style,
                                backgroundColor: player.color
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
