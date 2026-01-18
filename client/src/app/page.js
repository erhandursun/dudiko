'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import LoginScreen from '@/components/menu/LoginScreen';

const GameSession = dynamic(() => import('@/components/game/GameSession'), { ssr: false });
const EntranceHub = dynamic(() => import('@/components/menu/EntranceHub'), { ssr: false });

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const currentWorld = useSocketStore((state) => state.currentWorld);
  const connect = useSocketStore((state) => state.connect);

  const handleJoin = (name, color, characterType, customization) => {
    console.log('V2 Flow: Joining with', { name, currentWorld });
    connect(name, color, characterType, customization);
    setIsLoggedIn(true);
  };

  console.log('V2 Flow Render:', { isLoggedIn, currentWorld });

  return (
    <main className="w-full h-screen bg-black overflow-hidden">
      {!isLoggedIn ? (
        <LoginScreen onJoin={handleJoin} />
      ) : currentWorld === 'hub' ? (
        <EntranceHub />
      ) : (
        <GameSession />
      )}
    </main>
  );
}
