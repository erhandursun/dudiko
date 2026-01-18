'use client';

import { useEffect } from 'react';
import { useSocketStore } from '@/stores/socketStore';

export default function SocketManager() {
    const connect = useSocketStore((state) => state.connect);
    const disconnect = useSocketStore((state) => state.disconnect);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return null;
}
