import React, { useState } from 'react';
import { Sparkles, ShoppingBag, ArrowRight, Loader2, CheckCircle, RefreshCw, X, Lightbulb } from 'lucide-react';
import { Product, AIGroceryListResult } from '../types';

interface AIGroceryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddMultipleToCart: (items: Array<{ product: Product; quantity: number }>) => void;
}

const SAMPLE_PROMPTS = [
  'Host an Italian pasta dinner for 4 people under ₹500',
  'Organic high-protein breakfast list for a busy work week',
  'Low-carb keto diet groceries with healthy fats under ₹1200',
  'Quick 15-minute fresh smoothie ingredients list',
];

export const AIGroceryGeneratorModal: React.FC<AIGroceryGeneratorModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddMultipleToCart,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIGroceryListResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const query = customPrompt || prompt;
    if (!query.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/grocery-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiResult(data.data);
      } else {
        setErrorMessage(data.message || 'Failed to generate grocery list');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error generating list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!aiResult) return;

    const itemsToAdd: Array<{ product: Product; quantity: number }> = [];

    aiResult.suggestedItems.forEach((item) => {
      // Find matching product in store catalog
      let matchingProduct = products.find((p) => p.id === item.productId);
      if (!matchingProduct) {
        matchingProduct = products.find((p) =>
          p.name.toLowerCase().includes(item.productName.toLowerCase())
        );
      }

      if (matchingProduct) {
        itemsToAdd.push({
          product: matchingProduct,
          quantity: item.qty || 1,
        });
      }
    });

    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                InstaCart AI Grocery Assistant
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Describe your plan, budget, or dietary needs. AI will auto-match products from our catalog.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input Form */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. 'I want to make a healthy high-protein dinner for 3 people under ₹500' or 'Organic breakfast prep for the week'..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none h-24 font-medium transition-all"
            />
            <button
              disabled={isLoading || !prompt.trim()}
              onClick={() => handleGenerate()}
              className="absolute bottom-3 right-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Generate List
                </>
              )}
            </button>
          </div>

          {/* Quick Prompt Suggestions */}
          {!aiResult && !isLoading && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Try Quick AI Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(p);
                      handleGenerate(p);
                    }}
                    className="text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl transition-all text-left"
                  >
                    ✨ {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-10 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 animate-bounce">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                InstaCart Gemini AI is matching catalog inventory & nutrition specs...
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-medium border border-rose-200">
              {errorMessage}
            </div>
          )}

          {/* AI Result Card */}
          {aiResult && (
            <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-300">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-black text-emerald-900">{aiResult.title}</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    AI Matched
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-medium">{aiResult.reasoning}</p>
              </div>

              {/* Items List */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {(aiResult.suggestedItems || []).map((item, idx) => {
                  const matchingProd = products.find(
                    (p) => p.id === item.productId || p.name.toLowerCase().includes(item.productName.toLowerCase())
                  );

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-emerald-200 bg-white transition-all text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {matchingProd?.image && (
                          <img
                            src={matchingProd.image}
                            alt={matchingProd.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block">{item.productName}</span>
                          <span className="text-[11px] text-slate-500">{item.reason}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 block">
                          {item.qty} x ₹{matchingProd ? matchingProd.price : '149'}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">In Stock</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleGenerate()}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate List
                </button>

                <button
                  onClick={handleAddAllToCart}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-4 h-4" /> Add All {aiResult.suggestedItems.length} Items to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
