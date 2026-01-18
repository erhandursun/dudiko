'use client';

import { useSocketStore } from '@/stores/socketStore';
import styles from './PlayerList.module.css';

export default function PlayerList() {
    const players = useSocketStore((state) => state.players);
    const playerCount = Object.keys(players).length;

    return (
        <div className={styles.container}>
            <div className={styles.title}>Oyuncular ({playerCount})</div>
            <ul className={styles.list}>
                {Object.entries(players).map(([id, player]) => (
                    <li key={id} className={styles.item}>
                        <span
                            className={styles.dot}
                            style={{ backgroundColor: player.color }}
                        />
                        {player.name || 'Misafir'}
                    </li>
                ))}
            </ul>
        </div>
    );
}
