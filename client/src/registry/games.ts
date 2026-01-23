export interface GameMetadata {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: '2D' | '3D' | 'Experimental';
    multiplayer: boolean;
}

export const GAME_REGISTRY: Record<string, GameMetadata> = {
    'balloon-eater': {
        id: 'balloon-eater',
        title: 'Balloon Eater 3D',
        description: 'Eat blocks and other spheres to become the biggest! Featuring gift boxes and bots.',
        thumbnail: '/thumbnails/balloon-eater.jpg',
        category: '3D',
        multiplayer: true
    },
    'multiplayer-snake': {
        id: 'multiplayer-snake',
        title: 'Snake Royale',
        description: 'Battle for apples in a crowded grid. Don\'t hit yourself or others!',
        thumbnail: '/thumbnails/snake.jpg',
        category: '2D',
        multiplayer: true
    },
    'voxel-world': {
        id: 'voxel-world',
        title: 'Voxel Adventure',
        description: 'Build and explore in a blocky 3D world. Minecraft-Lite experience.',
        thumbnail: '/thumbnails/voxel.jpg',
        category: '3D',
        multiplayer: true
    }
};
