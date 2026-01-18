'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import styles from './Chat.module.css';

export default function Chat() {
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([]); // Local history for display
    const socket = useSocketStore((state) => state.socket);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = ({ id, message, name }) => {
            setHistory(prev => [...prev, { id, message, name, time: Date.now() }].slice(-20));
        };

        socket.on('player-chat', handleMessage);
        return () => socket.off('player-chat', handleMessage);
    }, [socket]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() && socket) {
            socket.emit('chat', message);
            setMessage('');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.history}>
                {history.map((msg, i) => (
                    <div key={i} className={styles.message}>
                        <span className={styles.name}>{msg.name}:</span> {msg.message}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className={styles.form}>
                <input
                    type="text"
                    className={styles.input}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Sohbet et... (Enter)"
                />
            </form>
        </div>
    );
}
