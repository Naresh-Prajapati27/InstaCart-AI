import React, { useState } from 'react';
import { HeartPulse, Sparkles, Loader2, X, Plus, Check, ShieldCheck, Flame, Scale, Activity } from 'lucide-react';
import { Product, CartItem } from '../types';

interface AINutritionAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  onAddToCart: (product: Product) => void;
  onAddMultipleToCart: (items: Array<{ product: Product; quantity: number }>) => void;
}

interface NutritionAnalysisResult {
  score: number;
  verdict: string;
  macros?: {
    proteinPct: number;
    carbsPct: number;
    fatsPct: number;
    fiberGrams: number;
  };
  keyHighlights?: string[];
  recommendations: string[];
  suggestedProducts?: Array<{
    id: string;
    name: string;
    reason: string;
    price: number;
  }>;
}

const DIET_GOALS = [
  { id: 'Balanced Health & Vitality', label: 'Balanced Health', icon: '🥗', desc: 'Optimal vitamins & whole foods' },
  { id: 'High Protein & Fitness', label: 'High Protein', icon: '💪', desc: 'Muscle recovery & lean protein' },
  { id: 'Keto & Low Carb', label: 'Keto / Low Carb', icon: '🥑', desc: 'Healthy fats, zero sugars' },
  { id: 'Diabetes Care & Low GI', label: 'Diabetes Care', icon: '🩸', desc: 'Low glycemic, blood sugar friendly' },
  { id: 'Weight Loss & Calorie Deficit', label: 'Weight Loss', icon: '🔥', desc: 'High fiber, satiating low-cal' },
  { id: 'Heart Health & Low Sodium', label: 'Heart Health', icon: '🫀', desc: 'Low sodium, omega-3 rich' },
];

export const AINutritionAdvisorModal: React.FC<AINutritionAdvisorModalProps> = ({
  isOpen,
  onClose,
  cart,
  products,
  onAddToCart,
  onAddMultipleToCart,
}) => {
  const [selectedGoal, setSelectedGoal] = useState('Balanced Health & Vitality');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NutritionAnalysisResult | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAnalyze = async (goalToUse?: string) => {
    const targetGoal = goalToUse || selectedGoal;
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/nutrition-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: targetGoal,
          items: cart.map((c) => ({
            name: c.product.name,
            qty: c.quantity,
            category: c.product.categoryName,
            tags: c.product.dietaryTags,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error('Nutrition advisor error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    handleAnalyze(goalId);
  };

  const handleAddSuggested = (productId: string) => {
    const sp = result?.suggestedProducts?.find((item) => item.id === productId);
    const matched = products.find(
      (p) =>
        p.id === productId ||
        (sp && p.name.toLowerCase().includes(sp.name.toLowerCase())) ||
        (sp && sp.name.toLowerCase().includes(p.name.toLowerCase()))
    );

    if (matched) {
      onAddToCart(matched);
      setAddedIds((prev) => [...prev, productId]);
    } else {
      // Find a relevant goal product from catalog
      const targetKeywords = selectedGoal.toLowerCase().split(' ');
      const goalMatched = products.find((p) =>
        targetKeywords.some((kw) => kw.length > 3 && p.name.toLowerCase().includes(kw))
      ) || products[0];
      if (goalMatched) {
        onAddToCart(goalMatched);
        setAddedIds((prev) => [...prev, productId]);
      }
    }
  };

  const handleAddAllSuggested = () => {
    if (!result?.suggestedProducts) return;
    const itemsToAdd: Array<{ product: Product; quantity: number }> = [];

    result.suggestedProducts.forEach((sp) => {
      const p = products.find(
        (prod) =>
          prod.id === sp.id ||
          prod.name.toLowerCase().includes(sp.name.toLowerCase()) ||
          sp.name.toLowerCase().includes(prod.name.toLowerCase())
      );
      if (p) {
        itemsToAdd.push({ product: p, quantity: 1 });
      }
    });

    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">AI Personal Dietitian & Health Advisor</h3>
                <span className="bg-teal-100 text-teal-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Personalized clinical dietary recommendations, macro targets & health scores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Goal Selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              1. Choose Your Primary Dietary Goal
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DIET_GOALS.map((g) => {
                const isSelected = selectedGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleGoalSelect(g.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20 text-teal-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{g.icon}</span>
                      <span className="text-xs font-black">{g.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Cart Context Indicator */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span className="text-slate-700 font-semibold">
                Selected Goal:{' '}
                <strong className="text-slate-900 font-bold">
                  {selectedGoal}
                </strong>
                {cart.length > 0 && <span className="text-teal-700 ml-1">({cart.length} item(s) in cart)</span>}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Get Diet Plan
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          {result && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Verdict & Health Score Banner */}
              <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-teal-300">AI Evaluation</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white">{result.verdict}</h4>
                  <p className="text-xs text-slate-300 font-medium">Goal: {selectedGoal}</p>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/10 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-teal-200 font-bold block uppercase tracking-wider">Health Index</span>
                    <span className="text-2xl font-black text-emerald-400">{result.score}<span className="text-xs font-bold text-slate-300">/100</span></span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-emerald-400/40 flex items-center justify-center font-black text-xs text-emerald-300">
                    {result.score >= 80 ? 'A+' : result.score >= 70 ? 'B+' : 'C'}
                  </div>
                </div>
              </div>

              {/* Macro Distribution */}
              {result.macros && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h5 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-teal-600" /> Estimated Macronutrient Split
                  </h5>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Protein</span>
                      <span className="text-sm font-black text-teal-700">{result.macros.proteinPct}%</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Carbs</span>
                      <span className="text-sm font-black text-amber-600">{result.macros.carbsPct}%</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Fats</span>
                      <span className="text-sm font-black text-rose-600">{result.macros.fatsPct}%</span>
                    </div>
                    <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Fiber</span>
                      <span className="text-sm font-black text-emerald-700">{result.macros.fiberGrams}g</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-4 space-y-2">
                <h5 className="text-xs font-black text-teal-950 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-teal-600" /> AI Dietitian Clinical Insights
                </h5>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {(result.recommendations || []).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-teal-600 font-black">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Catalog Additions */}
              {result.suggestedProducts && result.suggestedProducts.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Recommended Grocery Items to Boost Your Score
                    </h5>
                    <button
                      type="button"
                      onClick={handleAddAllSuggested}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 underline"
                    >
                      + Add All to Cart
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(result.suggestedProducts || []).map((sp) => {
                      const isAdded = addedIds.includes(sp.id);
                      return (
                        <div
                          key={sp.id}
                          className="bg-white border border-slate-200 p-3 rounded-2xl flex flex-col justify-between space-y-2 hover:border-teal-300 transition-colors"
                        >
                          <div>
                            <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md block w-fit mb-1">
                              Nutrient Boost
                            </span>
                            <h6 className="text-xs font-bold text-slate-900 line-clamp-1">{sp.name}</h6>
                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{sp.reason}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-xs font-black text-slate-900">₹{sp.price}</span>
                            <button
                              type="button"
                              onClick={() => handleAddSuggested(sp.id)}
                              disabled={isAdded}
                              className={`p-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                                isAdded
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-teal-600 hover:bg-teal-700 text-white'
                              }`}
                            >
                              {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                              <span>{isAdded ? 'Added' : 'Add'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
