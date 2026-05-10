import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 20, opacity: 0, x: "-50%" }}
          className="fixed bottom-8 left-1/2 z-[5000] bg-white text-black px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl pointer-events-none"
        >
          <CheckCircle2 size={18} />
          <span className="text-sm font-black uppercase tracking-tight">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
