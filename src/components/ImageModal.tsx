import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ImageModalProps {
    src: string;
    alt?: string;
    open: boolean;
    onClose: () => void;
}

export function ImageModal({ src, alt, open, onClose }: ImageModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center justify-center"
                    >
                        <button
                            onClick={onClose}
                            className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full backdrop-blur-md"
                        >
                            <X size={24} />
                        </button>
                        <img 
                            src={src} 
                            alt={alt || "Image preview"} 
                            className="rounded-2xl max-w-full max-h-[85vh] object-contain shadow-2xl"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
