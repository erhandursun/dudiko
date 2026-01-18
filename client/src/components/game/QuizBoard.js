import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useSocketStore } from '@/stores/socketStore';

export default function QuizBoard({ lastReadBook, onSolve, onClose }) {
    const reportMathSolved = useSocketStore((state) => state.reportMathSolved); // Reusing coin gaining method
    const [status, setStatus] = useState('idle'); // idle, correct, wrong

    if (!lastReadBook) {
        return (
            <Html center>
                <div style={{
                    background: '#3E2723',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    border: '4px solid #8D6E63',
                    textAlign: 'center',
                    fontFamily: 'sans-serif',
                    width: '300px'
                }}>
                    <h3>📖 Kitap Kafe Sınavı</h3>
                    <p style={{ fontSize: '18px' }}>Önce bir kitap okumalısın! Raftan bir kitap seç ve oku.</p>
                    <button onClick={onClose} style={btnStyle}>Tamam</button>
                </div>
            </Html>
        );
    }

    const handleAnswer = (option) => {
        if (option === lastReadBook.quiz.answer) {
            setStatus('correct');
            reportMathSolved(50); // Win 50 coins
            if (onSolve) onSolve();
            setTimeout(onClose, 2000);
        } else {
            setStatus('wrong');
            setTimeout(() => setStatus('idle'), 1500);
        }
    };

    return (
        <Html center>
            <div style={{
                background: '#3E2723', // Blackboard color
                color: 'white',
                padding: '25px',
                borderRadius: '15px',
                border: '5px solid #8D6E63', // Wood frame
                width: '350px',
                textAlign: 'center',
                fontFamily: "'Comic Sans MS', sans-serif",
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <h3 style={{ color: '#FFD54F', margin: '0 0 15px 0' }}>❓ Soru Zamanı</h3>

                <div style={{ fontSize: '14px', color: '#ccc', marginBottom: '10px' }}>
                    Kitap: {lastReadBook.title}
                </div>

                <div style={{ fontSize: '20px', marginBottom: '20px', fontWeight: 'bold' }}>
                    {lastReadBook.quiz.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {lastReadBook.quiz.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleAnswer(opt)}
                            style={{
                                padding: '12px',
                                fontSize: '18px',
                                background: '#5D4037',
                                color: 'white',
                                border: '2px solid #8D6E63',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.background = '#6D4C41'}
                            onMouseOut={(e) => e.target.style.background = '#5D4037'}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {status === 'correct' && (
                    <div style={{ marginTop: '15px', color: '#66BB6A', fontSize: '22px', fontWeight: 'bold' }}>
                        DOĞRU! 🎉 +50 Altın
                    </div>
                )}

                {status === 'wrong' && (
                    <div style={{ marginTop: '15px', color: '#EF5350', fontSize: '22px', fontWeight: 'bold' }}>
                        YANLIŞ, TEKRAR DENE! ❌
                    </div>
                )}

                <button onClick={onClose} style={{
                    marginTop: '20px',
                    background: 'none',
                    border: 'none',
                    color: '#AAA',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                }}>
                    Kapat
                </button>
            </div>
        </Html>
    );
}

const btnStyle = {
    marginTop: '15px',
    padding: '8px 16px',
    background: '#8D6E63',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
};
