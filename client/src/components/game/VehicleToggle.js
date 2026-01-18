'use client';

import { useSocketStore } from '@/stores/socketStore';
import styles from './VehicleToggle.module.css';

export default function VehicleToggle() {
    const isDriving = useSocketStore((state) => state.isDriving);
    const toggleDriving = useSocketStore((state) => state.toggleDriving);

    return (
        <div className={styles.container}>
            <button
                className={`${styles.toggleBtn} ${isDriving ? styles.driveActive : ''}`}
                onClick={toggleDriving}
                title={isDriving ? "Çıkış Yap" : "Arabaya Bin"}
            >
                <span className={styles.icon}>
                    {isDriving ? '🚗' : '🚶‍♀️'}
                </span>
            </button>
        </div>
    );
}
