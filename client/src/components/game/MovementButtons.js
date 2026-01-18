'use client';
import React, { useState } from 'react';

/**
 * On-screen D-Pad for movement.
 * Emits active directional state to parent.
 */
export default function MovementButtons({ onMove }) {
    const [active, setActive] = useState({
        forward: false,
        backward: false,
        left: false,
        right: false
    });

    const updateMove = (dir, val) => {
        const next = { ...active, [dir]: val };
        setActive(next);
        if (onMove) onMove(next);
    };

    // Prevent context menu on long press (mobile)
    const handleContextMenu = (e) => e.preventDefault();

    const containerStyle = {
        position: 'fixed',
        bottom: '15px',
        left: '15px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        pointerEvents: 'auto',
        zIndex: 1000
    };

    const buttonSize = 42;
    const baseButtonStyle = {
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: 'white',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        transition: 'all 0.1s',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        WebkitTapHighlightColor: 'transparent'
    };

    const btnStyle = (dir) => ({
        ...baseButtonStyle,
        backgroundColor: active[dir] ? '#FF4081' : baseButtonStyle.background,
        color: active[dir] ? 'white' : baseButtonStyle.color,
        transform: active[dir] ? 'scale(0.9)' : 'scale(1)'
    });

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 50px)',
                gridTemplateRows: 'repeat(2, 50px)',
                gap: '10px',
                pointerEvents: 'auto'
            }}
            onContextMenu={handleContextMenu}
        >
            {/* Top Row */}
            <div />
            <div
                onPointerDown={() => updateMove('forward', true)}
                onPointerUp={() => updateMove('forward', false)}
                onPointerLeave={() => updateMove('forward', false)}
                style={btnStyle('forward')}
            >
                ⬆️
            </div>
            <div />

            {/* Bottom Row */}
            <div
                onPointerDown={() => updateMove('left', true)}
                onPointerUp={() => updateMove('left', false)}
                onPointerLeave={() => updateMove('left', false)}
                style={btnStyle('left')}
            >
                ⬅️
            </div>
            <div
                onPointerDown={() => updateMove('backward', true)}
                onPointerUp={() => updateMove('backward', false)}
                onPointerLeave={() => updateMove('backward', false)}
                style={btnStyle('backward')}
            >
                ⬇️
            </div>
            <div
                onPointerDown={() => updateMove('right', true)}
                onPointerUp={() => updateMove('right', false)}
                onPointerLeave={() => updateMove('right', false)}
                style={btnStyle('right')}
            >
                ➡️
            </div>
        </div>
    );
}
