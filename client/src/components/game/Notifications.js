'use client';

import React, { useEffect } from 'react';
import { useSocketStore } from '@/stores/socketStore';

export default function Notifications() {
    const notifications = useSocketStore((state) => state.notifications);

    useEffect(() => {
        if (notifications.length > 0) {
            console.log('Notifications Component received state update:', notifications);
        }
    }, [notifications]);

    if (notifications.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 9999,
            pointerEvents: 'none',
            alignItems: 'center',
            width: '100%'
        }}>
            {notifications.map((n) => (
                <div key={n.id} style={{
                    background: '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '50px',
                    border: '4px solid #f472b6',
                    boxShadow: '0 8px 24px rgba(244, 114, 182, 0.4)',
                    color: '#db2777',
                    fontWeight: '900',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.5s ease'
                }}>
                    <span style={{ fontSize: '24px' }}>🌈</span>
                    {n.message}
                    <span style={{ fontSize: '24px' }}>✨</span>
                </div>
            ))}
        </div>
    );
}
