'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSocketStore } from '@/stores/socketStore';
import { Castle, School, Trophy, Cookie, Sparkles, LogOut } from 'lucide-react';

export default function EntranceHub() {
    const setWorld = useSocketStore((state) => state.setWorld);
    const myName = useSocketStore((state) => state.myName);
    const disconnect = useSocketStore((state) => state.disconnect);

    const worlds = [
        {
            id: 'town',
            name: 'Kasaba Meydanı',
            icon: <Castle className="text-white" size={48} />,
            desc: 'Evlerini gez, arkadaşlarınla buluş ve kasabanın tadını çıkar!',
            gradient: 'from-blue-400 to-indigo-600',
            age: '7+ YAŞ',
            type: 'KLASİK'
        },
        {
            id: 'school',
            name: 'Akademi',
            icon: <School className="text-white" size={48} />,
            desc: 'Matematik, İngilizce ve Okuma sınıflarında öğren ve eğlen!',
            gradient: 'from-orange-400 to-pink-500',
            age: '8-12 YAŞ',
            type: 'PREMİUM'
        },
        {
            id: 'race',
            name: 'Yarış Parkuru',
            icon: <Trophy className="text-white" size={48} />,
            desc: 'Engelleri aş, en hızlı sen ol ve parkuru tamamla!',
            gradient: 'from-red-500 to-rose-600',
            age: '6+ YAŞ',
            type: 'HIZLI'
        },
        {
            id: 'candy',
            name: 'Şeker Diyarı',
            icon: <Cookie className="text-white" size={48} />,
            desc: 'Gizli harfleri bul ve kelimeleri tamamlayarak puan topla!',
            gradient: 'from-purple-400 to-fuchsia-600',
            age: '5-8 YAŞ',
            type: 'ÖĞRETİCİ'
        }
    ];

    return (
        <div className="fixed inset-0 z-[800] overflow-y-auto bg-[#fdf2f8] p-4 md:p-12">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-princess-hot drop-shadow-sm mb-2">
                            Hoş Geldin, {myName}! ✨
                        </h1>
                        <p className="text-princess-hot/60 font-bold text-lg">Hangi maceraya atılmak istersin?</p>
                    </motion.div>

                    <button
                        onClick={() => window.location.reload()} // Restart for simple logout
                        className="p-4 rounded-2xl bg-white shadow-lg text-red-500 active:scale-95 transition-all"
                    >
                        <LogOut size={24} />
                    </button>
                </div>

                {/* World Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {worlds.map((world, idx) => (
                        <motion.div
                            key={world.id}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setWorld(world.id)}
                            className="group cursor-pointer"
                        >
                            <div className={`relative h-64 rounded-[32px] overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02] bg-gradient-to-br ${world.gradient}`}>
                                {/* Decorative Circles */}
                                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 rounded-full bg-white/10 blur-3xl" />
                                <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 rounded-full bg-black/10 blur-xl" />

                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-black/70 uppercase tracking-wider">
                                        {world.type}
                                    </span>
                                    <span className="bg-black/20 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        {world.age}
                                    </span>
                                </div>

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pt-12">
                                    <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg mb-4 text-white">
                                        {world.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-white drop-shadow-md mb-2">{world.name}</h3>
                                    <p className="text-white/90 text-sm font-bold leading-snug line-clamp-2 max-w-[200px]">
                                        {world.desc}
                                    </p>
                                </div>

                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="bg-white px-8 py-3 rounded-2xl text-black font-black text-lg shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                                        GİRİŞ YAP 🚀
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Character Customization Shortcut Hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 p-8 glass rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 border-2 border-white"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-princess-pink to-princess-gold flex items-center justify-center text-white text-3xl">
                            👑
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-princess-hot">Moda Tasarımcısı</h4>
                            <p className="text-princess-hot/50 font-bold italic">Oyunun içinde kıyafetlerini değiştirmeyi unutma!</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-4 bg-white/50 rounded-2xl border border-white">✨ Parıltılı Saçlar</div>
                        <div className="p-4 bg-white/50 rounded-2xl border border-white">👗 Yeni Elbiseler</div>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-12 text-center text-princess-hot/30 text-xs font-black uppercase tracking-[4px]">
                    v3.1.2 Ultra Engine Powered by Elif Duha 🚀
                </div>
            </div>
        </div>
    );
}
