'use client';

import React, { useState, useRef } from 'react';
import { Camera, Sparkles, RefreshCw, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HandScannerProps {
    onAnalyze: (left: string, right: string) => void;
    isLoading: boolean;
}

export default function HandScanner({ onAnalyze, isLoading }: HandScannerProps) {
    const [leftHand, setLeftHand] = useState<string | null>(null);
    const [rightHand, setRightHand] = useState<string | null>(null);
    const leftInputRef = useRef<HTMLInputElement>(null);
    const rightInputRef = useRef<HTMLInputElement>(null);

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
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
                // Resize and compress image
                const resizedImage = await resizeImage(file);
                if (side === 'left') setLeftHand(resizedImage);
                else setRightHand(resizedImage);
            } catch (error) {
                console.error("Error processing image:", error);
                alert("Hubo un error al procesar la imagen. Intenta con otra.");
            }
        }
    };

    const removeImage = (e: React.MouseEvent, side: 'left' | 'right') => {
        e.stopPropagation();
        if (side === 'left') setLeftHand(null);
        else setRightHand(null);
    };

    const handleAnalyze = () => {
        if (leftHand && rightHand) {
            onAnalyze(leftHand, rightHand);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
                {/* Left Hand Card */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex flex-col gap-4 group"
                >
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-bold tracking-tight text-white/90">Mano Izquierda</h3>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded">Ancestros • Pasado</span>
                    </div>

                    <div
                        className={`relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer mystic-card flex flex-col items-center justify-center p-2 group transition-all duration-500 ${leftHand ? 'border-primary/40' : 'hover:border-primary/20'}`}
                        onClick={() => !leftHand && leftInputRef.current?.click()}
                    >
                        <AnimatePresence mode="wait">
                            {leftHand ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full relative"
                                >
                                    <img src={leftHand} alt="Izquierda" className="w-full h-full object-cover rounded-[1.8rem]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                                        <button
                                            onClick={(e) => removeImage(e, 'left')}
                                            className="bg-red-500/20 hover:bg-red-500/40 text-red-100 p-3 rounded-full backdrop-blur-md transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md p-2 rounded-full border border-primary/40">
                                        <CheckCircle2 size={16} className="text-primary" />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="flex flex-col items-center gap-4 text-center p-8"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <Camera size={32} className="text-primary/60 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Captura tu pasado</p>
                                        <p className="text-xs text-muted-foreground mt-1">Sube la foto de tu palma izquierda</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <input type="file" ref={leftInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'left')} />
                    </div>
                </motion.div>

                {/* Right Hand Card */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex flex-col gap-4 group"
                >
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-lg font-bold tracking-tight text-white/90">Mano Derecha</h3>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 px-2 py-1 rounded">Acción • Presente</span>
                    </div>

                    <div
                        className={`relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer mystic-card flex flex-col items-center justify-center p-2 group transition-all duration-500 ${rightHand ? 'border-primary/40' : 'hover:border-primary/20'}`}
                        onClick={() => !rightHand && rightInputRef.current?.click()}
                    >
                        <AnimatePresence mode="wait">
                            {rightHand ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full relative"
                                >
                                    <img src={rightHand} alt="Derecha" className="w-full h-full object-cover rounded-[1.8rem]" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-8">
                                        <button
                                            onClick={(e) => removeImage(e, 'right')}
                                            className="bg-red-500/20 hover:bg-red-500/40 text-red-100 p-3 rounded-full backdrop-blur-md transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-primary/20 backdrop-blur-md p-2 rounded-full border border-primary/40">
                                        <CheckCircle2 size={16} className="text-primary" />
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="flex flex-col items-center gap-4 text-center p-8"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <Camera size={32} className="text-primary/60 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Define tu presente</p>
                                        <p className="text-xs text-muted-foreground mt-1">Sube la foto de tu palma derecha</p>
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
                    {/* Animated background for button */}
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
                                <span>Diseccionando el Tao...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className={leftHand && rightHand ? "animate-pulse" : ""} />
                                <span>Iniciar Diagnóstico</span>
                            </>
                        )}
                    </span>
                </motion.button>

                <AnimatePresence>
                    {!leftHand || !rightHand ? (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-muted-foreground text-sm font-light tracking-wide flex items-center gap-2"
                        >
                            <AlertCircle size={14} />
                            Sube ambas palmas para que la IA pueda contrastar tu energía
                        </motion.p>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}
