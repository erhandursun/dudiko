const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, restrict this to your domain
        methods: ["GET", "POST"]
    }
});

const players = {};
const artworkCache = [];
const chatHistory = []; // Buffer for persistent chat
const houses = {}; // houseId: { ownerId, ownerName, color, rank }
const xoxGames = {}; // xoxId: { board, turn, players }

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    console.log('Total players:', Object.keys(players).length + 1);

    // Initial default state
    // Spawn outside the castle area (Castle is roughly -10 to 10)
    // Spawn in a ring between 15 and 25 units
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 10;
    const spawnX = Math.cos(angle) * radius;
    const spawnZ = Math.sin(angle) * radius;

    players[socket.id] = {
        position: [spawnX, 5, spawnZ],
        color: 'mediumpurple',
        isDriving: false,
        name: 'Player',
        characterType: 'child',
        mathPoints: 0,
        currentWorld: 'hub'
    };

    // Client sends their preferred initial state
    socket.on('init-player', ({ color, isDriving, name, characterType, customization }) => {
        console.log(`Player initialized: ${name} (${socket.id})`);
        if (players[socket.id]) {
            players[socket.id].color = color;
            players[socket.id].isDriving = isDriving;
            players[socket.id].name = name;
            players[socket.id].characterType = characterType || 'child';
            players[socket.id].customization = customization;
            players[socket.id].currentWorld = 'hub';
        }

        socket.broadcast.emit('player-joined', {
            id: socket.id,
            data: players[socket.id]
        });
    });

    socket.emit('current-players', players);

    // Note: We moved the initial 'player-joined' broadcast to inside 'init-player'
    // to ensure we have the color. But if client doesn't emit init-player quickly,
    // we might need a fallback. For now, this is fine as client emits on connect.

    socket.on('switch-world', (world) => {
        console.log(`Player ${socket.id} switching to world: ${world}`);
        if (players[socket.id]) {
            players[socket.id].currentWorld = world;
            io.emit('player-updated', {
                id: socket.id,
                currentWorld: world
            });
        }
    });

    socket.on('move', ({ position, rotation, world }) => {
        if (players[socket.id]) {
            players[socket.id].position = position;
            players[socket.id].rotation = rotation;
            players[socket.id].currentWorld = world || players[socket.id].currentWorld;

            socket.broadcast.emit('player-moved', {
                id: socket.id,
                position,
                rotation,
                world: players[socket.id].currentWorld
            });
        }
    });

    socket.on('change-color', (color) => {
        if (players[socket.id]) {
            players[socket.id].color = color;
            io.emit('player-color-changed', {
                id: socket.id,
                color
            });
        }
    });

    socket.on('change-vehicle', (isDriving) => {
        if (players[socket.id]) {
            players[socket.id].isDriving = isDriving;
            io.emit('player-vehicle-changed', {
                id: socket.id,
                isDriving
            });
        }
    });

    socket.on('update-character-type', (type) => {
        if (players[socket.id]) {
            players[socket.id].characterType = type;
            // Broadcast the specific update to avoid full re-sync overhead if possible
            // But reuse player-joined or create new event
            io.emit('player-updated', {
                id: socket.id,
                characterType: type
            });
        }
    });

    socket.on('emote', (emoji) => {
        io.emit('player-emote', {
            id: socket.id,
            emoji
        });
    });

    socket.on('chat', (message) => {
        if (players[socket.id]) {
            const chatData = {
                id: socket.id,
                message,
                name: players[socket.id].name,
                time: Date.now()
            };

            chatHistory.push(chatData);
            if (chatHistory.length > 50) chatHistory.shift();

            io.emit('player-chat', chatData);
        }
    });

    socket.on('update-pet', (petType) => {
        if (players[socket.id]) {
            players[socket.id].petType = petType;
            io.emit('player-pet-changed', {
                id: socket.id,
                petType
            });
        }
    });

    socket.on('math-solved', (points) => {
        if (players[socket.id]) {
            players[socket.id].mathPoints = (players[socket.id].mathPoints || 0) + points;

            // Broadcast the top 10 leaderboard
            const leaderboard = Object.values(players)
                .map(p => ({ name: p.name, score: p.mathPoints }))
                .filter(p => p.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            io.emit('leaderboard-update', leaderboard);

            // Global Notification: "Elif bildi!"
            io.emit('math-solved-notification', {
                name: players[socket.id].name,
                points
            });
        }
    });

    socket.on('xox-move', ({ boardId, index, playerSymbol }) => {
        // Simple relay for move sync
        socket.broadcast.emit('xox-update', { boardId, index, playerSymbol });
    });

    // --- VOICE CHAT SIGNALING ---
    socket.on('voice-join', () => {
        // Notify others that this user is ready to call
        socket.broadcast.emit('voice-user-joined', socket.id);
    });

    socket.on('voice-signal', ({ targetId, signal }) => {
        io.to(targetId).emit('voice-signal', {
            senderId: socket.id,
            signal
        });
    });

    // --- ART SYSTEM ---

    // --- HOUSE SYSTEM ---
    const HOUSE_PRICE = 500; // Match client initial price

    socket.on('buy-house', (houseId) => {
        if (players[socket.id] && !houses[houseId]) {
            houses[houseId] = {
                ownerId: socket.id,
                ownerName: players[socket.id].name,
                color: 'hotpink',
                rank: 1
            };
            io.emit('house-bought', {
                houseId,
                ownerId: socket.id,
                ownerName: players[socket.id].name,
                color: 'hotpink',
                rank: 1
            });
        }
    });

    socket.on('upgrade-house', (houseId) => {
        if (houses[houseId] && houses[houseId].ownerId === socket.id) {
            if (houses[houseId].rank < 30) {
                houses[houseId].rank += 1;
                io.emit('house-upgraded', {
                    houseId,
                    rank: houses[houseId].rank
                });
            }
        }
    });

    socket.on('change-house-color', ({ houseId, color }) => {
        if (houses[houseId] && houses[houseId].ownerId === socket.id) {
            houses[houseId].color = color;
            io.emit('house-color-changed', {
                houseId,
                color
            });
        }
    });

    // Send existing houses to new player
    socket.emit('load-houses', houses);

    socket.on('publish-art', ({ image, artist, position, rotation, houseId }) => {
        if (players[socket.id]) {
            const playerPos = players[socket.id].position;
            // Use provided position/rotation (for walls) or spawn in front of player (for ground)
            const artPos = position || [playerPos[0], playerPos[1], playerPos[2] + 2];
            const artRot = rotation || [0, 0, 0];

            const newArt = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                image,
                artist,
                position: artPos,
                rotation: artRot,
                houseId
            };
            artworkCache.push(newArt);
            if (artworkCache.length > 50) artworkCache.shift(); // Increased limit

            io.emit('new-art', newArt);
        }
    });

    socket.on('delete-art', (artId) => {
        const index = artworkCache.findIndex(a => a.id === artId);
        if (index !== -1) {
            artworkCache.splice(index, 1);
            io.emit('load-art', artworkCache); // Full refresh for simplicity
        }
    });

    // Send existing art to new player
    socket.emit('load-art', artworkCache);

    // Send chat history to new player
    socket.emit('load-chat', chatHistory);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove houses owned by this player
        let anyDeleted = false;
        Object.keys(houses).forEach(houseId => {
            if (houses[houseId].ownerId === socket.id) {
                delete houses[houseId];
                anyDeleted = true;
            }
        });
        if (anyDeleted) {
            io.emit('load-houses', houses);
        }

        delete players[socket.id];
        io.emit('player-left', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
