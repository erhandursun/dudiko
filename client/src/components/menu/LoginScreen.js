'use client';

import { useState, useEffect } from 'react';
import styles from './LoginScreen.module.css';
import { useSocketStore } from '@/stores/socketStore';

export default function LoginScreen({ onJoin }) {
    const players = useSocketStore((state) => state.players);
    const [name, setName] = useState('');
    const [ornaments, setOrnaments] = useState([]);

    useEffect(() => {
        const savedName = localStorage.getItem('webtown_name');
        if (savedName) setName(savedName);
        else {
            const randomNum = Math.floor(Math.random() * 100) + 1;
            setName(`Oyuncu ${randomNum}`);
        }

        const newOrnaments = [...Array(10)].map((_, i) => ({
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
            delay: `${i * 1.2}s`,
            size: `${Math.random() * 20 + 20}px`
        }));
        setOrnaments(newOrnaments);
    }, []);

    const handleJoin = (e) => {
        e.preventDefault();
        if (name.trim()) {
            localStorage.setItem('webtown_name', name.trim());
            // Using defaults for simplicity as requested
            onJoin(name, 'hotpink', 'child', {
                hairStyle: 'classic',
                hairColor: '#3E2723',
                faceType: 'happy',
                hatType: 'none',
                glassesType: 'none',
                backpackType: 'none',
                wingsType: 'none'
            });
        }
    };

    const onlinePlayerCount = Object.keys(players).length;

    return (
        <div className={styles.loginOverlay}>
            <div className={styles.minimalCard}>
                <div className={styles.brandingHeader}>
                    <h1 className={styles.mainTitle}>DUDIKO</h1>
                    <div className={styles.designerBadge}>
                        <span>v3.1.2 🚀</span>
                    </div>
                </div>

                <form onSubmit={handleJoin} className={styles.minimalForm}>
                    <div className={styles.inputSection}>
                        <label>İSMİN NEDİR?</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="İsmini yaz..."
                            maxLength={15}
                            required
                            autoFocus
                        />
                    </div>

                    <button type="submit" className={styles.hugeStartBtn}>
                        OYUNA GİR 🚀
                    </button>
                </form>

                <div className={styles.minimalStatus}>
                    <div className={styles.pulseDot} />
                    <span>{onlinePlayerCount} Oyuncu Çevrimiçi</span>
                </div>
            </div>

            {/* Background Decorations */}
            {ornaments.map((orn, i) => (
                <div key={i} className={styles.bgFloating} style={{
                    left: orn.left,
                    top: orn.top,
                    animationDelay: orn.delay,
                    fontSize: orn.size
                }}>✨</div>
            ))}
        </div>
    );
}
