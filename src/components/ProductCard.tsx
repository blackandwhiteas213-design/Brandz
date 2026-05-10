import React, { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { getContrastColor } from '../lib/utils';
import { DEFAULT_SIZES } from '../constants';
import { translations } from '../lib/translations';

interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number, size: string, color?: string) => void;
  onZoom: (image: string) => void;
  isFav: boolean;
  onToggleFav: (id: number) => void;
  accentColor: string;
  lang: 'en' | 'ar';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onZoom,
  isFav,
  onToggleFav,
  accentColor,
  lang
}) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';
  
  const sizes = product.sizes?.length ? product.sizes : DEFAULT_SIZES;
  const colors = product.colors || [];
  
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  
  const contrastColor = getContrastColor(accentColor);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock > 0 && product.stock < 5;

  return (
    <div className="bg-neutral-900/90 rounded-2xl overflow-hidden border border-neutral-800 transition-all duration-300 hover:border-white/20 group relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Image Section */}
      <div 
        className="h-[240px] overflow-hidden relative cursor-zoom-in bg-black"
        onClick={() => onZoom(product.image)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(product.id);
          }}
          className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} w-9 h-34 rounded-full flex items-center justify-center z-10 transition-colors ${
            isFav ? 'bg-red-500 text-white' : 'bg-black/60 text-white hover:bg-neutral-800'
          }`}
          style={{ height: '36px', width: '36px' }}
        >
          <Heart size={18} fill={isFav ? "currentColor" : "none"} />
        </button>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-black text-xs tracking-widest uppercase">
              {t.stockOut}
            </span>
          </div>
        )}

        {isLowStock && (
          <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold text-[10px] z-10`}>
            {t.stockLow.replace('{n}', String(product.stock))}
          </div>
        )}

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider line-clamp-1">
            {product.name}
          </h3>
          <div className="text-xl font-black mt-1" style={{ color: accentColor }}>
            {product.price} {t.egp}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              disabled={isOutOfStock}
              className={`w-full bg-neutral-800 text-white border border-neutral-700 rounded-lg ${isRtl ? 'pr-3 pl-8' : 'pl-3 pr-8'} py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 appearance-none`}
            >
              {sizes.map(size => (
                <option key={size} value={size}>{t.selectSize}: {size}</option>
              ))}
            </select>
          </div>

          {colors.length > 0 && (
            <div className="relative">
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                disabled={isOutOfStock}
                className={`w-full bg-neutral-800 text-white border border-neutral-700 rounded-lg ${isRtl ? 'pr-3 pl-8' : 'pl-3 pr-8'} py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 appearance-none`}
              >
                {colors.map(color => (
                  <option key={color} value={color}>{t.selectColor}: {color}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={() => !isOutOfStock && onAddToCart(product.id, selectedSize, selectedColor)}
          disabled={isOutOfStock}
          className="w-full py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-neutral-800 disabled:text-neutral-500"
          style={{ 
            backgroundColor: isOutOfStock ? undefined : accentColor,
            color: isOutOfStock ? undefined : contrastColor
          }}
        >
          <ShoppingCart size={14} />
          {isOutOfStock ? t.stockOut : t.addToCart}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

