import React from 'react';
import { Product } from '../types';
import { Star, Zap, ShieldCheck, Flame, Plus, Minus, X, CheckCircle2 } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: string, qty: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  quantityInCart,
  onAddToCart,
  onUpdateQuantity,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/40 hover:bg-slate-900/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto">
          {/* Image Header */}
          <div className="relative aspect-16/10 bg-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {product.categoryName}
                </span>
                {product.isFlashDeal && (
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-slate-950" /> Flash Sale
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold">{product.name}</h2>
              <p className="text-xs text-slate-200 font-medium">{product.unit}</p>
            </div>
          </div>

          {/* Details Content */}
          <div className="p-6 space-y-5">
            {/* Price & Rating Row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                  ⚡ Guaranteed 15-Minute Cold Chain Delivery
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400 text-xs font-normal">({product.reviewsCount} reviews)</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">Stock: {product.stock} units</span>
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Description</h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">{product.description}</p>
            </div>

            {/* Dietary Tags & Nutritional Quick Specs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Dietary Standards
                </span>
                <div className="flex flex-wrap gap-1">
                  {(product.dietaryTags || []).map((tag, i) => (
                    <span key={i} className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              {product.calories && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Calories</span>
                    <span className="text-sm font-black text-slate-800">{product.calories} kcal / serving</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quality Commitment Notice */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">100% Quality & Freshness Guarantee</span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  If you are not satisfied with the freshness or quality of this item upon delivery, instant 1-click refund will be credited to your account.
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Price</span>
              <span className="text-xl font-black text-slate-900">
                ₹{(quantityInCart || 1) * product.price}
              </span>
            </div>

            <div>
              {quantityInCart === 0 ? (
                <button
                  onClick={() => onAddToCart(product)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add to Shopping Cart
                </button>
              ) : (
                <div className="flex items-center bg-emerald-700 text-white rounded-2xl p-1 shadow-md">
                  <button
                    onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-emerald-800 rounded-xl font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-black text-sm">{quantityInCart}</span>
                  <button
                    onClick={() => onUpdateQuantity(product.id, quantityInCart + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-emerald-800 rounded-xl font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
