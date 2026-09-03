import React from 'react';
import { Product } from '../types';
import { Plus, Minus, Star, Zap, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, qty: number) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
  onQuickView,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Image & Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallbackTried) {
              target.dataset.fallbackTried = 'true';
              target.src = 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80';
            }
          }}
        />

        {/* Gradient Overlay for Top Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isFlashDeal && (
            <span className="bg-amber-400 text-amber-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-950" /> Flash Sale
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              SAVE ₹{product.originalPrice - product.price}
            </span>
          )}
        </div>

        {/* Quick View Floating Button */}
        <button
          onClick={() => onQuickView(product)}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:text-emerald-700 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
          title="Quick View Details"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Stock Warning Badge */}
        {isOutOfStock ? (
          <div className="absolute bottom-2 left-2.5 right-2.5 bg-slate-900/90 text-white text-[11px] font-bold py-1 px-2 rounded-lg text-center backdrop-blur-xs">
            Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-2 left-2.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
            Only {product.stock} left!
          </div>
        ) : null}
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Dietary Tags */}
          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            {(product.dietaryTags || []).slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/60"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 cursor-pointer transition-colors leading-snug"
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-slate-500 font-medium mt-0.5">{product.unit}</p>
        </div>

        {/* Rating & Price Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 mb-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Add / Quantity Control Button */}
          <div>
            {quantityInCart === 0 ? (
              <button
                disabled={isOutOfStock}
                onClick={() => onAddToCart(product)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                ADD
              </button>
            ) : (
              <div className="flex items-center bg-emerald-700 text-white rounded-xl shadow-md p-0.5">
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-emerald-800 rounded-lg font-bold transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-black">{quantityInCart}</span>
                <button
                  onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-emerald-800 rounded-lg font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
