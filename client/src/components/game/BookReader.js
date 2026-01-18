import React from 'react';
import { Html } from '@react-three/drei';

export default function BookReader({ book, onClose }) {
    if (!book) return null;

    return (
        <Html center zIndexRange={[100, 0]}>
            <div style={{
                width: '400px',
                height: '500px',
                backgroundColor: '#fff',
                backgroundImage: 'linear-gradient(to right, #f8f8f8 0%, #fff 10%, #fff 90%, #f8f8f8 100%)', // Book spine effect
                borderRadius: '10px 20px 20px 10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                padding: '40px',
                fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: '10px solid #8D6E63', // Leather cover look
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    borderBottom: '2px dashed #ccc',
                    paddingBottom: '10px'
                }}>
                    <h2 style={{ margin: 0, color: '#D84315', fontSize: '24px' }}>{book.title}</h2>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    fontSize: '18px',
                    lineHeight: '1.6',
                    color: '#333',
                    overflowY: 'auto',
                    textAlign: 'justify'
                }}>
                    {book.content}
                </div>

                {/* Footer / Close */}
                <div style={{
                    marginTop: '20px',
                    textAlign: 'center'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 30px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: 'white',
                            backgroundColor: '#4CAF50',
                            border: 'none',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        BİTİRDİM! ✅
                    </button>
                </div>

                {/* Decorative Corner */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    width: '0',
                    height: '0',
                    borderStyle: 'solid',
                    borderWidth: '0 50px 50px 0',
                    borderColor: 'transparent #E0E0E0 transparent transparent'
                }} />
            </div>
        </Html>
    );
}
