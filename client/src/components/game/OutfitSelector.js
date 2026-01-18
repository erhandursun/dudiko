'use client';

import { useSocketStore } from '@/stores/socketStore';
import styles from './OutfitSelector.module.css';

const COLORS = [
    { name: 'Mor', value: 'mediumpurple' },
    { name: 'Kırmızı', value: '#FF5252' },
    { name: 'Mavi', value: '#448AFF' },
    { name: 'Turuncu', value: '#FFAB40' },
    { name: 'Yeşil', value: '#69F0AE' },
    { name: 'Siyah', value: '#333' },
];

export default function OutfitSelector() {
    const updateMyColor = useSocketStore((state) => state.updateMyColor);
    const myColor = useSocketStore((state) => state.myColor);

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Kıyafet</h3>
            <div className={styles.grid}>
                {COLORS.map((c) => (
                    <button
                        key={c.value}
                        onClick={() => updateMyColor(c.value)}
                        className={`${styles.colorBtn} ${myColor === c.value ? styles.selected : ''}`}
                        style={{ background: c.value }}
                        title={c.name}
                    />
                ))}
            </div>
        </div>
    );
}
