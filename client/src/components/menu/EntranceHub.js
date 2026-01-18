'use client';

import React from 'react';
import { useSocketStore } from '@/stores/socketStore';
import styles from './EntranceHub.module.css';

export default function EntranceHub() {
    const setWorld = useSocketStore((state) => state.setWorld);
    const myName = useSocketStore((state) => state.myName);

    return (
        <div className={styles.hubOverlay}>
            <div className={styles.container}>
                <h1 className={styles.title}>Hoş Geldin, {myName}! ✨</h1>
                <p className={styles.subtitle}>Nereye gitmek istersin?</p>

                <div className={styles.worldGrid}>
                    {/* TOWN WORLD */}
                    <div
                        className={styles.worldCard}
                        onClick={() => setWorld('town')}
                    >
                        <div className={styles.cardImage} style={{ backgroundImage: 'url("https://images.remote.com/town_placeholder.jpg")' }}>
                            <div className={styles.badge}>KLASİK</div>
                        </div>
                        <div className={styles.cardBody}>
                            <h3>Prenses Meydanı 🏰</h3>
                            <p>Evlerini gez, arkadaşlarınla buluş ve kasabanın tadını çıkar!</p>
                            <button className={styles.goBtn}>GİRİŞ YAP 🚪</button>
                        </div>
                    </div>

                    {/* SCHOOL WORLD */}
                    <div
                        className={styles.worldCard}
                        onClick={() => setWorld('school')}
                    >
                        <div className={styles.cardImage} style={{ backgroundImage: 'url("https://images.remote.com/school_placeholder.jpg")' }}>
                            <div className={styles.badgePremium}>PREMİUM</div>
                        </div>
                        <div className={styles.cardBody}>
                            <h3>Okul Oyunu 🎒</h3>
                            <p>Sınıfa gir, ders çalış ve büyülü okulun gizemlerini keşfet!</p>
                            <button className={styles.goBtnPremium}>DERSE GİT 📚</button>
                        </div>
                    </div>

                    {/* RACE PARKOUR WORLD */}
                    <div
                        className={styles.worldCard}
                        onClick={() => setWorld('race')}
                    >
                        <div className={styles.cardImage} style={{ backgroundImage: 'url("https://images.remote.com/race_placeholder.jpg")' }}>
                            <div className={styles.badgePremium} style={{ background: '#38bdf8' }}>HIZLI</div>
                        </div>
                        <div className={styles.cardBody}>
                            <h3>Yarış Parkuru 🏎️</h3>
                            <p>Engelleri aş, en hızlı sen ol ve parkuru tamamla!</p>
                            <button className={styles.goBtnPremium} style={{ background: '#38bdf8' }}>PARKURA GİT 🏁</button>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <span>Oyun Sürümü: v2.0 Modular Engine 🚀</span>
                </div>
            </div>
        </div>
    );
}
