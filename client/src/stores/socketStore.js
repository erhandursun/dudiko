import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useSocketStore = create((set, get) => ({
    socket: null,
    playerId: null,
    players: {},
    isDriving: false,
    flightUnlocked: true,
    artworks: [],
    myColor: 'hotpink',
    myName: 'Prenses',
    characterType: 'child',
    coins: 10000,
    mathPoints: 0,
    leaderboard: [],
    xoxBoards: {}, // { id: boardArray }
    petType: null,
    houses: {},
    hasWeapon: false,
    projectiles: [], // { id, position: [x,y,z], direction: [x,y,z], timestamp }
    customization: { hairStyle: 'classic', hairColor: '#3E2723', faceType: 'happy' },
    currentWorld: 'hub', // hub, town, school
    notifications: [], // { id, message, type }

    setSocket: (socket) => set({ socket }),

    setPlayerId: (id) => set({ playerId: id }),

    unlockFlight: () => {
        set({ flightUnlocked: true });
        // Notify server? Or just keep local for now.
        // Better to keep local for simplicity, maybe broadcast "Wings Effect" later.
    },

    connect: (name, color, characterType, customization) => {
        // Determine the socket URL dynamically to allow LAN play
        // If we are on localhost, use localhost. If on a network IP, use that IP.
        // Use Environment Variable for Production (Render), fallback to local logic
        const url = process.env.NEXT_PUBLIC_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:3001`;

        console.log(`Connecting to Socket server at: ${url}`);
        const socket = io(url);

        set({ socket, currentWorld: 'hub' });

        socket.on('connect', () => {
            console.log('Connected to server with ID:', socket.id);
            // We set name/color from args immediately if provided
            if (name) set({
                myName: name,
                myColor: color,
                characterType: characterType || 'child',
                customization: customization || get().customization
            });

            set({ socket, playerId: socket.id });

            // Initialize local player entry in players object
            set((state) => ({
                players: {
                    ...state.players,
                    [socket.id]: {
                        name: name || state.myName,
                        color: color || state.myColor,
                        characterType: characterType || state.characterType,
                        customization: customization || state.customization,
                        position: [0, 5, 0],
                        isDriving: false,
                        currentWorld: 'hub'
                    }
                }
            }));

            // Send initial state
            const { isDriving } = get();
            socket.emit('init-player', {
                name: name || get().myName,
                color: color || get().myColor,
                characterType: characterType || get().characterType,
                customization: customization || get().customization,
                isDriving
            });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            set({ socket: null, playerId: null });
        });

        socket.on('current-players', (players) => {
            set({ players });
        });

        socket.on('player-joined', ({ id, data }) => {
            set((state) => ({
                players: { ...state.players, [id]: data }
            }));
        });

        socket.on('player-updated', ({ id, ...updatedData }) => {
            set((state) => {
                const players = { ...state.players };
                if (players[id]) {
                    players[id] = { ...players[id], ...updatedData };
                }
                return { players };
            });
        });

        socket.on('player-moved', ({ id, position, rotation, world }) => {
            set((state) => {
                const currentData = state.players[id] || { name: 'Gezgin', color: 'gray', characterType: 'child' };
                return {
                    players: {
                        ...state.players,
                        [id]: { ...currentData, position, rotation, currentWorld: world || currentData.currentWorld }
                    }
                };
            });
        });

        socket.on('player-color-changed', ({ id, color }) => {
            set((state) => {
                if (!state.players[id]) return state;
                return {
                    players: {
                        ...state.players,
                        [id]: { ...state.players[id], color }
                    }
                };
            });
        });

        socket.on('player-vehicle-changed', ({ id, isDriving }) => {
            set((state) => {
                if (!state.players[id]) return state;
                return {
                    players: {
                        ...state.players,
                        [id]: { ...state.players[id], isDriving }
                    }
                };
            });
        });

        socket.on('leaderboard-update', (leaderboard) => {
            set({ leaderboard });
        });

        socket.on('math-solved-notification', ({ name, points }) => {
            console.log('=== MATH NOTIFICATION RECEIVED ===', name, points);
            const id = Date.now() + Math.random();
            const message = `${name} bildi! ✨ (+${points} Puan)`;

            set((state) => ({
                notifications: [{ id, message, type: 'math' }, ...state.notifications].slice(0, 5)
            }));

            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter(n => n.id !== id)
                }));
            }, 6000);
        });

        socket.on('xox-update', ({ boardId, index, playerSymbol }) => {
            set((state) => {
                const newBoards = { ...state.xoxBoards };
                if (!newBoards[boardId]) newBoards[boardId] = Array(9).fill(null);
                newBoards[boardId][index] = playerSymbol;
                return { xoxBoards: newBoards };
            });
        });

        socket.on('player-shoot', ({ position, direction }) => {
            const id = Math.random().toString(36).substr(2, 9);
            set((state) => ({
                projectiles: [...state.projectiles, { id, position, direction, timestamp: Date.now() }]
            }));
            // Auto-remove
            setTimeout(() => {
                set((state) => ({
                    projectiles: state.projectiles.filter(p => p.id !== id)
                }));
            }, 2000);
        });

        // REMOVED: Emote and Pet listeners for memory optimization (Purged Features)

        socket.on('player-chat', ({ id, message }) => {
            set((state) => {
                if (!state.players[id]) return state;
                return {
                    players: {
                        ...state.players,
                        [id]: { ...state.players[id], chatMessage: { text: message, time: Date.now() } }
                    }
                };
            });
        });

        socket.on('player-left', (id) => {
            set((state) => {
                const newPlayers = { ...state.players };
                delete newPlayers[id];
                return { players: newPlayers };
            });
        });

        socket.on('new-art', (art) => {
            set((state) => ({ artworks: [...state.artworks, art] }));
        });

        socket.on('load-art', (allArt) => {
            set({ artworks: allArt });
        });

        socket.on('load-houses', (houses) => {
            set({ houses });
        });

        socket.on('house-bought', ({ houseId, ownerId, ownerName, color, rank }) => {
            set((state) => ({
                houses: { ...state.houses, [houseId]: { ownerId, ownerName, color, rank: rank || 1 } }
            }));
        });

        socket.on('house-upgraded', ({ houseId, rank }) => {
            set((state) => {
                const houses = { ...state.houses };
                if (houses[houseId]) {
                    houses[houseId] = { ...houses[houseId], rank };
                }
                return { houses };
            });
        });

        socket.on('house-color-changed', ({ houseId, color }) => {
            set((state) => {
                const houses = { ...state.houses };
                if (houses[houseId]) {
                    houses[houseId] = { ...houses[houseId], color };
                }
                return { houses };
            });
        });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    setWorld: (world) => {
        set({ currentWorld: world });
        // Notify server if connected
        const { socket } = get();
        if (socket) {
            socket.emit('switch-world', world);
        }
    },

    updateMyPosition: (position, rotation) => {
        const { socket, playerId } = get();

        // Update local state so I appear on my own map
        if (playerId) {
            set((state) => ({
                players: {
                    ...state.players,
                    [playerId]: { ...state.players[playerId], position, rotation }
                }
            }));
        }

        if (socket) {
            const { currentWorld } = get();
            socket.emit('move', { position, rotation, world: currentWorld });
        }
    },

    updateMyColor: (color) => {
        const { socket } = get();
        set({ myColor: color });
        if (socket) {
            socket.emit('change-color', color);
        }
    },

    setCharacterType: (type) => {
        set({ characterType: type });
        const { socket } = get();
        if (socket) {
            socket.emit('update-character-type', type);
        }
    },

    publishArt: (image, artist, position, rotation, houseId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('publish-art', { image, artist, position, rotation, houseId });
        }
    },

    deleteArt: (artId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('delete-art', artId);
        }
    },

    equipWeapon: () => set({ hasWeapon: true }),

    shoot: (position, direction) => {
        const { socket, projectiles } = get();
        const id = Math.random().toString(36).substr(2, 9);
        const newProj = { id, position, direction, timestamp: Date.now() };

        // Add locally
        set({ projectiles: [...projectiles, newProj] });

        // Broadcast
        if (socket) {
            socket.emit('player-shoot', { position, direction });
        }

        // Auto-remove after 2s
        setTimeout(() => {
            set((state) => ({
                projectiles: state.projectiles.filter(p => p.id !== id)
            }));
        }, 2000);
    },

    toggleDriving: () => {
        const { socket, isDriving } = get();
        const newStatus = !isDriving;
        set({ isDriving: newStatus });
        if (socket) {
            socket.emit('change-vehicle', newStatus);
        }
    },

    // REMOVED: buyPet (Purged Feature)

    reportMathSolved: (points) => {
        const { socket } = get();
        set((state) => ({
            mathPoints: state.mathPoints + points,
            coins: state.coins + points
        }));
        if (socket) {
            socket.emit('math-solved', points);
        }
    },

    makeXOXMove: (boardId, index, symbol) => {
        const { socket } = get();
        set((state) => {
            const newBoards = { ...state.xoxBoards };
            if (!newBoards[boardId]) newBoards[boardId] = Array(9).fill(null);
            newBoards[boardId][index] = symbol;
            return { xoxBoards: newBoards };
        });
        if (socket) {
            socket.emit('xox-move', { boardId, index, playerSymbol: symbol });
        }
    },

    buyHouse: (houseId, price) => {
        const { coins, socket, houses } = get();
        if (coins >= price && !houses[houseId]) {
            set({ coins: coins - price });
            if (socket) {
                socket.emit('buy-house', houseId);
            }
            return true;
        }
        return false;
    },

    upgradeHouse: (houseId, price) => {
        const { coins, socket, houses } = get();
        if (houses[houseId] && coins >= price) {
            set({ coins: coins - price });
            if (socket) {
                socket.emit('upgrade-house', houseId);
            }
            return true;
        }
        return false;
    },

    changeHouseColor: (houseId, color) => {
        const { socket, houses } = get();
        if (houses[houseId]) {
            if (socket) {
                socket.emit('change-house-color', { houseId, color });
            }
        }
    }
}));
