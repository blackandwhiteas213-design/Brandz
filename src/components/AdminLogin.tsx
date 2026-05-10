import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, X } from 'lucide-react';
import { ADMIN_PASSCODE } from '../constants';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminLogin({ isOpen, onClose, onSuccess }: AdminLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      onSuccess();
      setPasscode("");
      setError(false);
    } else {
      setError(true);
      setPasscode("");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl w-full max-w-sm relative shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
            
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black">
                <ShieldCheck size={32} />
              </div>
              
              <div>
                <h3 className="text-xl font-black">Admin Access</h3>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Personnel Only</p>
              </div>

              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(false);
                  }}
                  placeholder="PROTECTION KEY"
                  className={`w-full bg-black border ${error ? 'border-red-500 animate-shake' : 'border-neutral-800'} px-4 py-4 rounded-xl text-center font-black tracking-[0.5em] focus:outline-none focus:border-white transition-all`}
                  autoFocus
                />
                
                {error && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest italic">Invalid Security Key</p>
                )}

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 font-black uppercase text-[10px] tracking-widest text-neutral-500 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-neutral-200 transition-colors"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
