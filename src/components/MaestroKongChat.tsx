'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Sparkles, Scroll, BookOpen, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, DiagnosisResult } from '@/types';
// Usamos la versión PRO para soportar colores oklab de Tailwind modernos
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface MaestroKongChatProps {
    diagnosis: DiagnosisResult;
    handImages?: { left: string; right: string } | null;
}

function parseMarkdown(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-primary font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
    });
}

export default function MaestroKongChat({ diagnosis, handImages }: MaestroKongChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Referencias para el contenedor y el scroll inteligente
    const scrollRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);

    // Scroll Inteligente: Se alinea al inicio si habla el Maestro, al final si hablas tú
    useEffect(() => {
        if (lastMessageRef.current && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            // 'start' nos deja ver el inicio de la lectura, 'end' nos baja al último mensaje corto
            const scrollBehavior = lastMsg.role === 'assistant' ? 'start' : 'end';
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: scrollBehavior });
        }
    }, [messages]);

    const exportToPDF = async () => {
        if (!contentRef.current || isExporting) return;

        setIsExporting(true);

        let tempExportElement: HTMLElement | null = null;
        let pdfStyle: HTMLStyleElement | null = null;

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const originalElement = contentRef.current;
            const isMobile = window.innerWidth < 768;

            // ── Contenedor off-screen seguro para móviles (Nunca usar left: -9999px) ──
            tempExportElement = document.createElement('div');
            tempExportElement.style.width = isMobile ? '600px' : '900px';
            tempExportElement.style.backgroundColor = '#050510';
            tempExportElement.style.padding = '30px';
            tempExportElement.style.position = 'absolute'; // Usamos absolute, no fixed
            tempExportElement.style.top = '0';
            tempExportElement.style.left = '0';
            tempExportElement.style.zIndex = '-1000'; // Escondido detrás del fondo visible
            tempExportElement.style.fontFamily = 'system-ui, sans-serif';
            document.body.appendChild(tempExportElement);

            const titleEl = document.createElement('div');
            titleEl.style.textAlign = 'center';
            titleEl.style.marginBottom = '20px';
            titleEl.innerHTML = `
                <h1 style="color:#8b5cf6;font-size:24px;font-weight:900;margin:0;letter-spacing:2px;">TAO HEALTH SCANNER PRO</h1>
                <p style="color:#9ca3af;font-size:12px;margin:6px 0 0;">Diagnóstico Integral · ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <hr style="border:none;border-top:1px solid rgba(139,92,246,0.3);margin:16px 0;">
            `;
            tempExportElement.appendChild(titleEl);

            if (handImages?.left && handImages?.right) {
                const imagesContainer = document.createElement('div');
                imagesContainer.style.display = 'flex';
                imagesContainer.style.justifyContent = 'space-around';
                imagesContainer.style.gap = '20px';
                imagesContainer.style.marginBottom = '24px';
                imagesContainer.style.padding = '16px';
                imagesContainer.style.backgroundColor = 'rgba(255,255,255,0.03)';
                imagesContainer.style.borderRadius = '16px';
                imagesContainer.style.border = '1px solid rgba(139,92,246,0.2)';

                const makeImgWrapper = (src: string, label: string) => {
                    const wrap = document.createElement('div');
                    wrap.style.textAlign = 'center';
                    wrap.style.flex = '1';
                    const img = document.createElement('img');
                    img.src = src;
                    img.crossOrigin = 'anonymous';
                    img.style.width = '100%';
                    img.style.maxWidth = '380px';
                    img.style.height = '280px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '12px';
                    img.style.display = 'block';
                    img.style.margin = '0 auto 8px';
                    const lbl = document.createElement('p');
                    lbl.textContent = label;
                    lbl.style.color = '#9ca3af';
                    lbl.style.fontSize = '11px';
                    lbl.style.fontWeight = 'bold';
                    lbl.style.letterSpacing = '2px';
                    lbl.style.textTransform = 'uppercase';
                    lbl.style.margin = '0';
                    wrap.appendChild(img);
                    wrap.appendChild(lbl);
                    return wrap;
                };

                imagesContainer.appendChild(makeImgWrapper(handImages.left, '🖐 Izquierda (Ancestral)'));
                imagesContainer.appendChild(makeImgWrapper(handImages.right, '✋ Derecha (Actual)'));
                tempExportElement.appendChild(imagesContainer);
            }

            const cloned = originalElement.cloneNode(true) as HTMLElement;
            cloned.style.width = '100%';
            cloned.style.height = 'auto';
            cloned.style.overflow = 'visible';
            cloned.style.position = 'static';
            const scrollArea = cloned.querySelector('[class*="overflow-y-auto"]') as HTMLElement;
            if (scrollArea) {
                scrollArea.style.overflow = 'visible';
                scrollArea.style.height = 'auto';
                scrollArea.style.maxHeight = 'none';
            }
            tempExportElement.appendChild(cloned);

            pdfStyle = document.createElement('style');
            pdfStyle.id = 'pdf-export-style';
            pdfStyle.textContent = `
                * { animation: none !important; transition: none !important; animation-duration: 0s !important; }
                .text-primary, [class*="text-primary"] { color: #8b5cf6 !important; }
                .text-amber-400, [class*="amber-400"] { color: #fbbf24 !important; }
                .text-white { color: #ffffff !important; }
                .text-foreground { color: #e5e7eb !important; }
                .text-muted-foreground { color: #9ca3af !important; }
                .gold-text { color: #f59e0b !important; }
                .bg-primary { background-color: #8b5cf6 !important; }
                [class*="bg-white\\/"] { background-color: rgba(255,255,255,0.05) !important; }
                [class*="bg-gradient"] { background: #0a0a1a !important; }
                .backdrop-blur-xl, [class*="backdrop-blur"] { backdrop-filter: none !important; }
                .mystic-card { background: #0a0a1a !important; }
                [class*="shadow"] { box-shadow: none !important; }
            `;
            document.head.appendChild(pdfStyle);

            // Doble requestAnimationFrame para forzar a iOS a procesar el DOM nuevo
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            await new Promise(resolve => setTimeout(resolve, 400));

            const canvas = await html2canvas(tempExportElement, {
                scale: 1, // Escala 1 vital para móviles
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#050510',
                windowWidth: isMobile ? 600 : 900,
                onclone: (clonedDoc) => {
                    if (pdfStyle?.textContent) {
                        const s = clonedDoc.createElement('style');
                        s.textContent = pdfStyle.textContent;
                        clonedDoc.head.appendChild(s);
                    }
                    clonedDoc.body.style.backgroundColor = '#050510';
                    const scrollAreas = clonedDoc.querySelectorAll('[class*="overflow-y-auto"]');
                    scrollAreas.forEach((el) => {
                        (el as HTMLElement).style.overflow = 'visible';
                        (el as HTMLElement).style.height = 'auto';
                        (el as HTMLElement).style.maxHeight = 'none';
                    });
                }
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.85);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const contentHeightMm = (canvas.height / canvas.width) * pdfWidth;

            let yOffset = 0;
            while (yOffset < contentHeightMm) {
                if (yOffset > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfWidth, contentHeightMm);
                yOffset += pdfHeight;
            }

            const pageCount = pdf.getNumberOfPages();
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

            for (let i = 1; i <= pageCount; i++) {
                pdf.setPage(i);
                pdf.setFillColor(5, 5, 16);
                pdf.rect(0, 0, pdfWidth, 12, 'F');
                pdf.setFontSize(8);
                pdf.setTextColor(139, 92, 246);
                pdf.text(`Tao Health Scanner Pro · Pág. ${i}/${pageCount}`, pdfWidth / 2, 7.5, { align: 'center' });
            }

            pdf.save(`${dateStr.replace(/\//g, '-')}_TaoHealth.pdf`);

        } catch (error: any) {
            console.error('Error exporting PDF:', error);
            alert('Error detallado al generar PDF: ' + (error.message || 'Error de memoria en el navegador.'));
        } finally {
            if (pdfStyle && pdfStyle.parentNode) pdfStyle.parentNode.removeChild(pdfStyle);
            if (tempExportElement && tempExportElement.parentNode) tempExportElement.parentNode.removeChild(tempExportElement);
            setIsExporting(false);
        }
    };

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

    const handleConsultaCompleta = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setMessages([]);

        try {
            const response = await fetch('/api/consulta-completa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diagnosis })
            });

            if (!response.ok) throw new Error('Error en la consulta completa');

            const data = await response.json();

            if (data.consulta_completa) {
                const { yo, ello, nosotros, ellos } = data.consulta_completa;
                const newMessages: ChatMessage[] = [];

                if (yo?.contenido) {
                    newMessages.push({ role: 'assistant', content: `🏯 **YO - Mente y Espiritu**\n\n${yo.contenido}` });
                }
                if (ello?.contenido) {
                    newMessages.push({ role: 'assistant', content: `🌿 **ELLO - Cuerpo Físico**\n\n${ello.contenido}` });
                }
                if (nosotros?.contenido) {
                    newMessages.push({ role: 'assistant', content: `🪷 **NOSOTROS - Ancestros y Linaje**\n\n${nosotros.contenido}` });
                }
                if (ellos?.contenido) {
                    newMessages.push({ role: 'assistant', content: `🌍 **ELLOS - Entorno y Sociedad**\n\n${ellos.contenido}` });
                }
                if (data.consejos_practicos) {
                    const consejos = data.consejos_practicos;
                    let consejosText = `✨ **CONSEJOS PRÁCTICOS**\n\n`;
                    if (consejos.fisicos?.length) {
                        consejosText += `🌿 **Físicos:**\n${consejos.fisicos.map((c: string) => `• ${c}`).join('\n')}\n\n`;
                    }
                    if (consejos.mentales?.length) {
                        consejosText += `🧠 **Mentales:**\n${consejos.mentales.map((c: string) => `• ${c}`).join('\n')}\n\n`;
                    }
                    if (consejos.espirituales?.length) {
                        consejosText += `✨ **Espirituales:**\n${consejos.espirituales.map((c: string) => `• ${c}`).join('\n')}`;
                    }
                    newMessages.push({ role: 'assistant', content: consejosText });
                }

                setMessages(newMessages);
            } else {
                throw new Error('Formato de respuesta inválido');
            }
        } catch (error) {
            console.error(error);
            setMessages([{ role: 'assistant', content: 'Las nubes oscurecen mi visión en este momento. Inténtalo de nuevo más tarde.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10" ref={contentRef}>
            <div className="mystic-card rounded-[3rem] overflow-hidden flex flex-col h-[700px] border border-white/10 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

                {/* Header Responsivo */}
                <div className="px-6 py-6 md:px-8 md:py-6 border-b border-white/5 bg-white/5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 w-full">
                    <div className="flex items-center gap-4 w-full md:w-auto">
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

                    {/* Contenedor de Botones */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-3 w-full md:w-auto items-center justify-center">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={exportToPDF}
                            disabled={isExporting}
                            className="flex items-center justify-center gap-2 px-6 py-4 md:px-4 md:py-2 rounded-xl bg-gradient-to-r from-primary/20 to-fuchsia-500/20 border border-primary/30 text-primary hover:text-white transition-colors text-sm font-bold w-full md:w-auto disabled:opacity-50"
                        >
                            {isExporting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Download size={16} />
                            )}
                            Descargar PDF
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleConsultaCompleta}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-6 py-4 md:px-4 md:py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 transition-colors text-sm font-bold w-full md:w-auto disabled:opacity-50"
                        >
                            <BookOpen size={16} />
                            Consulta Completa
                        </motion.button>

                        <div className="hidden md:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-muted-foreground hover:text-white transition-colors cursor-pointer shrink-0">
                            <MessageSquare size={18} />
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
                        {messages.map((m, i) => {
                            const isLast = i === messages.length - 1;
                            return (
                                <motion.div
                                    key={i}
                                    ref={isLast ? lastMessageRef : null}
                                    style={{ scrollMarginTop: '2rem' }}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-1 shrink-0">
                                            <Sparkles size={14} className="text-primary" />
                                        </div>
                                    )}

                                    <div className={`max-w-[80%] p-5 rounded-3xl relative ${m.role === 'user'
                                        ? 'bg-primary text-white rounded-br-none shadow-lg shadow-primary/20'
                                        : 'bg-white/5 text-foreground rounded-bl-none border border-white/10 backdrop-blur-md'
                                        }`}>
                                        <p className="text-lg leading-relaxed font-light whitespace-pre-wrap">{parseMarkdown(m.content)}</p>
                                        {m.role === 'user' && (
                                            <div className="absolute bottom-[-18px] right-2 text-[8px] text-muted-foreground font-bold uppercase tracking-widest px-2">
                                                Tú
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
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
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-base font-light placeholder:text-muted-foreground/50"
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