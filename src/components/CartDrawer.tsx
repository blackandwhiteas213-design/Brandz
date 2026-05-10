import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, Tag, Send } from 'lucide-react';
import { CartItem, PromoCode, Order } from '../types';
import { setStorage, getContrastColor } from '../lib/utils';
import { WHATSAPP_NUMBER } from '../constants';
import { GOVERNORATES, CITIES, translations } from '../lib/translations';

interface CartDrawerProps {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
  promoCodes: PromoCode[];
  accentColor: string;
  whatsappNumber: string;
  lang: 'en' | 'ar';
  onOrderPlaced: (order: Order, items: CartItem[]) => void;
}

export default function CartDrawer({
  cart,
  setCart,
  isOpen,
  onClose,
  promoCodes,
  accentColor,
  whatsappNumber,
  lang,
  onOrderPlaced
}: CartDrawerProps) {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState(GOVERNORATES[0].en);
  const availableCities = CITIES[governorate] || [];
  const [city, setCity] = useState(availableCities[0]?.[lang] || "");
  const [address, setAddress] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [activePromo, setActivePromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoInputError] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discount = activePromo ? Math.round(subtotal * (activePromo.discount / 100)) : 0;
  const total = subtotal - discount;
  const contrastColor = getContrastColor(accentColor);

  function updateQty(key: string, delta: number) {
    const newCart = cart.map(item => 
      item.key === key ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ).filter(item => item.qty > 0);
    setCart(newCart);
    setStorage("brandz_cart_v2", newCart);
  }

  function removeItem(key: string) {
    const newCart = cart.filter(item => item.key !== key);
    setCart(newCart);
    setStorage("brandz_cart_v2", newCart);
  }

  function applyPromo() {
    const promo = promoCodes.find(p => p.code === promoInput.trim().toUpperCase() && p.active);
    if (promo) {
      setActivePromo(promo);
      setPromoInputError(`${lang === 'ar' ? 'تم التفعيل!' : 'Applied!'} ${promo.discount}% off`);
    } else {
      setPromoInputError(lang === 'ar' ? 'كود غير صحيح' : "Invalid or expired code");
    }
  }

  function handleOrder() {
    if (!name || !phone || !city || !address) {
      alert(lang === 'ar' ? "يرجى ملء جميع البيانات" : "Please fill in all delivery details");
      return;
    }
    if (!cart.length) return;

    const itemsList = cart.map(item => 
      `• ${item.name}${item.color ? ` (${item.color})` : ""} (Size ${item.size}) x${item.qty} = ${item.price * item.qty} EGP`
    ).join('\n');

    let waMessage = `*BRANDZ Store Order*\n\n`;
    const governorateLabel = GOVERNORATES.find(g => g.en === governorate)?.[lang] || governorate;
    waMessage += `Name: ${name}\nPhone: ${phone}\nGovernorate: ${governorateLabel}\nCity: ${city}\nAddress: ${address}\n\n`;
    waMessage += `*Items:*\n${itemsList}\n\n`;
    waMessage += `Subtotal: ${subtotal} EGP\n`;
    if (discount > 0) waMessage += `Discount (${activePromo?.code}): -${discount} EGP\n`;
    waMessage += `*Total: ${total} EGP*`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`, "_blank");

    const order: Order = {
      id: Date.now(),
      date: new Date().toLocaleString("en-GB", { 
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
      }),
      name, phone, city,
      governorate: GOVERNORATES.find(g => g.en === governorate)?.[lang] || governorate,
      address,
      items: cart.map(i => ({ name: i.name, size: i.size, color: i.color, qty: i.qty, price: i.price })),
      subtotal, discount, total,
      promoCode: activePromo?.code
    };

    onOrderPlaced(order, cart);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000]"
          />
          <motion.div
            initial={{ x: isRtl ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`fixed top-0 ${isRtl ? 'left-0' : 'right-0'} w-full max-w-md h-full bg-neutral-950 border-neutral-800 z-[2001] flex flex-col shadow-2xl ${isRtl ? 'border-r' : 'border-l'}`}
          >
            <div className="p-4 border-bottom border-neutral-800 flex justify-between items-center bg-neutral-900/50">
              <h2 className="text-xl font-black">{t.cart} ({cart.length})</h2>
              <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
                  <div className="text-4xl">🛒</div>
                  <p className="font-bold">{t.emptyCart}</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.key} className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex gap-4">
                    <img src={item.image} alt="" className="w-16 h-16 object-cover rounded-lg border border-neutral-700" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-neutral-400 mt-1">
                        {t.selectSize}: {item.size} {item.color && `· ${item.color}`} · {item.price * item.qty} {t.egp}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-black border border-neutral-800 rounded-full p-0.5">
                          <button onClick={() => updateQty(item.key, -1)} className="p-1 hover:text-white text-neutral-500">
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-xs">{item.qty}</span>
                          <button onClick={() => updateQty(item.key, 1)} className="p-1 hover:text-white text-neutral-500">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.key)} className="text-neutral-600 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-neutral-900/80 border-t border-neutral-800 space-y-3">
                {/* Promo Code section */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-neutral-500`} size={14} />
                      <input
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        disabled={!!activePromo}
                        placeholder={t.promoCode}
                        className={`w-full bg-black border border-neutral-800 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 rounded-lg text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-neutral-600 disabled:opacity-50`}
                      />
                    </div>
                    <button 
                      onClick={applyPromo}
                      className="px-4 py-2 rounded-lg font-black text-xs transition-opacity hover:opacity-90"
                      style={{ backgroundColor: accentColor, color: contrastColor }}
                    >
                      {t.apply}
                    </button>
                  </div>
                  {promoError && (
                    <p className={`text-[10px] font-bold ${activePromo ? 'text-green-500' : 'text-red-500'}`}>
                      {promoError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 py-2 border-y border-neutral-800/50">
                  <div className="flex justify-between text-xs text-neutral-400 font-bold">
                    <span>{t.subtotal}</span>
                    <span>{subtotal} {t.egp}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-green-500 font-bold">
                      <span>{t.discount} ({activePromo?.code})</span>
                      <span>-{discount} {t.egp}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-black pt-1">
                    <span>{t.total}</span>
                    <span>{total} {t.egp}</span>
                  </div>
                </div>

                {/* Delivery Form */}
                <div className="space-y-2 pt-2 text-white">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullName}
                    className="w-full bg-black border border-neutral-800 px-3 py-2 rounded-lg text-sm transition-all focus:border-neutral-600 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.phoneNumber}
                      type="tel"
                      className="bg-black border border-neutral-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-neutral-600"
                    />
                    <select
                      value={governorate}
                      onChange={(e) => {
                        const newGov = e.target.value;
                        setGovernorate(newGov);
                        const newCities = CITIES[newGov] || [];
                        setCity(newCities[0]?.[lang] || "");
                      }}
                      className="bg-black border border-neutral-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-neutral-600 appearance-none"
                    >
                      {GOVERNORATES.map(gov => (
                        <option key={gov.en} value={gov.en}>{gov[lang]}</option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-black border border-neutral-800 px-3 py-2 rounded-lg text-sm transition-all focus:border-neutral-600 focus:outline-none appearance-none"
                  >
                    {!availableCities.length && <option value="">{t.city}</option>}
                    {availableCities.map(c => (
                      <option key={c.en} value={c[lang]}>{c[lang]}</option>
                    ))}
                  </select>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.address}
                    className="w-full bg-black border border-neutral-800 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <button
                  onClick={handleOrder}
                  className="w-full py-4 rounded-xl font-black flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-95 hover:opacity-95"
                  style={{ backgroundColor: accentColor, color: contrastColor }}
                >
                  <Send size={18} className={isRtl ? 'rotate-180' : ''} />
                  {t.checkout}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

