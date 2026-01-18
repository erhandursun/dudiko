'use client';

import { useEffect, useRef } from 'react';
import nipplejs from 'nipplejs';
import styles from './Joystick.module.css';

export default function Joystick({ onMove, onEnd }) {
    const managerRef = useRef(null);

    useEffect(() => {
        const options = {
            zone: document.getElementById('joystick-zone'),
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white',
        };

        const manager = nipplejs.create(options);
        managerRef.current = manager;

        manager.on('move', (evt, data) => {
            if (onMove) onMove(data);
        });

        manager.on('end', (evt, data) => {
            if (onEnd) onEnd(data);
        });

        return () => {
            manager.destroy();
        };
    }, [onMove, onEnd]);

    return (
        <div
            id="joystick-zone"
            className={styles.joystickWrapper}
        />
    );
}
