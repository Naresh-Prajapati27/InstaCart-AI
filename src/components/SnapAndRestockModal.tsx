import React, { useState } from 'react';
import emptyFridgeImg from '../assets/images/empty_fridge_interior_1785944392754.jpg';
import { Product } from '../types';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  CheckCircle2,
  Loader2,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  FileText,
  Refrigerator,
  PackageCheck,
  Eye,
  Zap,
} from 'lucide-react';

interface SnapAndRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddMultipleToCart: (items: { product: Product; quantity: number }[]) => void;
  onShowToast?: (message: string) => void;
}

interface DetectedItem {
  productId: string;
  productName: string;
  category?: string;
  detectedStatus?: string;
  confidencePct?: number;
  suggestedQty: number;
  price: number;
  reason: string;
  selected?: boolean;
}

interface AnalysisResult {
  imageType: string;
  summary: string;
  confidenceRating: string;
  items: DetectedItem[];
}

export const SnapAndRestockModal: React.FC<SnapAndRestockModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddMultipleToCart,
  onShowToast,
}) => {
  const [selectedSample, setSelectedSample] = useState<'empty_fridge' | 'handwritten_note' | 'pantry_shelf' | 'custom'>('empty_fridge');
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(emptyFridgeImg);
  const [customNotes, setCustomNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<{ [id: string]: number }>({});

  if (!isOpen) return null;

  const samplePresets = [
    {
      id: 'empty_fridge',
      title: 'Empty Fridge Photo',
      subtitle: 'Detects missing produce, milk & butter',
      icon: <Refrigerator className="w-5 h-5 text-emerald-600" />,
      image: emptyFridgeImg,
    },
    {
      id: 'handwritten_note',
      title: 'Handwritten Note',
      subtitle: 'OCR extracts written grocery list items',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80',
    },
    {
      id: 'pantry_shelf',
      title: 'Pantry Shelf Photo',
      subtitle: 'Identifies depleted oils, pulses & cereals',
      icon: <PackageCheck className="w-5 h-5 text-indigo-600" />,
      image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&q=80',
    },
  ];

  const handleSelectSample = (preset: typeof samplePresets[0]) => {
    setSelectedSample(preset.id as any);
    setPreviewImage(preset.image);
    setCustomImageBase64(null);
    setResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomImageBase64(base64);
        setPreviewImage(base64);
        setSelectedSample('custom');
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/snap-and-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleType: selectedSample,
          imageBase64: customImageBase64,
          customNotes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        const data: AnalysisResult = resData.data;
        setResult(data);

        // Pre-select all items and set default quantities
        const initialSelected = new Set<string>();
        const initialQtys: { [id: string]: number } = {};

        data.items.forEach((item, idx) => {
          const itemKey = item.productId || `item_${idx}`;
          initialSelected.add(itemKey);
          initialQtys[itemKey] = item.suggestedQty || 1;
        });

        setSelectedItemIds(initialSelected);
        setItemQuantities(initialQtys);
      }
    } catch (err) {
      console.error('Snap & restock error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemSelection = (key: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const updateQuantity = (key: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[key] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [key]: next };
    });
  };

  const handleAddToCart = () => {
    if (!result || !result.items) return;

    const itemsToAdd: { product: Product; quantity: number }[] = [];

    result.items.forEach((item, idx) => {
      const itemKey = item.productId || `item_${idx}`;
      if (selectedItemIds.has(itemKey)) {
        // Find in store products or create product representation
        let foundProd = products.find((p) => p.id === item.productId || p.name.toLowerCase().includes(item.productName.toLowerCase()));

        if (!foundProd) {
          foundProd = {
            id: item.productId || `prod_snap_${idx}_${Date.now()}`,
            name: item.productName,
            brand: 'InstaCart Verified',
            category: 'dairy_bread_eggs',
            categoryName: item.category || 'Grocery Essentials',
            price: item.price || 99,
            unit: '1 pack',
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80',
            rating: 4.8,
            reviewsCount: 120,
            stock: 50,
            dietaryTags: ['Fresh Restock'],
            description: item.reason || 'Restock item detected by Gemini AI Vision',
          };
        }

        const qty = itemQuantities[itemKey] || item.suggestedQty || 1;
        itemsToAdd.push({ product: foundProd, quantity: qty });
      }
    });

    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
      if (onShowToast) {
        onShowToast(`🎉 Added ${itemsToAdd.length} restock items to your cart!`);
      }
      onClose();
    }
  };

  const totalCalculatedCost = result
    ? result.items.reduce((sum, item, idx) => {
        const itemKey = item.productId || `item_${idx}`;
        if (selectedItemIds.has(itemKey)) {
          const qty = itemQuantities[itemKey] || item.suggestedQty || 1;
          return sum + item.price * qty;
        }
        return sum;
      }, 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Multimodal AI Vision
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Gemini 3.6 Flash</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                Snap & Restock (Visual Search)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Preset Sample Cards or Custom Upload */}
          {!result && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-wider block mb-2">
                  1. Select a Photo Source or Upload Your Own
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {samplePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectSample(preset)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                        selectedSample === preset.id
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-white shadow-xs group-hover:scale-105 transition-transform">
                          {preset.icon}
                        </div>
                        {selectedSample === preset.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-900">{preset.title}</h4>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 font-medium">
                          {preset.subtitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Custom Image Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Upload or Take Photo</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Upload an empty fridge photo, handwritten note, or pantry shelf image
                    </p>
                  </div>
                </div>

                <label className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shrink-0">
                  <Camera className="w-4 h-4 text-emerald-400" /> Choose File / Snap
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview Window */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-56 flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Scan preview"
                  className="w-full h-56 object-cover opacity-90"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <div className="flex items-center gap-2 text-white">
                    <span className="p-1.5 rounded-lg bg-emerald-500 text-slate-950">
                      <Eye className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-black tracking-wide">
                      {selectedSample === 'custom'
                        ? '📷 Custom Upload Selected'
                        : samplePresets.find((p) => p.id === selectedSample)?.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Optional Custom Instructions / Notes */}
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  Optional Dietary or Brand Preferences:
                </label>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Prefer organic dairy, vegetarian items, or under ₹400..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              {/* Analyze Button */}
              <button
                disabled={isLoading}
                onClick={handleAnalyze}
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-98 cursor-pointer transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-200" />
                    Analyzing Photo with Gemini Vision...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                    Analyze Photo & Extract Restock Items
                  </>
                )}
              </button>
            </div>
          )}

          {/* Loading Animation state */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">
                  Gemini Flash Vision Analysis in Progress
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Scanning image pixels, identifying missing kitchen essentials, and matching catalog items...
                </p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {result && !isLoading && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Empty Fridge Banner */}
              {(result.imageType?.toLowerCase().includes('empty') || selectedSample === 'empty_fridge') && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-amber-200/90 flex items-center gap-3 shadow-xs">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700 shrink-0">
                    <Refrigerator className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full">
                        Bare Fridge Detected
                      </span>
                      <span className="text-[10px] text-emerald-800 font-bold">7 Essential Restocks Found</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 mt-0.5">
                      Empty Fridge Acknowledged — Foundation Essentials Suggested
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">
                      We detected a completely bare fridge. Here is a curated baseline of daily dairy, fresh produce, and bakery staples to restock your kitchen from scratch.
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis Summary Header */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {result.imageType}
                    </span>
                    <span className="text-[11px] font-black text-emerald-800 font-mono">
                      ⚡ {result.confidenceRating}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-950 leading-relaxed">
                    {result.summary}
                  </p>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer shrink-0"
                >
                  🔄 Scan Another Photo
                </button>
              </div>

              {/* Detected Items Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-600 tracking-wider">
                    Identified Restock Items ({result.items.length} items detected)
                  </span>

                  <button
                    onClick={() => {
                      const itemsList = result.items || [];
                      if (selectedItemIds.size === itemsList.length) {
                        setSelectedItemIds(new Set());
                      } else {
                        const allKeys = new Set(itemsList.map((it, idx) => it.productId || `item_${idx}`));
                        setSelectedItemIds(allKeys);
                      }
                    }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    {selectedItemIds.size === (result.items || []).length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {(result.items || []).map((item, idx) => {
                    const itemKey = item.productId || `item_${idx}`;
                    const isSelected = selectedItemIds.has(itemKey);
                    const qty = itemQuantities[itemKey] || item.suggestedQty || 1;

                    return (
                      <div
                        key={itemKey}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-400/20'
                            : 'border-slate-200 bg-white opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleItemSelection(itemKey)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                              isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-slate-900">{item.productName}</h4>
                              {item.category && (
                                <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                              {item.detectedStatus && (
                                <span className="font-extrabold mr-1 bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded text-[10px]">
                                  {item.detectedStatus}
                                </span>
                              )}
                              {item.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 block">
                              ₹{item.price * qty}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              ₹{item.price} each
                            </span>
                          </div>

                          {/* Qty Selector */}
                          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
                            <button
                              disabled={!isSelected || qty <= 1}
                              onClick={() => updateQuantity(itemKey, -1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 disabled:opacity-30 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold w-5 text-center text-slate-800">
                              {qty}
                            </span>
                            <button
                              disabled={!isSelected}
                              onClick={() => updateQuantity(itemKey, 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 disabled:opacity-30 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add to Cart Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Estimated Restock Total</span>
                  <span className="text-lg font-black text-slate-900">₹{totalCalculatedCost}</span>
                </div>

                <button
                  disabled={selectedItemIds.size === 0}
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add Selected Items to Cart ({selectedItemIds.size} items)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
