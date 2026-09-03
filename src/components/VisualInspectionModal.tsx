import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertTriangle, XCircle, Sparkles, Loader2, ShieldCheck, RefreshCw, X, Eye } from 'lucide-react';

interface InspectionResult {
  qualityScore: number;
  grade: string;
  freshnessIndex: string;
  spoilageDetected: boolean;
  estimatedShelfLifeDays: number;
  defectsList: string[];
  actionRecommendation: string;
  autoStockDecision: 'APPROVED_FOR_SHELVES' | 'DISCOUNT_CORNER' | 'REJECT_RETURN' | string;
}

const SAMPLE_PRODUCE_IMAGES = [
  {
    name: "Fresh Shimla Red Apples",
    category: "Fresh Fruits",
    type: "fresh",
    url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    description: "Sample Grade A+ fresh intake batch",
  },
  {
    name: "Slightly Bruised Bananas",
    category: "Fresh Fruits",
    type: "bruised",
    url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80",
    description: "Sample near-spoilage discount produce",
  },
  {
    name: "Farm Fresh Tomatoes",
    category: "Vegetables",
    type: "fresh",
    url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80",
    description: "Sample dark store batch intake",
  },
  {
    name: "Damaged Milk Carton",
    category: "Dairy & Bakery",
    type: "damaged",
    url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    description: "Sample packaging leakage check",
  },
];

export const VisualInspectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated?: () => void;
}> = ({ isOpen, onClose, onStockUpdated }) => {
  const [selectedSample, setSelectedSample] = useState(SAMPLE_PRODUCE_IMAGES[0]);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [appliedActionMessage, setAppliedActionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImageBase64(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunInspection = async () => {
    setIsInspecting(true);
    setAppliedActionMessage(null);

    const activeImage = customImageBase64 || selectedSample.url;
    const prodName = customImageBase64 ? "Custom Produce Batch" : selectedSample.name;
    const catName = customImageBase64 ? "Dark Store Intake" : selectedSample.category;

    try {
      const res = await fetch('/api/ai/visual-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: activeImage,
          productName: prodName,
          categoryName: catName,
        }),
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      }
    } catch (err: any) {
      console.error('Error running visual inspection:', err);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleApplyAutoDecision = () => {
    if (!result) return;
    let msg = "";
    if (result.autoStockDecision === "APPROVED_FOR_SHELVES") {
      msg = "✅ Stock Batch Approved! Added 50 units directly to Indiranagar Dark Store Shelves.";
    } else if (result.autoStockDecision === "DISCOUNT_CORNER") {
      msg = "🏷️ Route to Clearance! Automatically listed at 40% OFF in Quick Discount Corner.";
    } else {
      msg = "🚫 Shipment Rejected! Automated supplier return debit note generated.";
    }
    setAppliedActionMessage(msg);
    if (onStockUpdated) onStockUpdated();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 space-y-0">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Camera className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Automated Visual Inspection (Multimodal Gemini Vision)
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Dark store quality control: detects spoilage, assesses skin defects & updates stock health metrics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6">
          {/* Sample Selection or Custom Image Upload */}
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              1. Select Dark Store Intake Photo or Upload Produce Image
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SAMPLE_PRODUCE_IMAGES.map((sample, idx) => {
                const isSelected = !customImageBase64 && selectedSample.url === sample.url;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomImageBase64(null);
                      setSelectedSample(sample);
                      setResult(null);
                    }}
                    className={`relative rounded-2xl overflow-hidden border-2 text-left p-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <img src={sample.url} alt={sample.name} className="w-full h-24 object-cover rounded-xl" />
                    <div className="p-1">
                      <span className="text-[11px] font-extrabold text-slate-900 block truncate">{sample.name}</span>
                      <span className="text-[9px] text-slate-500 font-medium">{sample.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom File Upload Option */}
            <div className="flex items-center gap-3 pt-1">
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Upload Custom Produce Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {customImageBase64 && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Custom Image Uploaded
                </span>
              )}
            </div>
          </div>

          {/* Run Inspection Action */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-3">
              <img
                src={customImageBase64 || selectedSample.url}
                alt="Selected produce preview"
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <span className="text-xs font-black text-slate-900 block">
                  {customImageBase64 ? "Custom Produce Batch" : selectedSample.name}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Ready for gemini-2.5-flash vision analysis</span>
              </div>
            </div>

            <button
              onClick={handleRunInspection}
              disabled={isInspecting}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isInspecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Inspecting Image...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-emerald-200" /> Run Multimodal Inspection
                </>
              )}
            </button>
          </div>

          {/* Gemini Vision Results Card */}
          {result && (
            <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-4 animate-in fade-in duration-300 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Gemini Vision Produce Quality Certificate
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                  {result.grade}
                </span>
              </div>

              {/* Quality Score Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Quality Score</span>
                  <span className="text-2xl font-black text-emerald-400">{result.qualityScore}/100</span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Freshness Index</span>
                  <span className="text-lg font-black text-amber-300">{result.freshnessIndex}</span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Spoilage Risk</span>
                  <span className={`text-sm font-black ${result.spoilageDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {result.spoilageDetected ? '⚠️ Detected' : '✅ Clear'}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Est. Shelf Life</span>
                  <span className="text-lg font-black text-teal-300">{result.estimatedShelfLifeDays} Days</span>
                </div>
              </div>

              {/* Defects & Recommendations */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-300 block">Defects & Surface Inspection Notes:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 font-medium">
                  {(result.defectsList || []).map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>

                <p className="text-slate-200 bg-slate-800 p-3 rounded-2xl border border-slate-700 mt-2 font-medium">
                  <strong className="text-amber-300">Action Recommendation:</strong> {result.actionRecommendation}
                </p>
              </div>

              {/* Auto Inventory Action Button */}
              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">
                  Decision Rule: <code className="text-emerald-300">{result.autoStockDecision}</code>
                </span>

                <button
                  onClick={handleApplyAutoDecision}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" /> Execute Auto Stock Decision
                </button>
              </div>

              {appliedActionMessage && (
                <div className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 p-3 rounded-2xl text-xs font-bold animate-in fade-in duration-200">
                  {appliedActionMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
