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
                        <div className={styles.cardImage} style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1577083288073-40892c0860a4?q=80&w=1000&auto=format&fit=crop")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            <div className={styles.badge}>KLASİK</div>
                            <div className={styles.ageBadge}>7+ YAŞ</div>
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
                        <div className={styles.cardImage} style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1000&auto=format&fit=crop")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            <div className={styles.badgePremium}>PREMİUM</div>
                            <div className={styles.ageBadge}>8-12 YAŞ</div>
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
                        <div className={styles.cardImage} style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=1000&auto=format&fit=crop")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            <div className={styles.badgePremium} style={{ background: '#38bdf8' }}>HIZLI</div>
                            <div className={styles.ageBadge}>6+ YAŞ</div>
                        </div>
                        <div className={styles.cardBody}>
                            <h3>Yarış Parkuru 🏎️</h3>
                            <p>Engelleri aş, en hızlı sen ol ve parkuru tamamla!</p>
                            <button className={styles.goBtnPremium} style={{ background: '#38bdf8' }}>PARKURA GİT 🏁</button>
                        </div>
                    </div>

                    {/* CANDY WORLD (NEW) */}
                    <div
                        className={styles.worldCard}
                        onClick={() => setWorld('candy')}
                    >
                        <div className={styles.cardImage} style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1565071552827-8dpsbyl1-w4?q=80&w=1000&auto=format&fit=crop")', // Candy/Pastel theme
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            <div className={styles.badgePremium} style={{ background: '#e056fd' }}>ÖĞRETİCİ</div>
                            <div className={styles.ageBadge}>5-8 YAŞ</div>
                        </div>
                        <div className={styles.cardBody}>
                            <h3>Şeker Diyarı & Alfabe 🍬</h3>
                            <p>Hem eğlen hem öğren! Gizli harfleri bul ve kelimeleri tamamla.</p>
                            <button className={styles.goBtnPremium} style={{ background: '#e056fd' }}>KELİME AVI 🅰️</button>
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
