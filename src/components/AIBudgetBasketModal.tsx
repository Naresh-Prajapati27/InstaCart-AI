import React, { useState } from 'react';
import {
  Wallet,
  Sparkles,
  ShoppingBag,
  Loader2,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  TrendingDown,
  Users,
  Utensils,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react';
import { Product } from '../types';

interface AIBudgetBasketModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddMultipleToCart: (items: Array<{ product: Product; quantity: number }>) => void;
}

interface BudgetItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
  unit?: string;
  categoryName?: string;
}

interface BudgetResult {
  basketName: string;
  items: BudgetItem[];
  totalPrice: number;
  savingsAdvice: string;
}

const BUDGET_PRESETS = [
  { amount: '300', label: '₹300', desc: 'Essential Solo' },
  { amount: '500', label: '₹500', desc: 'Weekly Staples' },
  { amount: '1000', label: '₹1000', desc: 'Family Basket' },
  { amount: '2000', label: '₹2000', desc: 'Bulk Pantry' },
];

const HOUSEHOLD_OPTIONS = [
  { id: '1', label: 'Solo', count: '1 Person', icon: '👤' },
  { id: '2', label: 'Couple', count: '2 People', icon: '👥' },
  { id: '4', label: 'Family', count: '4 People', icon: '👨‍👩‍👧' },
  { id: '6', label: 'Group', count: '6+ Large', icon: '🏘️' },
];

const DIETARY_PRESETS = [
  { id: 'General Balanced', label: 'Balanced Meal', icon: '🥗' },
  { id: '100% Vegetarian', label: '100% Pure Veg', icon: '🥬' },
  { id: 'Organic & High Protein', label: 'High Protein', icon: '🏋️' },
  { id: 'Keto & Low Carb', label: 'Keto / Low Carb', icon: '🥑' },
  { id: 'Organic Staples', label: 'Organic Staples', icon: '🌾' },
];

