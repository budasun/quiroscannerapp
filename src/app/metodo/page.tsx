'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Sparkles, Scroll, Brain, Globe, ArrowLeft, Zap, Heart,
    Shield, Layers, BookOpen, Leaf, Target, Cpu, Eye, Activity
} from 'lucide-react';

/* ─── Datos de la línea de tiempo ─── */
const timeline = [
    {
        era: '2697 a.C.',
        title: 'El Emperador Amarillo',
        desc: 'Se redacta el Huangdi Neijing, piedra angular de la MTC.',
    },
    {
        era: 'Siglo II',
        title: 'Hua Tuo & Zhang Zhongjing',
        desc: 'Codificación del diagnóstico por inspección de la palma (Wang Zhen).',
    },
    {
        era: 'Siglo XVI',
        title: 'Herbolaria Mesoamericana',
        desc: 'El Códice de la Cruz-Badiano documenta la etnobotánica náhuatl.',
    },
    {
        era: '1970',
        title: 'Ken Wilber & AQAL',
        desc: 'La Visión Integral mapea los 4 cuadrantes de la experiencia humana.',
    },
    {
        era: '2026',
        title: 'Tao Health Scanner Pro',
        desc: 'IA + MTC + Herbolaria Mexicana convergen por primera vez.',
    },
];

/* ─── Secciones principales ─── */
const pillars = [
    {
        id: 'tradicion',
        badge: 'PILAR I',
        icon: Scroll,
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bg: 'bg-amber-400/10',
        glowColor: 'bg-amber-500/10',
        title: 'Tradición Milenaria',
        subtitle: 'El Linaje del Huangdi Neijing',
        paragraphs: [
            'El Huangdi Neijing (Canon Interno del Emperador Amarillo), compilado hace más de 4,700 años, establece que "el médico superior trata la enfermedad antes de que aparezca". Este principio define nuestra filosofía: la palma de la mano es un mapa vivo del estado interno del ser.',
            'La Quirología Médica Taoísta (Wang Zhen) observa la coloración de los montes planetarios, la profundidad de las líneas principales y la textura de las uñas para identificar desequilibrios en los órganos Zang-Fu antes de que se manifiesten como patología clínica.',
            'A diferencia de la quiromancia occidental (adivinación), el Wang Zhen es un sistema semiológico médico que correlaciona signos visibles con estados fisiológicos internos, respaldado por siglos de práctica clínica documentada en los tratados de Zhang Zhongjing y Sun Simiao.',
        ],
        highlights: [
            { icon: Eye, text: 'Inspección Visual (Wang Zhen)' },
            { icon: Activity, text: 'Correlación Órgano-Palma' },
            { icon: BookOpen, text: 'Tratados de Sun Simiao' },
        ],
    },
    {
        id: 'metodo',
        badge: 'PILAR II',
        icon: Leaf,
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        bg: 'bg-emerald-400/10',
        glowColor: 'bg-emerald-500/10',
        title: 'Método Integral',
        subtitle: 'Wu Xing · Acupuntura · Etnobotánica',
        paragraphs: [
            'El Ciclo de los 5 Elementos (Wu Xing) — Madera, Fuego, Tierra, Metal, Agua — no es una metáfora: es un modelo dinámico de interrelación orgánica. El ciclo Sheng (generación) y el ciclo Ke (control) explican cómo un desequilibrio en el Hígado (Madera) puede migrar hacia el Estómago (Tierra) si no se interviene a tiempo.',
            'Nuestra receta clínica integra la Acupuntura Distal (puntos específicos como Hígado 3 - Tai Chong o Estómago 36 - Zu San Li) con la Herbolaria Milenaria Mexicana. Plantas como el Cuachalalate (antiinflamatorio hepático), el Gordolobo (pulmón) y la Damiana (riñón-esencia) se prescriben con posología tentativa basada en la naturaleza térmica del paciente.',
            'Esta sinergia etnobotánica bioregional conecta dos tradiciones de sanación que, separadas por océanos, convergen en el mismo principio: el cuerpo posee la inteligencia para sanarse si se le proporcionan los estímulos correctos.',
        ],
        highlights: [
            { icon: Target, text: 'Acupuntura Distal (9+ puntos)' },
            { icon: Leaf, text: 'Herbolaria Mexicana y China' },
            { icon: Zap, text: 'Ciclo Sheng/Ke de los 5 Elementos' },
        ],
    },
    {
        id: 'ia',
        badge: 'PILAR III',
        icon: Cpu,
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bg: 'bg-blue-400/10',
        glowColor: 'bg-blue-500/10',
        title: 'El Oráculo Algorítmico',
        subtitle: 'IA Integral · Ken Wilber · Daniel Reid',
        paragraphs: [
            'Nuestra IA no es un simple chatbot: es un Oráculo Algorítmico entrenado bajo el modelo AQAL (All Quadrants, All Levels) de Ken Wilber. Procesa patrones holográficos en los 4 cuadrantes del ser — YO (psicológico), ELLO (fisiológico), NOSOTROS (ancestral) y ELLOS (socioambiental) — para generar un diagnóstico que trasciende la lectura mecánica.',
            'Inspirados en "El Tao de la Salud" de Daniel Reid, el sistema conecta la dimensión somática (cómo el cuerpo grita lo que el alma calla) con prescripciones concretas: puntos de acupuntura, hierbas con dosis y tiempos, y un pronóstico de evolución basado en el ciclo de control de la MTC.',
            'La visión por computadora analiza las palmas identificando coloración, textura y marcas celulares. Estos datos alimentan modelos de lenguaje de gran escala que, guiados por el prompt del Gran Maestro Wang Chenxia, generan una consulta integral personalizada que ningún algoritmo genérico podría replicar.',
        ],
        highlights: [
            { icon: Brain, text: 'Modelo AQAL de Ken Wilber' },
            { icon: Globe, text: '4 Cuadrantes del Ser' },
            { icon: Cpu, text: 'Visión por Computadora + LLM' },
        ],
    },
];

