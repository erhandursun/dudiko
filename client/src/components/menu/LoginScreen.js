'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import CharacterModel from '../game/CharacterModel';
import styles from './LoginScreen.module.css';

export default function LoginScreen({ onJoin }) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('hotpink');
    const [characterType, setCharacterType] = useState('child');
    const [hairStyle, setHairStyle] = useState('classic');
    const [hairColor, setHairColor] = useState('#3E2723');
    const [faceType, setFaceType] = useState('happy');
    const [activeTab, setActiveTab] = useState('identity'); // identity, style, face
    const [ornaments, setOrnaments] = useState([]);

    useEffect(() => {
        const savedName = localStorage.getItem('webtown_name');
        const savedColor = localStorage.getItem('webtown_color');
        const savedType = localStorage.getItem('webtown_type');
        const savedHairStyle = localStorage.getItem('webtown_hairStyle');
        const savedHairColor = localStorage.getItem('webtown_hairColor');
        const savedFaceType = localStorage.getItem('webtown_faceType');

        if (savedName) setName(savedName);
        else {
            const randomNum = Math.floor(Math.random() * 100) + 1;
            setName(`Prenses ${randomNum}`);
        }

        if (savedColor) setColor(savedColor);
        if (savedType) setCharacterType(savedType);
        if (savedHairStyle) setHairStyle(savedHairStyle);
        if (savedHairColor) setHairColor(savedHairColor);
        if (savedFaceType) setFaceType(savedFaceType);

        const newOrnaments = [...Array(6)].map((_, i) => ({
            left: `${Math.random() * 90}%`,
            top: `${Math.random() * 90}%`,
            delay: `${i * 1.5}s`
        }));
        setOrnaments(newOrnaments);
    }, []);

    const CHAR_TYPES = [
        { id: 'child', label: 'Çocuk 👧' },
        { id: 'mother', label: 'Anne 👩' },
        { id: 'father', label: 'Baba 👨' },
        { id: 'baby', label: 'Bebek 👶' },
        { id: 'cat', label: 'Kedi 🐈' },
        { id: 'dog', label: 'Köpek 🐕' },
        { id: 'car', label: 'Araba 🚗' },
    ];

    const COLORS = [
        { name: 'Pembe', value: 'hotpink' },
        { name: 'Mor', value: 'mediumpurple' },
        { name: 'Deniz', value: '#448AFF' },
        { name: 'Güneş', value: '#FFEB3B' },
        { name: 'Doğa', value: '#66BB6A' },
        { name: 'Siyah', value: '#212121' },
    ];

    const HAIR_STYLES = [
        { id: 'classic', label: 'Topuz' },
        { id: 'bob', label: 'Bob' },
        { id: 'long', label: 'Uzun' },
        { id: 'spiky', label: 'Dikik' },
        { id: 'short', label: 'Kısa' },
    ];

    const HAIR_COLORS = [
        { name: 'Kahve', value: '#3E2723' },
        { name: 'Siyah', value: '#212121' },
        { name: 'Sarı', value: '#FBC02D' },
        { name: 'Kızıl', value: '#D84315' },
        { name: 'Mavi', value: '#0288D1' },
    ];

    const FACE_TYPES = [
        { id: 'happy', label: 'Mutlu 😊' },
        { id: 'cute', label: 'Tontiş 😊' },
        { id: 'cool', label: 'Havalı 😎' },
    ];

    const handleJoin = (e) => {
        e.preventDefault();
        if (name.trim()) {
            localStorage.setItem('webtown_name', name.trim());
            localStorage.setItem('webtown_color', color);
            localStorage.setItem('webtown_type', characterType);
            localStorage.setItem('webtown_hairStyle', hairStyle);
            localStorage.setItem('webtown_hairColor', hairColor);
            localStorage.setItem('webtown_faceType', faceType);

            onJoin(name, color, characterType, { hairStyle, hairColor, faceType });
        }
    };

    return (
        <div className={styles.loginOverlay}>
            <div className={styles.card}>
                <div className={styles.splitLayout}>
                    {/* Left: Preview */}
                    <div className={styles.previewPane}>
                        <div className={styles.previewContainer}>
                            <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
                                <ambientLight intensity={1.2} />
                                <pointLight position={[10, 10, 10]} intensity={1.5} />
                                <Suspense fallback={null}>
                                    <group position={[0, -0.8, 0]}>
                                        <CharacterModel
                                            color={color}
                                            type={characterType}
                                            hairStyle={hairStyle}
                                            hairColor={hairColor}
                                            faceType={faceType}
                                        />
                                    </group>
                                    <Environment preset="city" />
                                    <OrbitControls autoRotate autoRotateSpeed={4} enableZoom={false} />
                                </Suspense>
                            </Canvas>
                        </div>
                        <div className={styles.previewHint}>Karakterini Döndür ✨</div>
                    </div>

                    {/* Right: Controls */}
                    <div className={styles.controlsPane}>
                        <h1 className={styles.mainTitle}>Prenses Kasabası</h1>

                        {/* Tabs */}
                        <div className={styles.tabsContainer}>
                            <button className={`${styles.tabBtn} ${activeTab === 'identity' ? styles.tabActive : ''}`} onClick={() => setActiveTab('identity')}>Kimlik</button>
                            <button className={`${styles.tabBtn} ${activeTab === 'style' ? styles.tabActive : ''}`} onClick={() => setActiveTab('style')}>Saç & Renk</button>
                            <button className={`${styles.tabBtn} ${activeTab === 'face' ? styles.tabActive : ''}`} onClick={() => setActiveTab('face')}>Yüz</button>
                        </div>

                        <form onSubmit={handleJoin} className={styles.joinForm}>
                            {activeTab === 'identity' && (
                                <>
                                    <div className={styles.inputSection}>
                                        <label>İsmin Nedir?</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Harika bir isim yaz..."
                                            maxLength={15}
                                            required
                                        />
                                    </div>

                                    <div className={styles.inputSection}>
                                        <label>Kim Olmak İstersin?</label>
                                        <div className={styles.charGrid}>
                                            {CHAR_TYPES.map(t => (
                                                <button
                                                    key={t.id}
                                                    type="button"
                                                    title={t.label}
                                                    className={`${styles.charButton} ${characterType === t.id ? styles.active : ''}`}
                                                    onClick={() => setCharacterType(t.id)}
                                                >
                                                    <span className={styles.charIcon}>{t.label.split(' ')[1]}</span>
                                                    <span className={styles.charLabelText}>{t.label.split(' ')[0]}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'style' && (
                                <>
                                    <div className={styles.inputSection}>
                                        <label>Elbise Rengi?</label>
                                        <div className={styles.colorPalette}>
                                            {COLORS.map(c => (
                                                <button
                                                    key={c.value}
                                                    type="button"
                                                    className={`${styles.colorChip} ${color === c.value ? styles.active : ''}`}
                                                    style={{ backgroundColor: c.value }}
                                                    onClick={() => setColor(c.value)}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.inputSection}>
                                        <label>Saç Modeli?</label>
                                        <div className={styles.hairGrid}>
                                            {HAIR_STYLES.map(s => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    className={`${styles.smallBtn} ${hairStyle === s.id ? styles.active : ''}`}
                                                    onClick={() => setHairStyle(s.id)}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.inputSection}>
                                        <label>Saç Rengi?</label>
                                        <div className={styles.colorPalette}>
                                            {HAIR_COLORS.map(c => (
                                                <button
                                                    key={c.value}
                                                    type="button"
                                                    className={`${styles.colorChip} ${hairColor === c.value ? styles.active : ''}`}
                                                    style={{ backgroundColor: c.value }}
                                                    onClick={() => setHairColor(c.value)}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'face' && (
                                <div className={styles.inputSection}>
                                    <label>Nasıl Hissediyorsun?</label>
                                    <div className={styles.faceGrid}>
                                        {FACE_TYPES.map(f => (
                                            <button
                                                key={f.id}
                                                type="button"
                                                className={`${styles.largeBtn} ${faceType === f.id ? styles.active : ''}`}
                                                onClick={() => setFaceType(f.id)}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button type="submit" className={styles.startBtn}>
                                MACERAYA BAŞLA! 🏰💎
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Animated Background Ornaments */}
            {ornaments.map((orn, i) => (
                <div key={i} className={styles.bgFloating} style={{
                    left: orn.left,
                    top: orn.top,
                    animationDelay: orn.delay
                }}>✨</div>
            ))}
        </div>
    );
}
