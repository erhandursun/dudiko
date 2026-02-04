'use client';

import { useState, useEffect } from 'react';
import styles from './LoginScreen.module.css';

export default function UI_LoginScreen({ onJoin }) {
    const [name, setName] = useState('');

    const handleJoin = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onJoin(name, 'hotpink', 'child', {});
        }
    };

    return (
        <div className={styles.loginOverlay}>
            <div className={styles.minimalCard}>
                <div className={styles.brandingHeader}>
                    <h1 className={styles.mainTitle}>DUDIKO</h1>
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
                        />
                    </div>
                    <button type="submit" className={styles.hugeStartBtn}>OYUNA GİR 🚀</button>
                </form>
            </div>
        </div>
    );
}
