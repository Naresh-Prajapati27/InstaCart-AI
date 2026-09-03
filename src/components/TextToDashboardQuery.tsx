import React, { useState } from 'react';
import { Search, Sparkles, Loader2, Database, BarChart3, TrendingUp, AlertCircle, ArrowRight, Table, CheckCircle2 } from 'lucide-react';

interface MetricItem {
  label: string;
  value: string;
  change: string;
}

interface QueryResultData {
  queryTitle: string;
  interpretation: string;
  summaryMetrics: MetricItem[];
  tableHeaders: string[];
  tableRows: string[][];
  chartType: 'bar' | 'pie' | 'line' | string;
  chartData: Array<{ name: string; value: number }>;
  actionableInsight: string;
}

const SAMPLE_PROMPTS = [
  "Show me all VIP customers who haven't ordered in the last 14 days",
  "Which category had the highest order cancellations this week?",
  "List low stock items in Dairy and Fresh Produce with stock under 20",
  "Show top 5 delivery partners with 100% completion rate",
];

export const TextToDashboardQuery: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResultData | null>(null);

  const handleExecuteQuery = async (queryToRun?: string) => {
    const q = (queryToRun || prompt).trim();
    if (!q) return;

    if (queryToRun) setPrompt(queryToRun);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/text-to-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setQueryResult(json.data);
      }
    } catch (err) {
      console.error('Error executing text-to-dashboard query:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/50 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Database className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              Natural Language Database Querying ("Text-to-Dashboard")
              <span className="text-[10px] font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gemini Structured SQL
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Ask any business question in plain English. Gemini generates structured SQL queries & live visual dashboards.
            </p>
          </div>
        </div>
      </div>

      {/* Query Search Bar */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteQuery()}
              placeholder={`e.g. "Show me all VIP customers who haven't ordered in the last 14 days"`}
              className="w-full bg-slate-800/90 focus:bg-slate-800 border border-slate-700/80 focus:border-amber-400 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-400 outline-none shadow-inner transition-all font-medium"
            />
          </div>
          <button
            onClick={() => handleExecuteQuery()}
            disabled={isLoading || !prompt.trim()}
            className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Querying DB...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" /> Run Query
              </>
            )}
          </button>
        </div>

        {/* Preset Sample Query Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested Queries:
          </span>
          {SAMPLE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteQuery(sample)}
              className="text-[11px] font-semibold bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl px-3 py-1 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>💡</span>
              <span>{sample}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Result Card */}
      {queryResult && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-5 space-y-5 animate-in fade-in duration-300">
          {/* Result Header & Interpretation */}
          <div className="border-b border-slate-700/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" /> {queryResult.queryTitle}
              </h4>
              <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                <span className="font-bold text-slate-400">Gemini SQL Interpretation:</span> {queryResult.interpretation}
              </p>
            </div>
            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full shrink-0 flex items-center gap-1 self-start sm:self-auto">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> DB Execution OK
            </span>
          </div>

          {/* KPI Metrics row */}
          {queryResult.summaryMetrics && queryResult.summaryMetrics.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(queryResult.summaryMetrics || []).map((metric, idx) => (
                <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    {metric.label}
                  </span>
                  <span className="text-xl font-black text-white block">{metric.value}</span>
                  <span className="text-[10px] font-bold text-amber-400 block mt-0.5">{metric.change}</span>
                </div>
              ))}
            </div>
          )}

          {/* Grid Layout: Dynamic Table & Visual Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Table View */}
            <div className="lg:col-span-7 bg-slate-900/90 rounded-xl border border-slate-700/80 overflow-hidden p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-amber-400" /> Database Records ({(queryResult.tableRows || []).length})
                </span>
                <span className="text-[10px] font-semibold text-slate-400">Live Query Engine</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400">
                      {(queryResult.tableHeaders || []).map((header, idx) => (
                        <th key={idx} className="py-2 px-2.5">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200 font-medium text-[11px]">
                    {(queryResult.tableRows || []).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                        {(row || []).map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-2.5">
                            {cIdx === 0 ? <span className="font-extrabold text-white">{cell}</span> : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Chart */}
            <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-700/80 p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Visual Distribution ({(queryResult.chartType || 'bar').toUpperCase()})
                </span>
              </div>

              {/* Simple Responsive Bar Visualizer */}
              <div className="space-y-2 py-2">
                {(queryResult.chartData || []).map((item, idx) => {
                  const maxVal = Math.max(...(queryResult.chartData || []).map((d) => d.value)) || 1;
                  const pct = Math.round((item.value / maxVal) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-slate-300">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-bold text-amber-300">{item.value.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <span className="text-[10px] text-slate-400 font-medium italic block text-right">
                Auto-scaled by Gemini Analytics Engine
              </span>
            </div>
          </div>

          {/* Executive Action Banner */}
          {queryResult.actionableInsight && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black text-amber-300 block">AI Recommended Operational Action:</span>
                <p className="text-xs text-slate-200 mt-0.5 font-medium leading-relaxed">
                  {queryResult.actionableInsight}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
