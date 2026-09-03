import React, { useState, useMemo } from 'react';
import { Utensils, Sparkles, ShoppingBag, Loader2, X, Clock, Flame, Check, CheckSquare, Square, Search, ChefHat } from 'lucide-react';
import { Product, Recipe } from '../types';

interface AIRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  products: Product[];
  onAddMultipleToCart: (items: Array<{ product: Product; quantity: number }>) => void;
}

const CATEGORIES = [
  { id: 'All', label: 'All Dishes', icon: '✨' },
  { id: 'Breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'Lunch', label: 'Lunch', icon: '🍛' },
  { id: 'Dinner', label: 'Dinner', icon: '🍽️' },
  { id: 'Snacks', label: 'Snacks', icon: '🌮' },
  { id: 'Beverages', label: 'Beverages', icon: '☕' },
  { id: 'Desserts', label: 'Desserts', icon: '🍰' },
  { id: 'Healthy', label: 'Healthy', icon: '🥗' },
];

export const AIRecipeModal: React.FC<AIRecipeModalProps> = ({
  isOpen,
  onClose,
  recipes,
  products,
  onAddMultipleToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0] || recipes);
  const [customRecipeQuery, setCustomRecipeQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Map of ingredient index -> boolean (true if excluded)
  const [excludedIngredients, setExcludedIngredients] = useState<Record<number, boolean>>({});

  // Filter recipes by category and search query
  const filteredRecipes = useMemo(() => {
    return recipes.filter((rec) => {
      const matchesCategory =
        selectedCategory === 'All' || rec.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rec.title.toLowerCase().includes(q) ||
        rec.description.toLowerCase().includes(q) ||
        rec.category.toLowerCase().includes(q) ||
        rec.ingredients.some((ing) => ing.name.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [recipes, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const toggleIngredient = (idx: number) => {
    setExcludedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    const available = recipes.filter(
      (r) => catId === 'All' || r.category.toLowerCase() === catId.toLowerCase()
    );
    if (available.length > 0) {
      setSelectedRecipe(available[0]);
      setExcludedIngredients({});
    }
  };

  const handleSelectRecipe = (rec: Recipe) => {
    setSelectedRecipe(rec);
    setExcludedIngredients({});
  };

  const matchIngredientToProduct = (
    ing: { name: string; productId?: string },
    productsList: Product[]
  ): Product | null => {
    const cleanIngName = ing.name.toLowerCase().trim();

    // 1. If productId is provided, verify candidate's name or description/category actually matches
    if (ing.productId) {
      const candidate = productsList.find((p) => p.id === ing.productId);
      if (candidate) {
        const candName = candidate.name.toLowerCase();
        const candCat = candidate.categoryName.toLowerCase();

        const ingTokens = cleanIngName
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(
            (w) =>
              w.length >= 3 &&
              !['fresh', 'organic', 'farm', 'sweet', 'whole', 'pure', 'pack', 'hybrid', '1kg', '500g', '200g', '100g', 'pcs', 'slice'].includes(w)
          );

        const isRelevant = ingTokens.some(
          (tok) => candName.includes(tok) || candCat.includes(tok)
        );

        if (isRelevant) {
          return candidate;
        }
      }
    }

    // 2. High-precision keyword scoring search across all products
    const ingTokens = cleanIngName
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(
        (w) =>
          w.length >= 3 &&
          !['fresh', 'organic', 'farm', 'sweet', 'whole', 'pure', 'pack', 'hybrid', '1kg', '500g', '200g', '100g', 'pcs', 'slice', 'cup', 'tbsp', 'tsp', 'pack', 'grams'].includes(w)
      );

    let bestMatch: Product | null = null;
    let maxScore = 0;

    for (const prod of productsList) {
      const pName = prod.name.toLowerCase();
      const pDesc = (prod.description || '').toLowerCase();
      const pCat = prod.categoryName.toLowerCase();
      let score = 0;

      if (pName.includes(cleanIngName) || cleanIngName.includes(pName)) {
        score += 20;
      }

      ingTokens.forEach((tok) => {
        if (pName.includes(tok)) {
          score += 8;
        } else if (pDesc.includes(tok)) {
          score += 3;
        } else if (pCat.includes(tok)) {
          score += 1;
        }
      });

      if (score > maxScore) {
        maxScore = score;
        bestMatch = prod;
      }
    }

    if (maxScore > 0) return bestMatch;

    return null;
  };

  const getProductsForDish = (query: string, productsList: Product[]): Product[] => {
    const q = query.toLowerCase().trim();
    let keywords: string[] = [];

    if (q.includes('dosa')) {
      keywords = ['batter', 'dosa', 'potato', 'onion', 'ghee', 'oil', 'masala', 'rice', 'atta'];
    } else if (q.includes('poha')) {
      keywords = ['poha', 'flattened', 'peanut', 'chili', 'onion', 'lemon', 'oil'];
    } else if (q.includes('paratha') || q.includes('aloo')) {
      keywords = ['atta', 'flour', 'potato', 'butter', 'chili', 'garam masala', 'curd'];
    } else if (q.includes('paneer')) {
      keywords = ['paneer', 'butter', 'tomato', 'cashew', 'masala'];
    } else if (q.includes('rajma')) {
      keywords = ['rajma', 'basmati', 'rice', 'tomato', 'onion', 'ginger'];
    } else if (q.includes('biryani')) {
      keywords = ['basmati', 'rice', 'ghee', 'mint', 'coriander', 'masala'];
    } else if (q.includes('chicken')) {
      keywords = ['chicken', 'butter', 'cream', 'tomato', 'masala'];
    } else if (q.includes('dal') || q.includes('makhani')) {
      keywords = ['urad', 'dal', 'rajma', 'butter', 'cream', 'tomato'];
    } else if (q.includes('tea') || q.includes('chai')) {
      keywords = ['tea', 'milk', 'ginger', 'sugar', 'cardamom'];
    } else if (q.includes('coffee')) {
      keywords = ['coffee', 'milk', 'sugar'];
    } else if (q.includes('jamun') || q.includes('gulab')) {
      keywords = ['jamun', 'sugar', 'cardamom', 'oil', 'milkmaid'];
    } else if (q.includes('kheer')) {
      keywords = ['basmati', 'rice', 'milk', 'almond', 'sugar'];
    } else if (q.includes('oats') || q.includes('upma')) {
      keywords = ['oats', 'carrot', 'pea', 'lemon'];
    } else if (q.includes('sprouts') || q.includes('salad')) {
      keywords = ['moong', 'sprouts', 'cucumber', 'tomato', 'masala'];
    } else if (q.includes('cake') || q.includes('bake')) {
      keywords = ['flour', 'maida', 'sugar', 'butter', 'milk', 'egg'];
    } else if (q.includes('pasta') || q.includes('spaghetti')) {
      keywords = ['pasta', 'noodle', 'tomato', 'cheese', 'garlic', 'butter'];
    } else if (q.includes('pizza')) {
      keywords = ['cheese', 'tomato', 'bread', 'corn', 'capsicum'];
    } else {
      keywords = q.split(/\s+/).filter((w) => w.length >= 3);
    }

    const matched = productsList.filter((p) => {
      const text = `${p.name} ${p.categoryName} ${p.description || ''}`.toLowerCase();
      return keywords.some((kw) => text.includes(kw));
    });

    return matched.slice(0, 5);
  };

  const handleAddRecipeToCart = (recipe: Recipe) => {
    const itemsToAdd: Array<{ product: Product; quantity: number }> = [];

    recipe.ingredients.forEach((ing, idx) => {
      if (excludedIngredients[idx]) return; // Skip deselected ingredients

      const matchedProd = matchIngredientToProduct(ing, products);

      if (matchedProd && !itemsToAdd.some((item) => item.product.id === matchedProd.id)) {
        itemsToAdd.push({
          product: matchedProd,
          quantity: 1,
        });
      }
    });

    if (itemsToAdd.length === 0) {
      const dishFallback = getProductsForDish(recipe.title, products);
      dishFallback.forEach((p) => {
        if (!itemsToAdd.some((item) => item.product.id === p.id)) {
          itemsToAdd.push({ product: p, quantity: 1 });
        }
      });
    }

    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
      onClose();
    }
  };

  const handleConvertCustomRecipe = async () => {
    if (!customRecipeQuery.trim()) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/recipe-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeTitle: customRecipeQuery.trim(),
          ingredients: [customRecipeQuery.trim()],
        }),
      });

      const data = await res.json();
      if (data.success && data.data && Array.isArray(data.data.matchedItems)) {
        const matched = data.data.matchedItems;
        const itemsToAdd: Array<{ product: Product; quantity: number }> = [];

        matched.forEach((m: any) => {
          let prod = products.find((p) => p.id === m.productId);
          if (!prod && m.productName) {
            prod = matchIngredientToProduct({ name: m.productName }, products);
          }
          if (prod && !itemsToAdd.some((item) => item.product.id === prod!.id)) {
            itemsToAdd.push({ product: prod, quantity: m.quantity || 1 });
          }
        });

        if (itemsToAdd.length > 0) {
          onAddMultipleToCart(itemsToAdd);
          onClose();
          return;
        }
      }

      // Fallback
      const dishProds = getProductsForDish(customRecipeQuery, products);
      if (dishProds.length > 0) {
        onAddMultipleToCart(dishProds.map((p) => ({ product: p, quantity: 1 })));
      }
      onClose();
    } catch (err: any) {
      const dishProds = getProductsForDish(customRecipeQuery, products);
      if (dishProds.length > 0) {
        onAddMultipleToCart(dishProds.map((p) => ({ product: p, quantity: 1 })));
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const activeRecipe = filteredRecipes.some((r) => r.id === selectedRecipe.id)
    ? selectedRecipe
    : filteredRecipes[0] || selectedRecipe;

  const selectedCount = activeRecipe.ingredients.filter((_, idx) => !excludedIngredients[idx]).length;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 overflow-y-auto p-3 sm:p-4 md:p-6 flex items-center justify-center min-h-screen"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 relative my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-3 pr-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
              <ChefHat className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                Recipe to Cart AI ✨
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Explore curated meal menus or type any dish name to auto-add fresh ingredients to your cart.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {/* Custom Recipe AI Converter Row */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 p-3.5 rounded-2xl border border-amber-200/80">
            <label className="text-xs font-black text-slate-800 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>Type Any Dish Name or Recipe:</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customRecipeQuery}
                onChange={(e) => setCustomRecipeQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConvertCustomRecipe()}
                placeholder="e.g. Masala Dosa, Butter Chicken, Oats Upma, Filter Coffee..."
                className="flex-1 bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none shadow-xs"
              />
              <button
                disabled={isLoading || !customRecipeQuery.trim()}
                onClick={handleConvertCustomRecipe}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Auto-Add Ingredients
              </button>
            </div>
          </div>

          {/* Category Filter Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                Explore Meal Categories
              </span>
              <div className="relative max-w-xs w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter dishes..."
                  className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1 text-[11px] font-medium text-slate-700 outline-none transition-all"
                />
              </div>
            </div>

            {/* Meal Time Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = recipes.filter(
                  (r) => cat.id === 'All' || r.category.toLowerCase() === cat.id.toLowerCase()
                ).length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-102'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Recipes Grid & Selected Details */}
          {filteredRecipes.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
              <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No dishes found in this category.</p>
              <p className="text-[11px] text-slate-400 mt-1">Try selecting another category or typing above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Recipe List Selector */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Dish ({filteredRecipes.length})
                </span>
                <div className="space-y-2 max-h-72 md:max-h-96 overflow-y-auto pr-1">
                  {filteredRecipes.map((rec) => {
                    const isSelected = activeRecipe.id === rec.id;
                    return (
                      <div
                        key={rec.id}
                        onClick={() => handleSelectRecipe(rec)}
                        className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-slate-100 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={rec.image}
                          alt={rec.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                              {rec.category}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-900 block truncate">{rec.title}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-400" /> {rec.prepTime}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-amber-500" /> {rec.calories} cal
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Recipe Details & Ingredients Preview */}
              {activeRecipe && (
                <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="aspect-16/8 rounded-xl overflow-hidden relative shadow-xs">
                      <img src={activeRecipe.image} alt={activeRecipe.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="text-amber-400">🏷️</span> {activeRecipe.category}
                      </div>
                      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Serves {activeRecipe.servings} • {activeRecipe.difficulty}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <span>{activeRecipe.title}</span>
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{activeRecipe.description}</p>
                    </div>

                    {/* Ingredient checklist */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Required Fresh Grocery Ingredients ({(activeRecipe.ingredients || []).length}):
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Click to toggle items
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {(activeRecipe.ingredients || []).map((ing, idx) => {
                          const isExcluded = !!excludedIngredients[idx];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleIngredient(idx)}
                              className={`flex items-center justify-between text-xs p-2 rounded-xl border cursor-pointer transition-all ${
                                isExcluded
                                  ? 'bg-slate-100 border-slate-200 opacity-60 line-through'
                                  : 'bg-slate-50 border-slate-200/60 hover:border-amber-400/60'
                              }`}
                            >
                              <span className="font-semibold text-slate-800 flex items-center gap-2">
                                {isExcluded ? (
                                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                ) : (
                                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                )}
                                <span className="truncate">{ing.name}</span>
                              </span>
                              <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-2">
                                {ing.quantity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-3 border-t border-slate-100 mt-3">
                    <button
                      disabled={selectedCount === 0}
                      onClick={() => handleAddRecipeToCart(activeRecipe)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add {selectedCount} Selected Ingredient{selectedCount !== 1 ? 's' : ''} to Cart
                    </button>
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

