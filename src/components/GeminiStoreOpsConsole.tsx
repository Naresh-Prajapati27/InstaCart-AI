import React, { useState } from 'react';
import { Zap, Play, CheckCircle2, Package, Truck, Tag, RefreshCw, Loader2, Sparkles, AlertTriangle, Layers } from 'lucide-react';

interface ExecutedFunctionLog {
  functionName: string;
  args: any;
  result: any;
}

const QUICK_OPS_PRESETS = [
  {
    label: "📦 Restock Low Milk",
    prompt: "Create purchase order for 50 units of Organic Whole Milk with Mother Dairy supplier",
    icon: Package,
  },
  {
    label: "🚴 Urgent Rider Dispatch Alert",
    prompt: "Broadcast urgent dispatch alert to 5 riders at Indiranagar Dark Store for ₹10 surge bonus",
    icon: Truck,
  },
  {
    label: "🏷️ 15% Fruit & Veg Flash Sale",
    prompt: "Apply a 15% flash sale discount to Fruits & Vegetables category for 24 hours",
    icon: Tag,
  },
  {
    label: "🔄 Rebalance Dark Store Stock",
    prompt: "Rebalance 30 units of Fresh Eggs from Koramangala store to Indiranagar store",
    icon: RefreshCw,
  },
];

export const GeminiStoreOpsConsole: React.FC<{ onRefreshStoreData?: () => void }> = ({ onRefreshStoreData }) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<Array<{ prompt: string; executedFunctions: ExecutedFunctionLog[]; replyText: string; timestamp: string }>>([
    {
      prompt: "Create purchase order for 50 units of Organic Whole Milk with Mother Dairy supplier",
      executedFunctions: [
        {
          functionName: "createPurchaseOrder",
          args: { productId: "dbe_1", quantity: 50, supplierName: "Mother Dairy Fresh" },
          result: {
            status: "PURCHASE_ORDER_ISSUED",
            orderId: "PO-91823",
            item: "Amul Taaza Toned Fresh Milk (1L)",
            quantityOrdered: 50,
            supplier: "Mother Dairy Fresh",
            estimatedDelivery: "Tomorrow 7:00 AM",
            updatedStockLevel: 75,
          },
        },
      ],
      replyText: "Gemini executed 1 store operations function(s) successfully.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleRunOpsFunction = async (promptToRun?: string) => {
    const p = (promptToRun || userPrompt).trim();
    if (!p) return;

    if (promptToRun) setUserPrompt(promptToRun);
    setIsExecuting(true);

    try {
      const res = await fetch('/api/ai/store-ops-function-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: p, storeId: 'IND-01' }),
      });
      const json = await res.json();
      if (json.success) {
        setLogs((prev) => [
          {
            prompt: p,
            executedFunctions: json.executedFunctions || [],
            replyText: json.replyText || 'Operation executed successfully',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev,
        ]);
        if (onRefreshStoreData) onRefreshStoreData();
      }
    } catch (err) {
      console.error('Error executing store ops function call:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              Gemini Function Calling for Automated Store Operations
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase">
                Direct Backend Functions
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Gemini dynamically invokes backend functions like <code className="text-amber-800 font-bold">createPurchaseOrder()</code> or <code className="text-amber-800 font-bold font-mono">notifyRiders()</code> in real-time.
            </p>
          </div>
        </div>

        <span className="text-xs font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
          <Layers className="w-3.5 h-3.5 text-amber-600" /> Active Function Registry (4 Tools)
        </span>
      </div>

      {/* Input Console & Quick Presets */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunOpsFunction()}
            placeholder='e.g. "Create purchase order for 50 units of Organic Milk with Mother Dairy"'
            className="flex-1 bg-slate-50 focus:bg-white border border-slate-300 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all font-medium"
          />
          <button
            onClick={() => handleRunOpsFunction()}
            disabled={isExecuting || !userPrompt.trim()}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Calling Function...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Execute Action
              </>
            )}
          </button>
        </div>

        {/* Quick Action Preset Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {QUICK_OPS_PRESETS.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                onClick={() => handleRunOpsFunction(preset.prompt)}
                className="text-left p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs group-hover:text-amber-900">
                  <Icon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{preset.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 group-hover:text-slate-600 line-clamp-1 mt-1">
                  {preset.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Execution Audit Logs */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Function Execution History Logs
        </h4>

        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {(logs || []).map((log, idx) => (
            <div key={idx} className="bg-slate-900 text-slate-100 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Prompt: "{log.prompt}"
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>

              {/* Function Calls Executed */}
              <div className="space-y-2">
                {(log.executedFunctions || []).map((fn, fIdx) => (
                  <div key={fIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        ⚡ Function Invoked: <code className="text-amber-300 font-black">{fn.functionName}()</code>
                      </span>
                      <span className="text-[10px] font-sans font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                        STATUS_OK
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Passed Arguments:</span>
                        <pre className="text-amber-200 text-[10px] whitespace-pre-wrap">{JSON.stringify(fn.args, null, 2)}</pre>
                      </div>

                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Backend Execution Result:</span>
                        <pre className="text-emerald-300 text-[10px] whitespace-pre-wrap">{JSON.stringify(fn.result, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-300 font-sans font-medium italic">
                {log.replyText}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
