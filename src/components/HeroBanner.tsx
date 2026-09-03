import React from 'react';
import { Sparkles, Utensils, HeartPulse, Zap, ShieldCheck, ArrowRight, Gift, Wallet, Camera } from 'lucide-react';

interface HeroBannerProps {
  onOpenAIGenerator: () => void;
  onOpenRecipeModal: () => void;
  onOpenNutritionModal: () => void;
  onOpenBudgetBasket?: () => void;
  onOpenSnapAndRestock?: () => void;
  onSelectCategory: (catId: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenAIGenerator,
  onOpenRecipeModal,
  onOpenNutritionModal,
  onOpenBudgetBasket,
  onOpenSnapAndRestock,
  onSelectCategory,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Main Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-800/40">
        {/* Subtle decorative glow shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Next-Gen Smart Delivery • 15 Minute Guarantee</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Groceries Delivered in <span className="text-emerald-400 underline decoration-amber-400/80 decoration-wavy decoration-2">Minutes</span> with AI Precision.
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              Describe your weekly meal plan, dietary goals, or party needs. InstaCart AI auto-builds your cart with fresh local produce & farm essentials.
            </p>

            {/* AI Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenAIGenerator}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-100" />
                ⚡ Build AI Grocery List
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              {onOpenSnapAndRestock && (
                <button
                  onClick={onOpenSnapAndRestock}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  Snap & Restock
                </button>
              )}

              <button
                onClick={onOpenRecipeModal}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-amber-300" />
                🍳 Recipe to Cart
              </button>

              <button
                onClick={onOpenNutritionModal}
                className="bg-white/10 hover:bg-white/20 text-slate-200 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
              >
                <HeartPulse className="w-4 h-4 text-rose-400" />
                🥗 Diet Advisor
              </button>

              {onOpenBudgetBasket && (
                <button
                  onClick={onOpenBudgetBasket}
                  className="bg-white/10 hover:bg-white/20 text-amber-200 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-md border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-amber-400" />
                  💰 Budget Basket
                </button>
              )}
            </div>
          </div>

          {/* Promo Callout Card */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1">
                <Gift className="w-4 h-4" /> Welcome Coupon
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-black text-white">20% OFF FIRST ORDER</div>
              <p className="text-[11px] text-slate-300">
                Use promo code <span className="bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded font-black tracking-widest font-mono">INSTA20</span> at checkout.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Quality Checked
              </span>
              <span>Free Delivery &gt;₹299</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
