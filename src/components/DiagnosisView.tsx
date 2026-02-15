'use client';

import React from 'react';
import { DiagnosisResult } from '@/types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Brain, Users, Globe, Eye, Zap, Info } from 'lucide-react';

interface DiagnosisViewProps {
    result: DiagnosisResult;
}

export default function DiagnosisView({ result }: DiagnosisViewProps) {
    const radarData = [
        { subject: 'Fuego', value: result.niveles_radar.fuego, fullMark: 100 },
        { subject: 'Tierra', value: result.niveles_radar.tierra, fullMark: 100 },
        { subject: 'Metal', value: result.niveles_radar.metal, fullMark: 100 },
        { subject: 'Agua', value: result.niveles_radar.agua, fullMark: 100 },
        { subject: 'Madera', value: result.niveles_radar.madera, fullMark: 100 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-24 px-4">
            {/* Master Message */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative py-10"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-primary/50 to-primary" />
                <div className="text-center pt-24 space-y-6">
                    <h2 className="text-4xl md:text-6xl font-serif italic gold-text leading-tight max-w-4xl mx-auto px-4">
                        "{result.mensaje_maestro}"
                    </h2>
                    <div className="inline-flex items-center gap-2 text-muted-foreground/60 tracking-[0.2em] font-light uppercase text-xs">
                        <span className="w-8 h-px bg-white/10" />
                        Sabiduría del I Ching
                        <span className="w-8 h-px bg-white/10" />
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Radar Chart Section */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="mystic-card p-10 rounded-[3rem] aspect-square relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                    <Activity size={20} />
                                </div>
                                Ciclo Elemental
                            </h3>
                            <div className="glass-pill text-[10px] text-primary font-bold">BIO-ESTADO</div>
                        </div>

                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 12, fontWeight: 700 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Energía"
                                        dataKey="value"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#radarGradient)"
                                        fillOpacity={0.6}
                                    />
                                    <defs>
                                        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#d946ef" />
                                        </linearGradient>
                                    </defs>
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <p className="text-center text-xs text-muted-foreground mt-4 font-light">
                            Mapeo de los 5 elementos basado en la coloración de los montes de Marte, Venus y Júpiter.
                        </p>
                    </div>
                </motion.div>

                {/* Wang Diagnosis Details */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="mystic-card p-8 rounded-[2rem] border-l-4 border-l-primary"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                <Eye size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Observación de Wang</h3>
                                <p className="text-xs text-muted-foreground">Diagnóstico por Inspección Visual (Wang Zhen)</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-light italic text-lg">
                            "{result.diagnostico_wang.observacion_visual}"
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mystic-card p-6 rounded-2xl bg-red-500/5 border-red-500/10"
                        >
                            <div className="flex items-center gap-2 mb-4 text-red-400">
                                <Zap size={16} />
                                <span className="text-[10px] uppercase tracking-widest font-black">Órgano Alerta</span>
                            </div>
                            <p className="text-2xl font-black text-white">{result.diagnostico_wang.organo_afectado}</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="mystic-card p-6 rounded-2xl bg-blue-500/5 border-blue-500/10"
                        >
                            <div className="flex items-center gap-2 mb-4 text-blue-400">
                                <Info size={16} />
                                <span className="text-[10px] uppercase tracking-widest font-black">Significado MTC</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-snug">{result.diagnostico_wang.significado_mtc}</p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Integral Quadrants Section */}
            <div className="space-y-12">
                <div className="flex items-center gap-4">
                    <h3 className="text-3xl font-black tracking-tight flex items-center gap-4">
                        Visión Integral
                        <div className="h-px w-24 bg-primary/20" />
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { key: 'yo', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                        { key: 'ello', icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10' },
                        { key: 'nosotros', icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                        { key: 'ellos', icon: Globe, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    ].map(({ key, icon: Icon, color, bg }, idx) => {
                        const quad = result.cuadrantes_integral[key as keyof typeof result.cuadrantes_integral];
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5, borderColor: 'rgba(139, 92, 246, 0.4)' }}
                                className="mystic-card p-8 rounded-[2.5rem] flex flex-col gap-6"
                            >
                                <div className={`p-4 rounded-2xl w-fit ${bg} ${color} border border-white/5`}>
                                    <Icon size={28} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-3 tracking-tight">{quad.titulo}</h4>
                                    <p className="text-sm text-muted-foreground font-light leading-relaxed">
                                        {quad.detalle}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