export const AIBudgetBasketModal: React.FC<AIBudgetBasketModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddMultipleToCart,
}) => {
  const [maxBudget, setMaxBudget] = useState('500');
  const [familySize, setFamilySize] = useState('2');
  const [dietary, setDietary] = useState('General Balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [isSuccessAdded, setIsSuccessAdded] = useState(false);

  if (!isOpen) return null;

  const fetchBudgetBasket = async (budgetValue: string, familyValue: string, dietaryValue: string) => {
    setIsLoading(true);
    setIsSuccessAdded(false);

    try {
      const res = await fetch('/api/ai/budget-basket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxBudget: budgetValue,
          familySize: familyValue,
          dietaryPreference: dietaryValue,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        // Hydrate product details if missing
        const hydratedItems = (data.data.items || []).map((it: BudgetItem) => {
          const matched = products.find(
            (p) => p.id === it.productId || p.name.toLowerCase().includes(it.name.toLowerCase())
          );
          return {
            ...it,
            productId: matched ? matched.id : it.productId,
            name: matched ? matched.name : it.name,
            image: matched?.image || it.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200',
            unit: matched?.unit || it.unit || '1 pack',
            categoryName: matched?.categoryName || it.categoryName || 'Staples',
            price: matched ? matched.price : it.price,
          };
        });

        const calculatedTotal = hydratedItems.reduce((sum: number, item: BudgetItem) => sum + item.price * item.qty, 0);

        setResult({
          ...data.data,
          items: hydratedItems,
          totalPrice: calculatedTotal,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBudgetBasket(maxBudget, familySize, dietary);
  };

  const handlePresetBudgetClick = (amount: string) => {
    setMaxBudget(amount);
    fetchBudgetBasket(amount, familySize, dietary);
  };

  const handleHouseholdSelect = (id: string) => {
    setFamilySize(id);
    fetchBudgetBasket(maxBudget, id, dietary);
  };

  const handleDietarySelect = (id: string) => {
    setDietary(id);
    fetchBudgetBasket(maxBudget, familySize, id);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    if (!result) return;
    const updated = [...result.items];
    const newQty = updated[index].qty + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].qty = newQty;
    }

    const newTotal = updated.reduce((sum, item) => sum + item.price * item.qty, 0);
    setResult({
      ...result,
      items: updated,
      totalPrice: newTotal,
    });
  };

  const handleRemoveItem = (index: number) => {
    if (!result) return;
    const updated = [...result.items];
    updated.splice(index, 1);
    const newTotal = updated.reduce((sum, item) => sum + item.price * item.qty, 0);
    setResult({
      ...result,
      items: updated,
      totalPrice: newTotal,
    });
  };

  const handleAddAllToCart = () => {
    if (!result || result.items.length === 0) return;

    const itemsToAdd: Array<{ product: Product; quantity: number }> = [];

    result.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId || prod.name.includes(item.name));
      if (p) {
        itemsToAdd.push({ product: p, quantity: item.qty || 1 });
      }
    });

    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
    } else {
      onAddMultipleToCart(products.slice(0, 3).map((p) => ({ product: p, quantity: 1 })));
    }

    setIsSuccessAdded(true);
    setTimeout(() => {
      onClose();
    }, 1100);
  };

  const budgetLimit = Math.max(1, Number(maxBudget) || 500);
  const currentSpent = result ? result.totalPrice : 0;
  const budgetUtilization = Math.min(100, Math.round((currentSpent / budgetLimit) * 100));
  const remainingBudget = Math.max(0, budgetLimit - currentSpent);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Decorative Gradient Accent */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 w-full shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">AI Smart Budget Basket Builder</h3>
                <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" /> Gemini 3.6
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Set target budget & household size — AI builds a complete balanced meal basket!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200/60 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* Quick Config Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Target Budget Input & Quick Presets */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <IndianRupee className="w-4 h-4 text-emerald-600" /> Max Target Budget (₹)
                </label>
                <span className="text-xs font-bold text-slate-500">Quick Presets:</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="500"
                    min="50"
                    max="10000"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
                    required
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {BUDGET_PRESETS.map((preset) => {
                    const isSelected = maxBudget === preset.amount;
                    return (
                      <button
                        key={preset.amount}
                        type="button"
                        onClick={() => handlePresetBudgetClick(preset.amount)}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Household Size Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Users className="w-4 h-4 text-teal-600" /> Household / Family Size
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HOUSEHOLD_OPTIONS.map((opt) => {
                  const isSelected = familySize === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleHouseholdSelect(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-black ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                      }`}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <div>
                        <div className="text-xs font-black">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{opt.count}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Preference Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Utensils className="w-4 h-4 text-emerald-600" /> Dietary Preference
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_PRESETS.map((d) => {
                  const isSelected = dietary === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleDietarySelect(d.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                      }`}
                    >
                      <span>{d.icon}</span>
                      <span>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Optimizing Cart within ₹{maxBudget}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate AI Budget Cart
                </>
              )}
            </button>
          </form>

          {/* AI Basket Output */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-300">
              
              {/* Summary Card with Budget Gauge */}
              <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div>
                    <h4 className="text-sm font-black text-emerald-100">{result.basketName}</h4>
                    <p className="text-xs font-semibold text-emerald-200 mt-0.5 leading-relaxed">
                      {result.savingsAdvice}
                    </p>
                  </div>
                  <div className="text-right shrink-0 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-200 block">Total Cart</span>
                    <span className="text-lg font-black text-white">₹{currentSpent}</span>
                  </div>
                </div>

                {/* Budget Utilization Meter */}
                <div className="space-y-1 relative z-10">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-200">
                    <span>Budget Utilized: {budgetUtilization}%</span>
                    <span>
                      {remainingBudget > 0 ? `₹${remainingBudget} remaining` : 'Optimal Budget Fit'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-emerald-950/60 rounded-full overflow-hidden p-0.5 border border-emerald-700/50">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                      style={{ width: `${budgetUtilization}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                  <span>Suggested Items ({result.items.length})</span>
                  <span className="text-slate-500 font-semibold text-[11px]">Adjust quantities or remove items</span>
                </div>

                {result.items.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                    No items match this budget limit. Try increasing target budget to ₹{Number(maxBudget) + 200}.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {result.items.map((item, idx) => (
                      <div
                        key={`${item.productId}-${idx}`}
                        className="flex items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-100"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{item.name}</h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-semibold">
                                {item.unit}
                              </span>
                              <span>₹{item.price} each</span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls & Price */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, -1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-black text-slate-900">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(idx, 1)}
                              className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-black text-slate-900 w-12 text-right">
                            ₹{item.price * item.qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                            title="Remove from basket"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddAllToCart}
                disabled={result.items.length === 0 || isSuccessAdded}
                className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all ${
                  isSuccessAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isSuccessAdded ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" /> Added {result.items.length} Items to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-emerald-400" /> Add Entire Budget Basket ({result.items.length} Items • ₹{currentSpent}) to Cart
                  </>
                )}
              </button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
