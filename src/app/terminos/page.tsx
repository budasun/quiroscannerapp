'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, AlertTriangle, Scale, HeartPulse, Brain } from 'lucide-react';

export default function TerminosPage() {
    return (
        <main className="min-h-screen bg-[#050510] text-slate-300 selection:bg-primary/30 selection:text-white pb-20">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <nav className="sticky top-0 z-50 p-6 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-bold">
                        <ArrowLeft size={20} />
                        Volver al Scanner
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                        <Scale size={12} />
                        Términos Legales
                    </div>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-6 pt-20 space-y-12 relative z-10">
                <header className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Términos y Condiciones</h1>
                    <p className="text-muted-foreground font-light text-lg">Tao Health Scanner Pro · Disclaimer de IA y MTC</p>
                </header>

                <section className="space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 to-red-500/10 border border-amber-500/20 space-y-6">
                        <div className="flex items-center gap-3 text-amber-400 font-bold">
                            <AlertTriangle size={24} />
                            <h2 className="text-xl">DESLINDE MÉDICO (CRÍTICO)</h2>
                        </div>
                        <div className="space-y-4 leading-relaxed font-light">
                            <p>
                                Tao Health Scanner Pro es una herramienta de orientación basada en la Medicina Tradicional China (MTC) y la Psicología Integral.
                                <strong className="text-white"> NO constituye un diagnóstico médico clínico ni sustituye la consulta con un profesional de la salud colegiado.</strong>
                            </p>
                            <p>
                                Las sugerencias de herbolaria, acupuntura y dieta son de carácter informativo y educativo. El usuario asume toda la responsabilidad sobre la aplicación de estas sugerencias en su propia salud.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-white font-bold">
                                <HeartPulse className="text-primary" size={20} />
                                <h3>Limitación de IA</h3>
                            </div>
                            <p className="text-sm leading-relaxed font-light">
                                Las respuestas generadas por el "Maestro Kong" son producidas por modelos de lenguaje de gran escala. Aunque están programados con conocimientos de MTC, pueden generar alucinaciones o interpretaciones erróneas de los datos biométricos.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-white font-bold">
                                <Brain className="text-blue-400" size={20} />
                                <h3>Capacidad del Usuario</h3>
                            </div>
                            <p className="text-sm leading-relaxed font-light">
                                Al utilizar esta herramienta, declaras ser mayor de edad y poseer la capacidad legal para entender que estas lecturas son interpretativas de patrones energéticos y no prescripciones farmacológicas.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-white/5 pt-8">
                        <h3 className="text-xl font-bold text-white">Propiedad Intelectual</h3>
                        <p className="leading-relaxed font-light">
                            El diseño, el "Motor de Guillotina" de PDF y los algoritmos de análisis de cuadrantes integrales son propiedad de Tao Health Scanner Pro. Su reproducción total o parcial para fines comerciales está prohibida sin consentimiento expreso.
                        </p>
                    </div>

                    <footer className="pt-10 italic text-muted-foreground text-sm border-t border-white/5">
                        "El camino de la sanación requiere consciencia. No busques fuera lo que tu cuerpo ya te está gritando mediante sus signos naturales."
                    </footer>
                </section>
            </article>
        </main>
    );
}
