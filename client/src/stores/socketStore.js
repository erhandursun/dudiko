import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useSocketStore = create((set, get) => ({
    socket: null,
    playerId: null,
    players: {},
    isDriving: false,
    isDancing: false,
    flightUnlocked: true,
    artworks: [],
    myColor: 'hotpink',
    myName: 'Prenses v3.1',
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
    disguiseProp: null, // 'tree', 'lamp', 'trash'
    notifications: [], // { id, message, type }
    joystickData: { x: 0, y: 0, jump: false, action: false, aim: false },

    setJoystickData: (data) => set((state) => ({
        joystickData: typeof data === 'function' ? data(state.joystickData) : { ...state.joystickData, ...data }
    })),

    setSocket: (socket) => set({ socket }),

    setPlayerId: (id) => set({ playerId: id }),

    unlockFlight: () => {
        set({ flightUnlocked: true });
        // Notify server? Or just keep local for now.
        // Better to keep local for simplicity, maybe broadcast "Wings Effect" later.
    },

    initSocket: () => {
        const { socket } = get();
        if (socket) return; // Already connected

        // Use Environment Variable for Production (Render), fallback to local logic
        const url = process.env.NEXT_PUBLIC_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:3001`;

        console.log(`Connecting to Socket server at: ${url}`);
        const newSocket = io(url);

        set({ socket: newSocket });

        newSocket.on('connect', () => {
            console.log('Connected to server with ID:', newSocket.id);
            set({ playerId: newSocket.id });

            // RECONNECTION LOGIC:
            // If we already have a name/color (meaning we were playing), re-sync with server.
            const { myName, myColor, characterType, customization, isDriving, currentWorld } = get();

            // We assume if myName is not the default 'Prenses' or we have joined, we should sync.
            // A flag 'hasJoined' would be better, but checking name/world is a decent proxy.
            if (myName && currentWorld) {
                console.log('Re-syncing player state after connection...', { myName, currentWorld });

                newSocket.emit('init-player', {
                    name: myName,
                    color: myColor,
                    characterType,
                    customization,
                    isDriving
                });

                newSocket.emit('switch-world', currentWorld);
            }
        });

        // Listeners are now attached via useEffect in components or here if global
        // We attach global listeners here reused from before...
        const attachListeners = (s) => {
            s.on('disconnect', () => {
                console.log('Disconnected from server');
                set({ socket: null, playerId: null });
            });

            s.on('current-players', (players) => {
                set({ players });
            });

            s.on('player-joined', ({ id, data }) => {
                set((state) => ({
                    players: { ...state.players, [id]: data }
                }));
            });

            s.on('player-updated', ({ id, ...updatedData }) => {
                set((state) => {
                    const players = { ...state.players };
                    if (players[id]) {
                        players[id] = { ...players[id], ...updatedData };
                    }
                    return { players };
                });
            });

            s.on('player-moved', ({ id, position, rotation, world }) => {
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

            s.on('player-color-changed', ({ id, color }) => {
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

            s.on('player-vehicle-changed', ({ id, isDriving }) => {
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

            s.on('player-dance-changed', ({ id, isDancing }) => {
                set((state) => {
                    if (!state.players[id]) return state;
                    return {
                        players: {
                            ...state.players,
                            [id]: { ...state.players[id], isDancing }
                        }
                    };
                });
            });

            s.on('player-disguised', ({ id, propType }) => {
                set((state) => {
                    if (!state.players[id]) return state;
                    return {
                        players: {
                            ...state.players,
                            [id]: { ...state.players[id], disguiseProp: propType }
                        }
                    };
                });
            });

            s.on('leaderboard-update', (leaderboard) => {
                set({ leaderboard });
            });

            s.on('math-solved-notification', ({ name, points }) => {
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

            s.on('xox-update', ({ boardId, index, playerSymbol }) => {
                set((state) => {
                    const newBoards = { ...state.xoxBoards };
                    if (!newBoards[boardId]) newBoards[boardId] = Array(9).fill(null);
                    newBoards[boardId][index] = playerSymbol;
                    return { xoxBoards: newBoards };
                });
            });

            s.on('player-shoot', ({ position, direction }) => {
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

            s.on('player-chat', ({ id, message }) => {
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

            s.on('player-left', (id) => {
                set((state) => {
                    const newPlayers = { ...state.players };
                    delete newPlayers[id];
                    return { players: newPlayers };
                });
            });

            s.on('new-art', (art) => {
                set((state) => ({ artworks: [...state.artworks, art] }));
            });

            s.on('load-art', (allArt) => {
                set({ artworks: allArt });
            });

            s.on('load-houses', (houses) => {
                set({ houses });
            });

            s.on('house-bought', ({ houseId, ownerId, ownerName, color, rank }) => {
                set((state) => ({
                    houses: { ...state.houses, [houseId]: { ownerId, ownerName, color, rank: rank || 1 } }
                }));
            });

            s.on('house-upgraded', ({ houseId, rank }) => {
                set((state) => {
                    const houses = { ...state.houses };
                    if (houses[houseId]) {
                        houses[houseId] = { ...houses[houseId], rank };
                    }
                    return { houses };
                });
            });

            s.on('house-color-changed', ({ houseId, color }) => {
                set((state) => {
                    const houses = { ...state.houses };
                    if (houses[houseId]) {
                        houses[houseId] = { ...houses[houseId], color };
                    }
                    return { houses };
                });
            });
            // ... (other listeners will be re-attached here implicitly by nature of socket.on being cumulative if not cleared, but let's be clean)
            // For now, to minimize diff size, we assuming listeners from the original connect are moved here or kept.
            // IMPORTANT: The original code had listener attachment inside connect. We need to move them all to initSocket or a helper.
        };
        attachListeners(newSocket);
    },

    joinGame: (name, color, characterType, customization) => {
        const { socket } = get();
        if (!socket) {
            console.error("Socket not initialized!");
            return;
        }

        set({
            myName: name,
            myColor: color,
            characterType: characterType || 'child',
            customization: customization || get().customization,
            currentWorld: 'hub'
        });

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
    },

    // Legacy connect for backward compatibility if needed, but we will update page.js
    connect: (name, color, characterType, customization) => {
        const { initSocket, joinGame } = get();
        initSocket();
        // Wait for connection? joinGame expects socket.
        // In new flow, initSocket calls immediately, joinGame calls later.
        // For now, this function is vestigial or we can redirect to joinGame logic assuming socket is ready.
        // But better to use the new flow in page.js
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

    toggleDance: () => {
        const { socket, isDancing } = get();
        const newStatus = !isDancing;
        set({ isDancing: newStatus });
        if (socket) {
            socket.emit('change-dance', newStatus);
        }
    },

    buyPet: (type, price) => {
        const { coins } = get();
        if (coins >= price) {
            set({ coins: coins - price, petType: type });
            return true;
        }
        return false;
    },

    makeXOXMove: (boardId, index, playerSymbol) => {
        const { socket } = get();
        if (socket) {
            socket.emit('xox-move', { boardId, index, playerSymbol });
        }
    },

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

    movePlayer: (position, rotation) => {
        // ... (existing move logic might be here or implicitly handled by updateMyPosition)
    },

    setDisguise: (propType) => { // 'tree', 'lamp', 'trash', or null
        const { socket } = get();
        set({ disguiseProp: propType });
        if (socket) {
            socket.emit('set-disguise', propType);
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
    },

    sendChatMessage: (message) => {
        const { socket } = get();
        if (socket && message.trim()) {
            socket.emit('chat', message.trim());
        }
    }
}));
