import React, { useState } from 'react';
import { ShoppingBag, X, Plus, Minus, Trash2, Tag, ArrowRight, HeartPulse, Sparkles, Loader2, Lock, User, LogIn } from 'lucide-react';
import { CartItem, CustomerUser } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  appliedCoupon: string;
  setAppliedCoupon: (code: string) => void;
  tipAmount: number;
  setTipAmount: (tip: number) => void;
  onOpenNutritionAdvisor?: () => void;
  currentCustomer?: CustomerUser | null;
  onOpenAuthModal?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedCoupon,
  setAppliedCoupon,
  tipAmount,
  setTipAmount,
  onOpenNutritionAdvisor,
  currentCustomer,
  onOpenAuthModal,
}) => {
  const [couponInput, setCouponInput] = useState(appliedCoupon);
  const [couponError, setCouponError] = useState('');
  const [nutritionAdvisor, setNutritionAdvisor] = useState<{ score: number; verdict: string; recommendations: string[] } | null>(null);
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false);

  if (!isOpen) return null;

  const FREE_DELIVERY_THRESHOLD = 299;
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = appliedCoupon === 'INSTA20' ? Math.round(subtotal * 0.20) : 0;
  const deliveryFee = subtotal === 0 ? 0 : (subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 29);
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = Math.max(0, subtotal - discount + deliveryFee + tax + tipAmount);

  const handleApplyCoupon = () => {
    if (couponInput.trim().toUpperCase() === 'INSTA20') {
      setAppliedCoupon('INSTA20');
      setCouponError('');
    } else {
      setCouponError('Invalid coupon. Try INSTA20 for 20% off!');
    }
  };

  const handleAnalyzeCartWithAI = async () => {
    if (cart.length === 0) return;
    setIsAnalyzingNutrition(true);

    try {
      const res = await fetch('/api/ai/nutrition-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((c) => ({ name: c.product.name, qty: c.quantity, tags: c.product.dietaryTags })),
          goal: 'Balanced Health & Vitality',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setNutritionAdvisor(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingNutrition(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900">Your Shopping Basket</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Your cart is currently empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add fresh produce, bakery, dairy, or use our AI Grocery Generator to auto-fill your cart!
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Sign-In Requirement Alert Notice */}
                {!currentCustomer && (
                  <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600" /> Sign in required first
                      </span>
                      {onOpenAuthModal && (
                        <button
                          onClick={onOpenAuthModal}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-2.5 py-0.5 rounded-lg text-[10px] transition-all"
                        >
                          Sign In
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Please sign in to your account before proceeding to direct payment & checkout.
                    </p>
                  </div>
                )}

                {/* Delivery Progress Bar */}
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs space-y-1.5">
                  <div className="flex justify-between font-bold text-emerald-900">
                    <span>
                      {subtotal >= FREE_DELIVERY_THRESHOLD
                        ? '🎉 You unlocked Free Delivery!'
                        : `Add ₹${FREE_DELIVERY_THRESHOLD - subtotal} more for FREE delivery`}
                    </span>
                    <span>15-min ETA</span>
                  </div>
                  <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* AI Nutrition Advisor Trigger */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  {!nutritionAdvisor ? (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={handleAnalyzeCartWithAI}
                        disabled={isAnalyzingNutrition}
                        className="flex-1 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-teal-700"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-teal-600" /> Analyze Cart Health
                        </span>
                        {isAnalyzingNutrition ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="text-[10px] text-teal-700 font-extrabold bg-teal-100 px-2 py-0.5 rounded">
                            QUICK
                          </span>
                        )}
                      </button>

                      {onOpenNutritionAdvisor && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenNutritionAdvisor();
                          }}
                          className="text-[10px] font-black text-white bg-teal-600 hover:bg-teal-700 px-2.5 py-1 rounded-lg shrink-0"
                        >
                          FULL DIET AI
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1 text-teal-900 font-extrabold">
                          <HeartPulse className="w-4 h-4 text-rose-500" /> {nutritionAdvisor.verdict}
                        </span>
                        <span className="bg-teal-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                          Score {nutritionAdvisor.score}/100
                        </span>
                      </div>
                      {(nutritionAdvisor.recommendations || []).map((rec, i) => (
                        <p key={i} className="text-[11px] text-slate-600 leading-snug">
                          • {rec}
                        </p>
                      ))}
                      {onOpenNutritionAdvisor && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenNutritionAdvisor();
                          }}
                          className="mt-1 text-[11px] font-bold text-teal-700 hover:underline block"
                        >
                          → Open Full AI Diet & Macro Advisor
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-white shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">{item.product.unit}</span>
                          <span className="text-xs font-black text-slate-900 block mt-0.5">
                            ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg font-bold"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-700 hover:bg-white rounded-lg font-bold"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-slate-300 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Tip Selector */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Add Driver Tip (100% goes to partner)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 30, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTipAmount(amount)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          tipAmount === amount
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        ₹{amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pt-1">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Promo code (INSTA20)"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 uppercase placeholder:normal-case outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-800"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon === 'INSTA20' && (
                    <p className="text-[11px] font-bold text-emerald-600 mt-1">
                      ✓ Coupon INSTA20 applied (20% OFF)
                    </p>
                  )}
                  {couponError && <p className="text-[11px] text-rose-500 font-medium mt-1">{couponError}</p>}
                </div>
              </>
            )}
          </div>

          {/* Footer Breakdown & Checkout Button */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>AI Savings (INSTA20)</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <span className="font-bold text-emerald-600">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between">
                    <span>Taxes & Govt Charges (5%)</span>
                    <span>₹{tax}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Driver Tip</span>
                  <span>₹{tipAmount}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-base text-emerald-800">₹{totalAmount}</span>
                </div>
              </div>

              {!currentCustomer ? (
                <div className="space-y-2 pt-1">
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs space-y-0.5">
                    <p className="font-extrabold flex items-center gap-1.5 text-amber-900">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" /> Sign in required to pay
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium">
                      You are currently browsing as a guest. Please sign in or create an account to proceed to payment.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal();
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 transition-all"
                  >
                    <LogIn className="w-4 h-4" /> Sign In / Register to Checkout
                  </button>
                </div>
              ) : (
                <button
                  onClick={onProceedToCheckout}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-98 transition-all"
                >
                  Proceed to Payment Checkout <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
