import React from 'react';
import { useSocketStore } from '@/stores/socketStore';

const PETS = [
    { type: 'cat', name: 'Miyav', price: 100, emoji: '🐱' },
    { type: 'dog', name: 'Havhav', price: 150, emoji: '🐶' },
    { type: 'dino', name: 'Rex', price: 500, emoji: '🦖' },
    { type: 'fairy', name: 'Lila', price: 300, emoji: '🧚‍♀️' },
];

export default function PetStore({ onClose }) {
    const coins = useSocketStore((state) => state.coins);
    const buyPet = useSocketStore((state) => state.buyPet);
    const petType = useSocketStore((state) => state.petType);

    return (
        <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '25px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)', zIndex: 1000, textAlign: 'center',
            minWidth: '300px', border: '5px solid #FFD54F', backdropFilter: 'blur(10px)',
            pointerEvents: 'auto'
        }}>
            <h2 style={{ margin: '0 0 10px', color: '#FF6F00' }}>🐾 Evcil Hayvan Dükkanı</h2>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>Altınların: {coins} 💰</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
                {PETS.map((pet) => (
                    <div key={pet.type} style={{
                        padding: '15px', border: petType === pet.type ? '3px solid #4CAF50' : '1px solid #ddd',
                        borderRadius: '15px', background: 'white', position: 'relative'
                    }}>
                        <div style={{ fontSize: '40px' }}>{pet.emoji}</div>
                        <div style={{ fontWeight: 'bold' }}>{pet.name}</div>
                        <div style={{ color: '#FF8F00', fontWeight: 'bold' }}>{pet.price} 💰</div>
                        <button
                            onClick={() => buyPet(pet.type, pet.price)}
                            disabled={coins < pet.price || petType === pet.type}
                            style={{
                                marginTop: '10px', padding: '5px 15px', borderRadius: '10px',
                                border: 'none', background: petType === pet.type ? '#4CAF50' : (coins >= pet.price ? '#FFB74D' : '#ccc'),
                                color: 'white', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            {petType === pet.type ? 'Sahipsin' : 'Satın Al'}
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={onClose}
                style={{
                    marginTop: '25px', padding: '10px 30px', borderRadius: '15px',
                    border: 'none', background: '#EF5350', color: 'white',
                    fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                }}
            >
                Kapat
            </button>
        </div>
    );
}
