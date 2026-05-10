import React, { useState, useEffect, useRef } from 'react';
import { Instagram, ShoppingBag, Heart, Menu, X, ArrowRight, Share2, Languages } from 'lucide-react';
import StarBackground from './components/StarBackground';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import Toast from './components/Toast';
import ZoomModal from './components/ZoomModal';
import ShareModal from './components/ShareModal';
import { getStorage, setStorage, getContrastColor } from './lib/utils';
import { INITIAL_PRODUCTS } from './constants';
import { Product, CartItem, Order, PromoCode } from './types';
import { translations } from './lib/translations';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => getStorage("brandz_products", INITIAL_PRODUCTS));
  const [cart, setCart] = useState<CartItem[]>(() => getStorage("brandz_cart_v2", []));
  const [favorites, setFavorites] = useState<Set<number>>(() => new Set(getStorage<number[]>("brandz_favs", [])));
  const [promos, setPromos] = useState<PromoCode[]>(() => getStorage("brandz_promos", []));
  const [orders, setOrders] = useState<Order[]>(() => getStorage("brandz_orders", []));
  const [accentColor, setAccentColor] = useState(() => getStorage("brandz_accent", "#ffffff"));
  const [whatsappNumber, setWhatsappNumber] = useState(() => getStorage("brandz_whatsapp", "201032834797"));
  const [lang, setLang] = useState<'en' | 'ar'>(() => getStorage<'en' | 'ar'>("brandz_lang", "en"));
  
  const [isFavoritesFilter, setIsFavoritesFilter] = useState(false);

  const [cartOpen, setCartOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [zoomedImage, setZoomedImage] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);

  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [accentColor, lang]);

  function toggleLang() {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    setStorage("brandz_lang", newLang);
  }

  const t = translations[lang];
  const isRtl = lang === 'ar';

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastVisible(false), 2000);
  }

  function toggleFavorite(id: number) {
    const newFavs = new Set(favorites);
    if (newFavs.has(id)) newFavs.delete(id);
    else newFavs.add(id);
    setFavorites(newFavs);
    setStorage("brandz_favs", [...newFavs]);
  }

  function addToCart(id: number, size: string, color?: string) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const key = `${id}-${size}-${color || ""}`;
    const existing = cart.find(item => item.key === key);
    
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.key === key ? { ...item, qty: item.qty + 1 } : item);
    } else {
      newCart = [...cart, {
        key,
        productId: id,
        name: product.name,
        image: product.image,
        price: product.price,
        size,
        color,
        qty: 1
      }];
    }
    setCart(newCart);
    setStorage("brandz_cart_v2", newCart);
    showToast(t.addedToCart);
  }

  function handleOrderPlaced(order: Order, items: CartItem[]) {
    // Save order
    const newOrders = [...orders, order];
    setOrders(newOrders);
    setStorage("brandz_orders", newOrders);

    // Update stock
    const newProducts = products.map(p => {
      const orderQty = items
        .filter(it => it.productId === p.id)
        .reduce((sum, it) => sum + it.qty, 0);
      
      if (orderQty && p.stock !== undefined) {
        return { ...p, stock: Math.max(0, p.stock - orderQty) };
      }
      return p;
    });
    setProducts(newProducts);
    setStorage("brandz_products", newProducts);

    // Clear cart
    setCart([]);
    setStorage("brandz_cart_v2", []);
    setCartOpen(false);
    showToast(t.orderPlaced);
  }

  function handleLogoClick() {
    const clicks = adminClicks + 1;
    setAdminClicks(clicks);
    if (clicks >= 5) {
      setAdminClicks(0);
      setAdminLoginOpen(true);
    }
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const displayedProducts = isFavoritesFilter 
    ? products.filter(p => favorites.has(p.id)) 
    : products;

  const contrastColor = getContrastColor(accentColor);

  return (
    <div className="min-h-screen relative flex flex-col pt-20">
      <StarBackground />
      
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-20 bg-black/80 backdrop-blur-xl border-b border-white/5 z-[1000] flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div 
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="relative">
              <img 
                src="https://i.ibb.co/8ZNvPFY/IMG-20260421-WA0067.jpg" 
                alt="BRANDZ" 
                className="w-10 h-10 rounded-full border border-white group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-white/20 rounded-full blur group-hover:blur-md transition-all opacity-0 group-hover:opacity-100" />
            </div>
            <span className="text-2xl font-black tracking-tighter leading-none">{t.brand}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={toggleLang}
              className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl hover:bg-neutral-800 transition-colors text-white font-black text-xs min-w-[3.5rem]"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>
            <button 
              onClick={() => setShareOpen(true)}
              className="p-3 bg-neutral-900 border border-white/10 rounded-xl hover:bg-neutral-800 transition-colors text-white"
            >
              <Share2 size={20} />
            </button>
            <a 
              href="https://www.instagram.com/brandz_store2026" 
              target="_blank" 
              className="p-3 bg-neutral-900 border border-white/10 rounded-xl hover:bg-neutral-800 transition-colors text-white"
            >
              <Instagram size={20} />
            </a>
            <button 
              onClick={() => setCartOpen(true)}
              className="relative p-3 bg-white text-black rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95"
              style={{ backgroundColor: accentColor, color: contrastColor }}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black h-5 min-w-5 px-1 rounded-full flex items-center justify-center border-2 border-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero / Filter Bar */}
      <div className="sticky top-20 z-50 bg-black/40 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex bg-neutral-900/80 p-1.5 rounded-2xl border border-white/5 w-full sm:w-auto">
            <button 
              onClick={() => setIsFavoritesFilter(false)}
              className={`flex-1 sm:px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                !isFavoritesFilter ? 'bg-white text-black' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              style={!isFavoritesFilter ? { backgroundColor: accentColor, color: contrastColor } : {}}
            >
              {t.collection}
            </button>
            <button 
              onClick={() => setIsFavoritesFilter(true)}
              className={`flex-1 sm:px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${
                isFavoritesFilter ? 'bg-red-500 text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              <Heart size={12} fill={isFavoritesFilter ? "currentColor" : "none"} />
              {t.favorites} ({favorites.size})
            </button>
          </div>

          <a 
            href="https://www.instagram.com/brandz_store2026"
            target="_blank"
            className="hidden lg:flex items-center gap-4 bg-neutral-900 p-3 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-sm font-bold uppercase tracking-tight group"
          >
            <Instagram size={18} className="text-pink-500" />
            <span>{t.followDrops}</span>
            <ArrowRight size={14} className={`group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180' : ''}`} />
          </a>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
        {displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-neutral-500 gap-6">
            <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center border border-white/5">
              <ShoppingBag size={32} />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-black uppercase tracking-widest text-white">{isFavoritesFilter ? t.favorites : t.collection}</h2>
              <p className="text-sm font-bold mt-1">
                {isFavoritesFilter ? (lang === 'ar' ? 'لم تقم بحفظ أي موديلات بعد.' : "You haven't saved any styles yet.") : (lang === 'ar' ? 'يتم تحديث المخزون حالياً.' : "Our inventory is being refreshed.")}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onZoom={setZoomedImage}
                onToggleFav={toggleFavorite}
                isFav={favorites.has(product.id)}
                accentColor={accentColor}
                lang={lang}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Summary (Desktop sticky) */}
      <div 
        onClick={() => setCartOpen(true)}
        className={`fixed bottom-10 ${isRtl ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'} z-[1500] cursor-pointer group px-1`}
      >
        <div 
          className="flex items-center gap-3 px-8 py-4 rounded-full shadow-2xl transition-all transform active:scale-95 hover:scale-105"
          style={{ backgroundColor: cartCount > 0 ? accentColor : '#171717', color: cartCount > 0 ? contrastColor : '#fff' }}
        >
          <ShoppingBag size={20} className={cartCount > 0 ? "" : "text-neutral-500"} />
          <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">
            {t.cart} {cartCount > 0 && `(${cartCount})`}
          </span>
        </div>
      </div>

      <CartDrawer
        cart={cart}
        setCart={setCart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        promoCodes={promos}
        accentColor={accentColor}
        whatsappNumber={whatsappNumber}
        lang={lang}
        onOrderPlaced={handleOrderPlaced}
      />

      <AdminLogin
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={() => {
          setAdminLoginOpen(false);
          setAdminPanelOpen(true);
        }}
      />

      {adminPanelOpen && (
        <AdminPanel
          products={products}
          setProducts={setProducts}
          promoCodes={promos}
          setPromoCodes={setPromos}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          whatsappNumber={whatsappNumber}
          setWhatsappNumber={setWhatsappNumber}
          orders={orders}
          onClose={() => setAdminPanelOpen(false)}
        />
      )}

      <ZoomModal src={zoomedImage} onClose={() => setZoomedImage("")} />
      <ShareModal 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        accentColor={accentColor} 
        onCopy={() => showToast(t.linkCopied)}
        lang={lang}
      />
      <Toast message={toastMsg} visible={toastVisible} />

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black/40 backdrop-blur-3xl mt-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
          <div className="flex items-center gap-3">
             <img 
               src="https://i.ibb.co/8ZNvPFY/IMG-20260421-WA0067.jpg" 
               alt="BRANDZ" 
               className="w-10 h-10 rounded-full border border-white"
             />
             <span className="text-2xl font-black tracking-tighter">{t.brand}</span>
          </div>
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest leading-relaxed max-w-md">
            {lang === 'ar' ? 'ستايلات فاخرة مختارة لمن يقودون. توصيل لجميع المحافظات.' : 'Premium styles curated for those who lead. Worldwide delivery available.'}
          </p>
          <div className="flex gap-6">
            <a href="https://www.instagram.com/brandz_store2026" target="_blank" className="p-3 bg-neutral-900 rounded-full hover:bg-neutral-800 transition-colors border border-white/5"><Instagram size={20} /></a>
          </div>
          <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">© 2026 {t.brand}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