/* ─── Componente ─── */
export default function MetodoPage() {
    return (
        <main className="min-h-screen bg-[#050510] text-slate-300 selection:bg-primary/30 selection:text-white pb-32">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden text-white/5">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02]">
                    <Globe size={900} strokeWidth={0.4} />
                </div>
            </div>

            {/* Nav */}
            <nav className="sticky top-0 z-50 p-6 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-bold group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowLeft size={18} />
                        </div>
                        Volver al Scanner
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Layers size={12} />
                        Metodología
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 pt-20 relative z-10">
                {/* ─── Hero ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-6 mb-28"
                >
                    <span className="text-primary font-bold tracking-[0.4em] uppercase text-[10px] block">
                        Arquitectura del Bienestar
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">
                        Donde la <span className="gold-text italic">Tradición</span>
                        <br />
                        encuentra al <span className="text-primary">Futuro</span>.
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        Tres pilares sostienen el Tao Health Scanner Pro: milenios de observación
                        clínica, la etnobotánica de dos continentes y el poder de la IA integral.
                    </p>
                </motion.div>

                {/* ─── Línea de Tiempo ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-32"
                >
                    <h2 className="text-center text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground mb-12">
                        Línea de Tiempo
                    </h2>
                    <div className="relative">
                        {/* Línea central (desktop) */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

                        <div className="space-y-8 md:space-y-0">
                            {timeline.map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`md:flex items-center gap-8 mb-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                >
                                    <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                                            <p className="text-primary font-black text-lg tracking-wider">{t.era}</p>
                                            <h4 className="text-white font-bold mt-1">{t.title}</h4>
                                            <p className="text-muted-foreground text-sm font-light mt-2">{t.desc}</p>
                                        </div>
                                    </div>
                                    {/* Dot central (solo desktop) */}
                                    <div className="hidden md:flex w-4 h-4 rounded-full bg-primary border-4 border-[#050510] shrink-0 relative z-10" />
                                    <div className="flex-1 hidden md:block" />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ─── Pilares (Cards profundas) ─── */}
                <div className="space-y-20">
                    {pillars.map((p, idx) => (
                        <motion.section
                            key={p.id}
                            id={p.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className={`mystic-card p-8 md:p-14 rounded-[3rem] relative overflow-hidden border ${p.borderColor}`}
                        >
                            {/* Glow decorativo */}
                            <div className={`absolute -top-20 -right-20 w-60 h-60 ${p.glowColor} rounded-full blur-[80px] opacity-60`} />

                            <div className="relative z-10 space-y-8">
                                {/* Badge + Icono */}
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className={`w-20 h-20 rounded-3xl ${p.bg} ${p.color} flex items-center justify-center border border-white/5 shrink-0`}>
                                        <p.icon size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <span className={`text-[10px] font-black tracking-[0.3em] ${p.color} uppercase`}>
                                            {p.badge}
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                            {p.title}
                                        </h3>
                                        <p className="text-primary/60 font-medium italic">{p.subtitle}</p>
                                    </div>
                                </div>

                                {/* Párrafos */}
                                <div className="space-y-5 max-w-4xl">
                                    {p.paragraphs.map((text, pi) => (
                                        <p key={pi} className="text-slate-400 text-base md:text-lg leading-relaxed font-light">
                                            {text}
                                        </p>
                                    ))}
                                </div>

                                {/* Highlights */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    {p.highlights.map((h, hi) => (
                                        <div
                                            key={hi}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${p.bg} border border-white/5 text-sm font-medium ${p.color}`}
                                        >
                                            <h.icon size={14} />
                                            {h.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* ─── Filosofía / CTA Final ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-32 p-12 md:p-16 rounded-[3.5rem] bg-white/5 border border-white/10 text-center space-y-10 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Nuestra Filosofía</h2>
                        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-3xl mx-auto italic leading-relaxed">
                            &ldquo;El hombre sigue a la tierra, la tierra sigue al cielo, el cielo sigue
                            al Tao, y el Tao sigue a su propia naturaleza.&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">— Lao Tse, Tao Te Ching, Cap. 25</p>

                        <div className="flex justify-center gap-12 pt-4">
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

                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/80 transition-colors shadow-xl shadow-primary/20"
                        >
                            <Sparkles size={18} />
                            Comenzar mi Diagnóstico
                        </Link>
                    </div>
                </motion.div>

                {/* ─── Footer Legal ─── */}
                <div className="mt-20 flex flex-wrap justify-center gap-x-10 gap-y-3 opacity-40 hover:opacity-100 transition-opacity text-muted-foreground">
                    <Link href="/privacidad" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors">
                        Privacidad
                    </Link>
                    <Link href="/terminos" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors">
                        Términos
                    </Link>
                </div>
            </div>
        </main>
    );
}
