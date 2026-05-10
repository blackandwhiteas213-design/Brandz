import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Link, MessageCircle, Facebook, Twitter, Send, Instagram, Music2, Ghost } from 'lucide-react';
import { getContrastColor } from '../lib/utils';
import { translations } from '../lib/translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
  onCopy: () => void;
  lang: 'en' | 'ar';
}

export default function ShareModal({ isOpen, onClose, accentColor, onCopy, lang }: ShareModalProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  
  const shareUrl = window.location.href;
  const shareText = lang === 'ar' ? "شاهد براندز لأحدث الموديلات الفاخرة!" : "Check out BRANDZ Store for the latest premium styles!";
  const contrastColor = getContrastColor(accentColor);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: '#25D366'
    },
    {
      name: 'Instagram',
      icon: <Instagram size={20} />,
      url: `https://www.instagram.com/`,
      color: '#E4405F'
    },
    {
      name: 'TikTok',
      icon: <Music2 size={20} />,
      url: `https://www.tiktok.com/`,
      color: '#ffffff'
    },
    {
      name: 'Snapchat',
      icon: <Ghost size={20} />,
      url: `https://www.snapchat.com/share?url=${encodeURIComponent(shareUrl)}`,
      color: '#FFFC00'
    },
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: '#1877F2'
    },
    {
      name: 'X (Twitter)',
      icon: <Twitter size={20} />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: '#ffffff'
    },
    {
      name: 'Telegram',
      icon: <Send size={20} />,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: '#0088cc'
    }
  ];

  function copyToClipboard() {
    navigator.clipboard.writeText(shareUrl);
    onCopy();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
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
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-black" style={{ backgroundColor: accentColor }}>
                <Link size={32} style={{ color: contrastColor }} />
              </div>

              <div>
                <h3 className="text-xl font-black">{t.share}</h3>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">{t.spreadStyle}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 bg-black border border-neutral-800 rounded-2xl transition-all hover:border-neutral-600 group"
                  >
                    <div style={{ color: option.color }}>
                      {option.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{option.name}</span>
                  </a>
                ))}
              </div>

              <button
                onClick={copyToClipboard}
                className="w-full py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
              >
                <Link size={14} />
                {t.copyLink}
              </button>

              <button
                onClick={onClose}
                className="py-1 px-4 font-black uppercase text-[10px] tracking-widest text-neutral-500 hover:text-white transition-colors"
              >
                {t.dismiss}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

