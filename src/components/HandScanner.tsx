'use client';

import React, { useState, useRef } from 'react';
import { Camera, Sparkles, RefreshCw, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from '@/lib/translations';

interface HandScannerProps {
    onAnalyze: (left: string, right: string, language: Language) => void;
    isLoading: boolean;
    language: Language;
    setLanguage: (lang: Language) => void;
}

export default function HandScanner({ onAnalyze, isLoading, language, setLanguage }: HandScannerProps) {
    const [leftHand, setLeftHand] = useState<string | null>(null);
    const [rightHand, setRightHand] = useState<string | null>(null);
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);

    const t = translations[language];

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIDE = 512;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIDE) {
                            height = Math.round(height * (MAX_SIDE / width));
                            width = MAX_SIDE;
                        }
                    } else {
                        if (height > MAX_SIDE) {
                            width = Math.round(width * (MAX_SIDE / height));
                            height = MAX_SIDE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, width, height);
                    }

                    const base64 = canvas.toDataURL('image/jpeg', 0.5);
                    const sizeKB = Math.round((base64.length * 3) / 4 / 1024);
                    console.log(`🚀 Imagen Optimizada: ${width}x${height}, Peso: ~${sizeKB}KB`);

                    resolve(base64);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const resizedImage = await resizeImage(file);
                if (side === 'left') setLeftHand(resizedImage);
                else setRightHand(resizedImage);
            } catch (error) {
                console.error("Error processing image:", error);
                alert(t.imageError);
            }
        }
    };

    const removeImage = (e: React.MouseEvent, side: 'left' | 'right') => {
        e.stopPropagation();
        if (side === 'left') setLeftHand(null);
        else setRightHand(null);

        if (side === 'left' && leftInputRef.current) leftInputRef.current.value = '';
        if (side === 'right' && rightInputRef.current) rightInputRef.current.value = '';
    };

    const handleAnalyze = () => {
        if (leftHand && rightHand) {
            onAnalyze(leftHand, rightHand, language);
        }
    };

    const flags: { lang: Language; label: string; emoji: string }[] = [
        { lang: 'es', label: 'Español', emoji: '🇲🇽' },
        { lang: 'en', label: 'English', emoji: '🇬🇧' },
        { lang: 'fr', label: 'Français', emoji: '🇫🇷' },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
                {/* Left Hand Card */}
                <motion.div whileHover={{ scale: 1.01 }} className="flex flex-col gap-4 group">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-bold tracking-tight text-white/90">{t.leftHandTitle}</h3>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded">{t.leftHandBadge}</span>
                    </div>

                    <div
                        className={`relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer mystic-card flex flex-col items-center justify-center p-2 group transition-all duration-500 ${leftHand ? 'border-primary/40' : 'hover:border-primary/20'}`}
                        onClick={() => !leftHand && leftInputRef.current?.click()}
                    >
                        <AnimatePresence mode="wait">
                            {leftHand ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                                    <img src={leftHand} alt="Left" className="w-full h-full object-cover rounded-[1.8rem]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                                        <button onClick={(e) => removeImage(e, 'left')} className="bg-red-500/20 hover:bg-red-500/40 text-red-100 p-3 rounded-full backdrop-blur-md transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md p-2 rounded-full border border-primary/40">
                                        <CheckCircle2 size={16} className="text-primary" />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div className="flex flex-col items-center gap-4 text-center p-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <Camera size={32} className="text-primary/60 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{t.leftHandCapture}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t.leftHandUpload}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <input type="file" ref={leftInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'left')} />
                    </div>
                </motion.div>

                {/* Right Hand Card */}
                <motion.div whileHover={{ scale: 1.01 }} className="flex flex-col gap-4 group">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-bold tracking-tight text-white/90">{t.rightHandTitle}</h3>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded">{t.rightHandBadge}</span>
                    </div>

                    <div
                        className={`relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer mystic-card flex flex-col items-center justify-center p-2 group transition-all duration-500 ${rightHand ? 'border-primary/40' : 'hover:border-primary/20'}`}
                        onClick={() => !rightHand && rightInputRef.current?.click()}
                    >
                        <AnimatePresence mode="wait">
                            {rightHand ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                                    <img src={rightHand} alt="Right" className="w-full h-full object-cover rounded-[1.8rem]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                                        <button onClick={(e) => removeImage(e, 'right')} className="bg-red-500/20 hover:bg-red-500/40 text-red-100 p-3 rounded-full backdrop-blur-md transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md p-2 rounded-full border border-primary/40">
                                        <CheckCircle2 size={16} className="text-primary" />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div className="flex flex-col items-center gap-4 text-center p-8" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <Camera size={32} className="text-primary/60 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{t.rightHandCapture}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{t.rightHandUpload}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <input type="file" ref={rightInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'right')} />
                    </div>
                </motion.div>
            </div>

            <div className="mt-16 flex flex-col items-center gap-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalyze}
                    disabled={!leftHand || !rightHand || isLoading}
                    className={`relative group px-12 py-5 rounded-full font-bold text-xl overflow-hidden transition-all duration-500 ${!leftHand || !rightHand || isLoading
                        ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                        : 'bg-primary text-white glow-primary'
                        }`}
                >
                    {!isLoading && leftHand && rightHand && (
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 bg-[length:200%_auto]"
                            animate={{ backgroundPosition: ['0% center', '200% center'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                    )}

                    <span className="relative flex items-center gap-3">
                        {isLoading ? (
                            <>
                                <RefreshCw className="animate-spin" />
                                <span>{t.loadingDiagnosis}</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className={leftHand && rightHand ? "animate-pulse" : ""} />
                                <span>{t.startDiagnosis}</span>
                            </>
                        )}
                    </span>
                </motion.button>

                {/* Language Flags */}
                <div className="flex items-center gap-4">
                    {flags.map((f) => (
                        <motion.button
                            key={f.lang}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setLanguage(f.lang)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                                language === f.lang
                                    ? 'bg-primary/20 border border-primary/40 text-primary shadow-lg shadow-primary/10'
                                    : 'bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                            }`}
                            title={f.label}
                        >
                            <span className="text-lg">{f.emoji}</span>
                            <span className="hidden sm:inline text-xs">{f.label}</span>
                        </motion.button>
                    ))}
                </div>

                <AnimatePresence>
                    {!leftHand || !rightHand ? (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-muted-foreground text-sm font-light tracking-wide flex items-center gap-2"
                        >
                            <AlertCircle size={14} />
                            {t.uploadBoth}
                        </motion.p>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
