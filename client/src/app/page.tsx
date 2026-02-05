'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import LoginScreen from '@/components/menu/LoginScreen';
import PortalLobby from '@/components/portal/PortalLobby';
import GameContainer from '@/components/portal/GameContainer';
import { GAME_REGISTRY } from '@/registry/games';

const BalloonEater = dynamic(() => import('@/games/BalloonEater3D/BalloonEater3D'), { ssr: false });
const VoxelWorld = dynamic(() => import('@/games/VoxelWorld/VoxelWorld'), { ssr: false });
const Math1D = dynamic(() => import('@/games/Math1D/Math1D'), { ssr: false });
const English1D = dynamic(() => import('@/games/English1D/English1D'), { ssr: false });
// Other games will be added here as they are implemented

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeGameId, setActiveGameId] = useState<string | null>(null);

    const myName = useSocketStore((state) => state.myName);
    const initSocket = useSocketStore((state) => state.initSocket);
    const joinGame = useSocketStore((state) => state.joinGame);

    useEffect(() => {
        initSocket();
    }, [initSocket]);

    const handleJoin = (name: string, color: string, characterType: string, customization: any) => {
        joinGame(name, color, characterType, customization);
        setIsLoggedIn(true);
        setActiveGameId(null); // Let them choose from portal
    };

    const handleSelectGame = (gameId: string) => {
        setActiveGameId(gameId);
    };

    const handleExitGame = () => {
        setActiveGameId(null);
    };

    // Game Component Resolver
    const renderGame = () => {
        switch (activeGameId) {
            case 'balloon-eater':
                return <BalloonEater />;
            case 'voxel-world':
                return <VoxelWorld />;
            case 'math-1d':
                return <Math1D />;
            case 'english-1d':
                return <English1D />;
            // Add more cases here (Snake, etc.)
            default:
                return <div className="text-white p-20 text-center font-black">BU OYUN HENÜZ GELİŞTİRİLME AŞAMASINDA... 🛠️</div>;
        }
    };

    return (
        <main className="w-full h-screen bg-black overflow-hidden font-sans">
            {!isLoggedIn ? (
                <LoginScreen onJoin={handleJoin} />
            ) : activeGameId ? (
                <GameContainer
                    title={GAME_REGISTRY[activeGameId]?.title || 'OYUN'}
                    onExit={handleExitGame}
                >
                    {renderGame()}
                </GameContainer>
            ) : (
                <PortalLobby
                    myName={myName}
                    onSelectGame={handleSelectGame}
                />
            )}
        </main>
    );
}
