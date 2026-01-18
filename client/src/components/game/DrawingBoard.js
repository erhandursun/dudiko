import { useRef, useState, useEffect } from 'react';
import { useSocketStore } from '@/stores/socketStore';
import styles from './DrawingBoard.module.css';

export default function DrawingBoard({ onClose, targetPlacement }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(5);
    const socket = useSocketStore((state) => state.socket);
    const myName = useSocketStore((state) => state.myName);
    const publishArt = useSocketStore((state) => state.publishArt);

    // Get position safely? 
    // We'll trust the user places the art where they stand.

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const handlePublish = () => {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        // If targetPlacement exists, we are drawing on a wall
        if (targetPlacement) {
            publishArt(dataUrl, myName, targetPlacement.position, targetPlacement.rotation, targetPlacement.houseId);
        } else {
            // Default floor behavior (if triggered via global button)
            publishArt(dataUrl, myName);
        }
        alert('Resim yayınlandı! Etrafına bak. 🎨');
        onClose();
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000, pointerEvents: 'auto' }}>
            <div className={styles.overlay}>
                <div className={styles.board}>
                    <h3>Sihirli Tuval 🎨</h3>
                    <canvas
                        ref={canvasRef}
                        className={styles.canvas}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        // Touch support
                        onTouchStart={(e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const mouseEvent = new MouseEvent("mousedown", {
                                clientX: touch.clientX,
                                clientY: touch.clientY
                            });
                            startDrawing(mouseEvent);
                        }}
                        onTouchMove={(e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const mouseEvent = new MouseEvent("mousemove", {
                                clientX: touch.clientX,
                                clientY: touch.clientY
                            });
                            draw(mouseEvent);
                        }}
                        onTouchEnd={stopDrawing}
                    />

                    <div className={styles.controls}>
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                        <input type="range" min="1" max="20" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} />
                        <button onClick={handlePublish} className={styles.button}>Yayınla</button>
                        <button onClick={clearCanvas} className={styles.button} style={{ background: '#78909C' }}>Temizle</button>
                        <button onClick={onClose} className={styles.closeButton}>Kapat</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
