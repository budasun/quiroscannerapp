'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DesarrolladorPage() {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <main className="min-h-screen bg-[#050510] text-slate-300 flex flex-col">
            {/* Nav */}
            <nav className="sticky top-0 z-50 p-4 md:p-6 backdrop-blur-md border-b border-white/5 shrink-0">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-bold group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ArrowLeft size={18} />
                        </div>
                        <span className="hidden sm:inline">Volver al Scanner</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <Code2 size={12} />
                            Desarrollador
                        </div>
                        <a
                            href="https://www.octaviotrs.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-primary/30 transition-all text-xs font-bold"
                        >
                            <ExternalLink size={12} />
                            <span className="hidden sm:inline">Abrir en nueva pestaña</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* Iframe Container */}
            <div className="flex-1 relative">
                {/* Loading Overlay */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050510] gap-6"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Loader2 size={32} className="text-primary animate-spin" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-white font-bold text-lg">Cargando portafolio...</p>
                            <p className="text-muted-foreground text-sm font-light">octaviotrs.com</p>
                        </div>
                    </motion.div>
                )}

                <iframe
                    src="https://www.octaviotrs.com/"
                    title="Octavio TRS - Desarrollador"
                    className="w-full h-full border-none"
                    style={{ minHeight: 'calc(100vh - 73px)' }}
                    onLoad={() => setIsLoading(false)}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
            </div>
        </main>
    );
}
