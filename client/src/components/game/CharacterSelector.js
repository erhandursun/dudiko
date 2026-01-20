'use client';

import { useSocketStore } from '@/stores/socketStore';
import styles from './CharacterSelector.module.css';

const CHAR_TYPES = [
    { id: 'mother', icon: '👩', label: 'Anne' },
    { id: 'father', icon: '👨', label: 'Baba' },
    { id: 'girl', icon: '👧', label: 'Kız Çocuk' },
    { id: 'boy', icon: '👦', label: 'Erkek Çocuk' },
    { id: 'baby', icon: '👶', label: 'Bebek' },
    { id: 'cat', icon: '🐈', label: 'Kedi' },
    { id: 'dog', icon: '🐕', label: 'Köpek' },
    // Car is handled via separate vehicle toggle, but we could include it here?
    // User liked the vehicle toggle style. Let's keep vehicle separate as "Driving Mode".
];

export default function CharacterSelector() {
    const characterType = useSocketStore((state) => state.characterType);
    const setCharacterType = useSocketStore((state) => state.setCharacterType);

    return (
        <div className={styles.dockContainer}>
            {CHAR_TYPES.map((type) => (
                <button
                    key={type.id}
                    className={`${styles.dockItem} ${characterType === type.id ? styles.active : ''}`}
                    onClick={() => setCharacterType(type.id)}
                >
                    {type.icon}
                    <span className={styles.tooltip}>{type.label}</span>
                </button>
            ))}
        </div>
    );
}
