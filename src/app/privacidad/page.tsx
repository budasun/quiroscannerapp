'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Lock, Eye, Server, UserCheck } from 'lucide-react';

export default function PrivacidadPage() {
    return (
        <main className="min-h-screen bg-[#050510] text-slate-300 selection:bg-primary/30 selection:text-white pb-20">
            {/* Background Decorative Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <nav className="sticky top-0 z-50 p-6 backdrop-blur-md border-b border-white/5">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-bold">
                        <ArrowLeft size={20} />
                        Volver al Scanner
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Shield size={12} />
                        Privacidad Asegurada
                    </div>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-6 pt-20 space-y-12 relative z-10">
                <header className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Política de Privacidad</h1>
                    <p className="text-muted-foreground font-light text-lg">Tao Health Scanner Pro · Actualizado marzo 2026</p>
                </header>

                <section className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex items-center gap-3 text-white font-bold">
                            <Lock className="text-primary" size={20} />
                            <h2>Nuestro Compromiso con tu Biometría</h2>
                        </div>
                        <p className="leading-relaxed font-light">
                            En Tao Health Scanner Pro, entendemos que tus manos son el mapa de tu vida. Procesamos imágenes biométricas de tus palmas únicamente para realizar el análisis de Medicina Tradicional China (MTC) y Psicología Integral solicitado.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                            <Eye className="text-blue-400" size={20} />
                            <h3 className="text-white font-bold">Uso de Datos</h3>
                            <p className="text-sm leading-relaxed font-light">
                                Las imágenes se analizan en tiempo real mediante modelos de visión artificial y se procesan a través de APIs de IA seguras (Groq/OpenRouter). No se utilizan para entrenar modelos externos.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                            <Server className="text-purple-400" size={20} />
                            <h3 className="text-white font-bold">Almacenamiento</h3>
                            <p className="text-sm leading-relaxed font-light">
                                No almacenamos tus fotos de forma permanente en nuestros servidores centrales. Los resultados del diagnóstico se guardan localmente en tu navegador mediante `localStorage` para tu conveniencia.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">Derechos del Usuario</h3>
                        <p className="leading-relaxed font-light">
                            Tienes derecho a borrar tu historial de consulta en cualquier momento limpiando el caché de tu navegador o utilizando la opción de "Nueva Consulta" que reinicia el estado de la aplicación.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                        <UserCheck className="text-primary shrink-0" size={24} />
                        <div className="space-y-2">
                            <h4 className="text-white font-bold text-sm">Transparencia Radical</h4>
                            <p className="text-xs leading-relaxed font-light italic">
                                "El sabio no oculta nada al cielo". Esta herramienta es un experimento de convergencia tecnológica. Tus datos son sagrados y tratados con la ética que el Gran Maestro Wang Chenxia exigiría.
                            </p>
                        </div>
                    </div>
                </section>
            </article>
        </main>
    );
}
