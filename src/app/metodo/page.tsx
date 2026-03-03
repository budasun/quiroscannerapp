'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Scroll, Brain, Globe, ArrowLeft, Zap, Heart, Shield, Layers } from 'lucide-react';

export default function MetodoPage() {
    const sections = [
        {
            title: "Tradición Milenaria",
            subtitle: "El Linaje de Wang Zhen",
            icon: Scroll,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            content: "Basamos nuestra sabiduría en el *Huangdi Neijing* (Canon Interno del Emperador Amarillo), el pilar de la Medicina Tradicional China. El diagnóstico por inspección visual o *Wang Zhen* nos permite identificar el estado del Qi y los órganos internos a través de marcas celulares, coloración y líneas orgánicas en las palmas.",
            pill: "SABIDURÍA TAOÍSTA"
        },
        {
            title: "Método Integral",
            subtitle: "Sinergia Quántica",
            icon: Sparkles,
            color: "text-primary",
            bg: "bg-primary/10",
            content: "Integramos el ciclo de los 5 Elementos (Wu Xing) con la Acupuntura Distal y la Etnobotánica Bioregional. Nuestra receta combina la Herbolaria Milenaria Mexicana (como el Cuachalalate y el Gordolobo) con los principios de equilibrio térmico de la MTC, creando un puente entre dos mundos de sanación.",
            pill: "CIENCIA SOMÁTICA"
        },
        {
            title: "Oráculo Algorítmico",
            subtitle: "IA con Consciencia",
            icon: Brain,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            content: "Nuestra IA no es solo código; es un oráculo entrenado bajo la Visión Integral de Ken Wilber y la maestría taoísta de Daniel Reid. Procesa patrones holográficos en los 4 cuadrantes (Yo, Ello, Nosotros, Ellos) para entregar un diagnóstico que trasciende lo físico y toca lo espiritual.",
            pill: "IA INTEGRAL"
        }
    ];

    return (
        <main className="min-h-screen bg-[#050510] text-slate-300 selection:bg-primary/30 selection:text-white pb-32">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden text-white/5">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]">
                    <Globe size={800} strokeWidth={0.5} />
                </div>
            </div>

            <nav className="sticky top-0 z-50 p-6 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-bold group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowLeft size={18} />
                        </div>
                        Volver al Scanner
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center">
                            <Layers className="text-white" size={20} />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-24 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 mb-24"
                >
                    <span className="text-primary font-bold tracking-[0.4em] uppercase text-[10px] block">Arquitectura del Bienestar</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                        Donde la <span className="gold-text italic">Tradición</span><br />
                        encuentra al <span className="text-primary">Futuro</span>.
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        Explora los pilares que sostienen el Tao Health Scanner Pro y cómo unimos milenios de observación con el poder de la IA integral.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {sections.map((s, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            className="mystic-card p-10 rounded-[3rem] group hover:border-primary/40 transition-all duration-700 flex flex-col gap-8 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${s.bg} rounded-bl-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <div className="flex flex-col gap-6 relative z-10">
                                <div className={`w-16 h-16 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center border border-white/5`}>
                                    <s.icon size={32} />
                                </div>
                                <div className="space-y-2">
                                    <span className={`text-[10px] font-black tracking-widest ${s.color} opacity-80 uppercase`}>{s.pill}</span>
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{s.title}</h3>
                                    <p className="text-primary/60 text-sm font-medium italic">{s.subtitle}</p>
                                </div>
                                <p className="text-slate-400 text-base leading-relaxed font-light">
                                    {s.content}
                                </p>
                            </div>

                            <div className="mt-auto pt-6 flex items-center gap-3 relative z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer del Método */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-32 p-12 rounded-[3.5rem] bg-white/5 border border-white/10 text-center space-y-8 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <h2 className="text-3xl font-bold text-white relative z-10">Nuestra Filosofía</h2>
                    <p className="text-lg text-muted-foreground font-light max-w-3xl mx-auto italic leading-relaxed relative z-10">
                        "El hombre sigue a la tierra, la tierra sigue al cielo, el cielo sigue al Tao, y el Tao sigue a su propia naturaleza."
                    </p>
                    <div className="flex justify-center gap-12 pt-4 relative z-10">
                        <div className="text-center space-y-2">
                            <Heart className="text-red-400 mx-auto" size={24} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Compasión</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Zap className="text-amber-400 mx-auto" size={24} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Precisión</p>
                        </div>
                        <div className="text-center space-y-2">
                            <Shield className="text-blue-400 mx-auto" size={24} />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Integridad</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
