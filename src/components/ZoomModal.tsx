import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ZoomModalProps {
  src: string;
  onClose: () => void;
}

export default function ZoomModal({ src, onClose }: ZoomModalProps) {
  return (
    <AnimatePresence>
      {src && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-full max-h-full flex items-center justify-center"
          >
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
            <img 
              src={src} 
              alt="" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
