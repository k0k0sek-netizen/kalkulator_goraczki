'use client';

import { motion } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatTriggerProps {
    onClick: () => void;
    className?: string;
}

export function ChatTrigger({ onClick, className }: ChatTriggerProps) {
    return (
        <motion.button
            onClick={onClick}
            className={cn("relative group cursor-pointer outline-none", className)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
        >
            {/* 1. Outer Glow Ring (Breathing) */}
            <motion.div
                className="absolute -inset-2 rounded-full bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-500"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* 2. Rotating Border Ring */}
            <motion.div
                className="absolute inset-0 rounded-full border border-emerald-400/30 border-t-emerald-400 border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* 3. Reverse Rotating Inner Ring */}
            <motion.div
                className="absolute inset-[2px] rounded-full border border-cyan-400/20 border-b-cyan-400 border-r-transparent"
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />

            {/* 4. Core Button (Glass Orb) */}
            <div className="relative h-12 w-12 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center p-0 shadow-xl overflow-hidden">

                {/* Internal Fluid Background */}
                <div className="absolute inset-0 bg-linear-to-tr from-emerald-500/10 via-transparent to-cyan-500/10 group-hover:from-emerald-500/20 group-hover:to-cyan-500/20 transition-colors duration-300" />

                {/* Icon Layer */}
                <div className="relative z-10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    <motion.div
                        className="absolute -top-1 -right-1"
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Sparkles className="h-3 w-3 text-cyan-300" />
                    </motion.div>
                </div>
            </div>

            {/* Label (Optional tooltip-like) */}
            <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-emerald-400/80 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ y: -5 }}
                whileHover={{ y: 0 }}
            >
                AI Assistant
            </motion.div>
        </motion.button>
    );
}
