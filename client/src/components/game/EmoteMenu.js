'use client';

import { useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import styles from './EmoteMenu.module.css';

const EMOTES = ['❤️', '👋', '😂', '👑', '💃'];

export default function EmoteMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const socket = useSocketStore((state) => state.socket);
    const playerId = useSocketStore((state) => state.playerId);

    const handleEmote = (emoji) => {
        if (socket && playerId) {
            socket.emit('emote', emoji);
            setIsOpen(false);
        }
    };

    return (
        <div className={styles.container}>
            <button
                className={styles.mainButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                😊
            </button>

            <div className={`${styles.menu} ${isOpen ? styles.open : ''}`}>
                {EMOTES.map((emoji) => (
                    <button
                        key={emoji}
                        className={styles.emoteButton}
                        onClick={() => handleEmote(emoji)}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}
