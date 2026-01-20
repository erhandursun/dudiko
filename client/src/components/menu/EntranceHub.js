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
            name: 'Prenses Meydanı',
            icon: <Castle className="text-princess-pink" size={32} />,
            desc: 'Evlerini gez, arkadaşlarınla buluş ve kasabanın tadını çıkar!',
            img: 'https://images.unsplash.com/photo-1612152605332-2e11798d1a8e?q=80&w=1000&auto=format&fit=crop',
            age: '7+ YAŞ',
            type: 'KLASİK'
        },
        {
            id: 'school',
            name: 'Prenses Akademisi',
            icon: <School className="text-blue-500" size={32} />,
            desc: 'Matematik, İngilizce ve Okuma sınıflarında öğren ve eğlen!',
            img: 'https://plus.unsplash.com/premium_photo-1683408267597-154dfdd1c944?q=80&w=1000&auto=format&fit=crop',
            age: '8-12 YAŞ',
            type: 'PREMİUM'
        },
        {
            id: 'race',
            name: 'Yarış Parkuru',
            icon: <Trophy className="text-princess-gold" size={32} />,
            desc: 'Engelleri aş, en hızlı sen ol ve parkuru tamamla!',
            img: 'https://images.unsplash.com/photo-1513810576352-78d2b376c6E6?q=80&w=1000&auto=format&fit=crop',
            age: '6+ YAŞ',
            type: 'HIZLI'
        },
        {
            id: 'candy',
            name: 'Şeker Diyarı',
            icon: <Cookie className="text-purple-500" size={32} />,
            desc: 'Gizli harfleri bul ve kelimeleri tamamlayarak puan topla!',
            img: 'https://images.unsplash.com/photo-1533467457999-7f975764d783?q=80&w=1000&auto=format&fit=crop',
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
                            <div className="relative h-64 rounded-[32px] overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02]">
                                <img src={world.img} className="w-full h-full object-cover" alt={world.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black text-princess-hot uppercase tracking-wider">
                                        {world.type}
                                    </span>
                                    <span className="bg-princess-gold px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider">
                                        {world.age}
                                    </span>
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white rounded-xl shadow-lg">
                                            {world.icon}
                                        </div>
                                        <h3 className="text-xl font-black text-white drop-shadow-md">{world.name}</h3>
                                    </div>
                                    <p className="text-white/70 text-sm font-medium leading-snug line-clamp-2">
                                        {world.desc}
                                    </p>
                                </div>

                                <div className="absolute inset-0 bg-princess-pink/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="bg-white px-8 py-3 rounded-2xl text-princess-pink font-black text-lg shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                                        GİRİŞ YAP ✨
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
                    v3.1 Ultra Engine Powered by Elif Duha 🚀
                </div>
            </div>
        </div>
    );
}
