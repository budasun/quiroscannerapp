'use client';

import React, { useState } from 'react';
import HandScanner from '@/components/HandScanner';
import DiagnosisView from '@/components/DiagnosisView';
import MaestroKongChat from '@/components/MaestroKongChat';
import { DiagnosisResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, RefreshCw, Eye, Brain, Heart, ChevronDown } from 'lucide-react';

export default function TaoHealthScanner() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'scan' | 'result'>('scan');

  const handleAnalyze = async (left: string, right: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leftHand: left, rightHand: right }),
      });

      if (!response.ok) {
        throw new Error('Las nubes de datos están densas hoy. Inténtalo de nuevo.');
      }

      const result = await response.json();
      setDiagnosis(result);
      setView('result');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setDiagnosis(null);
    setView('scan');
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 p-6 flex justify-between items-center max-w-7xl mx-auto backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={resetScanner}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-fuchsia-600 flex items-center justify-center glow-primary animate-float">
            <Sparkles className="text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <h1 className="text-2xl font-black tracking-tighter gold-text">TAO HEALTH</h1>
            <span className="text-[10px] tracking-[0.3em] font-light text-muted-foreground uppercase pl-1">Scanner Pro</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Tradicíon</a>
            <a href="#" className="hover:text-white transition-colors">Método</a>
            <a href="#" className="hover:text-white transition-colors">IA</a>
          </div>
          {diagnosis && (
            <button
              onClick={() => setView(view === 'scan' ? 'result' : 'scan')}
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
            >
              {view === 'scan' ? <Eye size={16} /> : <RefreshCw size={16} />}
              {view === 'scan' ? 'Ver Resultado' : 'Nueva Consulta'}
            </button>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 relative">
        <AnimatePresence mode="wait">
          {view === 'scan' ? (
            <motion.div
              key="scan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 md:py-20"
            >
              {/* Hero Section */}
              <div className="text-center mb-20 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4"
                >
                  <Sparkles size={12} />
                  Tecnología Ancestral x IA
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-8xl font-black tracking-tighter leading-tight"
                >
                  Tu salud en la <span className="gold-text">palma</span> de tu mano.
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed"
                >
                  Fusionamos la sabiduría de <span className="text-white font-medium">Wang Chenxia</span> y la <span className="text-white font-medium">Psicología Integral</span> para realizar un análisis holográfico de tu bienestar físico y ancestral.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-10 flex flex-col items-center gap-4"
                >
                  <ChevronDown className="animate-bounce text-muted-foreground opacity-30" />
                </motion.div>
              </div>

              {/* Scanner Component */}
              <HandScanner onAnalyze={handleAnalyze} isLoading={isLoading} />

              {/* Features Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40">
                {[
                  { icon: Eye, title: "Análisis Visual", desc: "Detección de marcas celulares, coloración y líneas orgánicas." },
                  { icon: Brain, title: "Visión Integral", desc: "Mapeo de los 4 cuadrantes del ser: Yo, Ello, Nosotros, Ellos." },
                  { icon: Heart, title: "Salud Tao", desc: "Balance de los 5 elementos fundamentales en tu sistema." }
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    className="mystic-card p-8 rounded-[2.5rem] space-y-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                      <f.icon size={28} />
                    </div>
                    <h4 className="text-xl font-bold text-white">{f.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 pb-32 space-y-24"
            >
              <div className="text-center pt-8">
                <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Diagnóstico Finalizado</span>
                <h2 className="text-4xl md:text-6xl font-black text-white">Tu Mapa Energético</h2>
              </div>

              {diagnosis && <DiagnosisView result={diagnosis} />}

              <div id="chat" className="relative">
                <div className="absolute inset-0 bg-primary/5 blur-[100px] -z-10" />
                <div className="text-center mb-12 space-y-4">
                  <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-4">
                    <MessageSquare className="text-primary" size={32} />
                  </div>
                  <h3 className="text-4xl font-black gold-text italic">Conversa con el Maestro Kong</h3>
                  <p className="text-muted-foreground max-w-xl mx-auto font-light">
                    Consulta al sabio sobre los desequilibrios encontrados y recibe guía espiritual.
                  </p>
                </div>
                {diagnosis && <MaestroKongChat diagnosis={diagnosis} />}
              </div>

              <div className="flex justify-center pt-10">
                <button
                  onClick={resetScanner}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl transition-all font-bold group"
                >
                  <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                  Realizar Nuevo Análisis
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-40 py-12 border-t border-white/5 text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <span className="font-bold tracking-tighter text-white">TAO HEALTH SCANNER</span>
          </div>
          <p className="text-xs text-muted-foreground font-light opacity-50">
            © 2026 • Diseñado para la sanación profunda y el despertar de la consciencia.
          </p>
          <div className="flex gap-6 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
