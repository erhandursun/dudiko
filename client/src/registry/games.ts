export interface GameMetadata {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: '2D' | '3D' | 'Experimental';
    multiplayer: boolean;
}

export const GAME_REGISTRY: Record<string, GameMetadata> = {
    'math-1d': {
        id: 'math-1d',
        title: 'Matematik Yarışı',
        description: '2, 3 ve 4 çarpım tablolarını öğren ve puan topla!',
        thumbnail: '/thumbnails/math-1d.jpg',
        category: '2D',
        multiplayer: false
    },
    'english-1d': {
        id: 'english-1d',
        title: 'Kelime Avı',
        description: 'İngilizce kelimelerin Türkçesini bul, puanları topla!',
        thumbnail: '/thumbnails/math-1d.jpg', // Using same thumbnail for now or placeholder
        category: '2D',
        multiplayer: false
    }
};
