'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, User, Sparkles, Scroll } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, DiagnosisResult } from '@/types';

interface MaestroKongChatProps {
    diagnosis: DiagnosisResult;
}

export default function MaestroKongChat({ diagnosis }: MaestroKongChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    diagnosis: {
                        organo_afectado: diagnosis.diagnostico_wang.organo_afectado,
                        elemento_dominante: Object.entries(diagnosis.niveles_radar).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                    },
                    history: messages
                })
            });

            if (!response.ok) throw new Error('Error en la comunicación con el Maestro');

            const data = await response.json();
            const assistantMessage: ChatMessage = { role: 'assistant', content: data.content };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Las nubes oscurecen mi visión en este momento. Inténtalo de nuevo más tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="mystic-card rounded-[3rem] overflow-hidden flex flex-col h-[700px] border border-white/10 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-fuchsia-500/20 flex items-center justify-center border border-primary/30">
                                <Scroll className="text-primary" size={28} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#050510] rounded-full animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl gold-text tracking-tight">Maestro Kong</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Guía Taoísta Integral</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer">
                            <MessageSquare size={16} />
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin relative z-0">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                            <div className="w-24 h-24 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center animate-pulse">
                                <Sparkles size={40} className="text-primary/40" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-serif italic text-white font-light">"El río fluye sin esfuerzo..."</p>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Pregunta sobre las marcas en tu mano o pide un consejo para equilibrar tu {diagnosis.diagnostico_wang.organo_afectado.toLowerCase()}.
                                </p>
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                            >
                                {m.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-1 shrink-0">
                                        <Sparkles size={14} className="text-primary" />
                                    </div>
                                )}

                                <div className={`max-w-[75%] p-5 rounded-3xl relative ${m.role === 'user'
                                        ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/20'
                                        : 'bg-white/5 text-foreground rounded-bl-none border border-white/10 backdrop-blur-md'
                                    }`}>
                                    <p className="text-sm leading-relaxed font-light">{m.content}</p>
                                    {m.role === 'user' && (
                                        <div className="absolute bottom-[-18px] right-2 text-[8px] text-muted-foreground font-bold uppercase tracking-widest px-2">
                                            Tú
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Sparkles size={14} className="text-primary animate-spin" />
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl rounded-bl-none flex gap-1.5 border border-white/5">
                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input area */}
                <div className="p-8 bg-white/5 backdrop-blur-2xl border-t border-white/5 relative z-10">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Pregunta al sabio sobre tu diagnóstico..."
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-light placeholder:text-muted-foreground/50"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                <div className="text-[10px] font-black text-muted-foreground/30 border border-white/5 px-1.5 rounded">ENT</div>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-4 rounded-[1.2rem] bg-primary text-white hover:glow-primary disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-primary/20"
                        >
                            <Send size={20} />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
