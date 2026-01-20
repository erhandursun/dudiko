'use client';

import { useEffect, useRef, useState } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Configuration for STUN servers (needed for WebRTC over Internet/LAN)
const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

export default function VoiceChat({ myPosRef }) {
    const [isMuted, setIsMuted] = useState(false);
    const [joined, setJoined] = useState(false);
    const localStreamRef = useRef();
    const peersRef = useRef({}); // { [playerId]: RTCPeerConnection }
    const socket = useSocketStore((state) => state.socket);
    const players = useSocketStore((state) => state.players);
    const playerId = useSocketStore((state) => state.playerId);

    // Audio elements storage to adjust volume
    const remoteAudioRefs = useRef({});

    // --- 1. INITIALIZE & GET MIC ---
    const joinVoice = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            setJoined(true);

            // Toggle mute initial state
            stream.getAudioTracks()[0].enabled = !isMuted;

            // Notify server we are ready to voice chat
            socket.emit('voice-join');

        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Mikrofona erişilemedi! (HTTPS veya Localhost gerekli olabilir)");
        }
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const enabled = !isMuted;
            localStreamRef.current.getAudioTracks()[0].enabled = enabled; // Note: false means muted
            setIsMuted(!enabled); // State logic is inverted (Muted vs Enabled)
        }
    };

    // --- 2. WEBRTC SIGNALING HANDLERS ---
    useEffect(() => {
        if (!socket || !joined) return;

        // When a user joins, create an Offer
        socket.on('voice-user-joined', async (targetId) => {
            if (targetId === playerId) return;
            console.log('Initiating call to:', targetId);
            const peer = createPeer(targetId);
            peersRef.current[targetId] = peer;

            // Add local stream
            localStreamRef.current.getTracks().forEach(track => peer.addTrack(track, localStreamRef.current));

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socket.emit('voice-signal', { targetId, signal: { type: 'offer', sdp: offer } });
        });

        // Handle incoming signals (Offer, Answer, Candidate)
        socket.on('voice-signal', async ({ senderId, signal }) => {
            if (!peersRef.current[senderId]) {
                const peer = createPeer(senderId);
                peersRef.current[senderId] = peer;
                // Since we received an offer, we must be the callee, add our stream
                localStreamRef.current.getTracks().forEach(track => peer.addTrack(track, localStreamRef.current));
            }
            const peer = peersRef.current[senderId];

            if (signal.type === 'offer') {
                await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit('voice-signal', { targetId: senderId, signal: { type: 'answer', sdp: answer } });
            } else if (signal.type === 'answer') {
                await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            } else if (signal.candidate) {
                await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        });

        socket.on('player-left', (id) => {
            if (peersRef.current[id]) {
                peersRef.current[id].close();
                delete peersRef.current[id];
            }
            if (remoteAudioRefs.current[id]) {
                remoteAudioRefs.current[id].remove();
                delete remoteAudioRefs.current[id];
            }
        });

        return () => {
            socket.off('voice-user-joined');
            socket.off('voice-signal');
            socket.off('player-left');
        };
    }, [socket, joined, playerId]);


    const createPeer = (targetId) => {
        const peer = new RTCPeerConnection(RTC_CONFIG);

        peer.onicecandidate = (e) => {
            if (e.candidate) {
                socket.emit('voice-signal', { targetId, signal: { candidate: e.candidate } });
            }
        };

        peer.ontrack = (e) => {
            // Create audio element
            console.log('Received remote stream from:', targetId);
            let audio = remoteAudioRefs.current[targetId];
            if (!audio) {
                audio = document.createElement('audio');
                audio.autoplay = true;
                document.body.appendChild(audio);
                remoteAudioRefs.current[targetId] = audio;
            }
            audio.srcObject = e.streams[0];
        };

        return peer;
    };

    // --- 3. SPATIAL AUDIO UPDATE ---
    useFrame(() => {
        if (!myPosRef.current) return;
        const myPos = myPosRef.current.translation();

        Object.keys(players).forEach(id => {
            if (id === playerId) return;

            const player = players[id];
            const audio = remoteAudioRefs.current[id];

            if (player && audio) {
                // Calculate distance
                const dist = Math.sqrt(
                    Math.pow(player.position[0] - myPos.x, 2) +
                    Math.pow(player.position[1] - myPos.y, 2) +
                    Math.pow(player.position[2] - myPos.z, 2)
                );

                // Simple linear falloff
                // Max volume at 2 units, 0 volume at 30 units
                let vol = 1 - (dist - 2) / 28;
                vol = Math.max(0, Math.min(1, vol));

                audio.volume = vol;
            }
        });
    });

    return (
        <Html fullscreen style={{ pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 100, right: 20, pointerEvents: 'auto' }}>
                {!joined ? (
                    <button
                        onClick={joinVoice}
                        style={{
                            background: '#4CAF50', border: 'none', padding: '10px 20px',
                            borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                        }}
                    >
                        🎤 Sesi Aç
                    </button>
                ) : (
                    <button
                        onClick={toggleMute}
                        style={{
                            background: isMuted ? '#EF5350' : '#4CAF50', border: 'none', padding: '10px 20px',
                            borderRadius: '20px', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                        }}
                    >
                        {isMuted ? '🔇 Ses Kapalı' : '🎙️ Konuşuyorsun'}
                    </button>
                )}
            </div>
        </Html>
    );
}
