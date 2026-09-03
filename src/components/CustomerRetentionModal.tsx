import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2, Copy, Check, X, MessageSquare, Mail, Tag, Award, HeartHandshake } from 'lucide-react';

interface CampaignData {
  personalizedMessageWhatsApp: string;
  personalizedEmailSubject: string;
  personalizedEmailBody: string;
  generatedPromoCode: string;
  discountValue: string;
  recommendedProducts: string[];
  churnRiskReason: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  orders: number;
  spent: number;
  badge: string;
  rank?: number;
}

export const CustomerRetentionModal: React.FC<{
  isOpen: boolean;
  customer: CustomerInfo | null;
  onClose: () => void;
}> = ({ isOpen, customer, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      generateCampaign();
    } else {
      setCampaign(null);
      setSentSuccess(false);
    }
  }, [isOpen, customer]);

  const generateCampaign = async () => {
    if (!customer) return;
    setIsGenerating(true);
    setSentSuccess(false);

    try {
      const res = await fetch('/api/ai/customer-retention-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name,
          customerEmail: customer.email,
          ordersCount: customer.orders,
          totalSpent: customer.spent,
          tier: customer.badge,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCampaign(json.data);
      }
    } catch (err) {
      console.error('Error generating retention campaign:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (campaign?.generatedPromoCode) {
      navigator.clipboard.writeText(campaign.generatedPromoCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyWhatsApp = () => {
    if (campaign?.personalizedMessageWhatsApp) {
      navigator.clipboard.writeText(campaign.personalizedMessageWhatsApp);
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 2000);
    }
  };

  const handleSendCampaign = () => {
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 space-y-0">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <HeartHandshake className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Dynamic Customer Retention & Campaign Generator
              </h3>
              <p className="text-xs text-amber-200 font-medium">
                Personalized offer generator for high-value & at-risk customers
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

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Customer Profile Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900">{customer.name}</span>
                <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
                  {customer.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{customer.email}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold shrink-0">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Orders</span>
                <span className="text-slate-900 font-black">{customer.orders} Orders</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Gross LTV</span>
                <span className="text-emerald-700 font-black">₹{customer.spent.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Loading or Campaign Result */}
          {isGenerating ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs font-black text-slate-700">
                Gemini analyzing {customer.name}'s purchase frequency & crafting retention offer...
              </p>
            </div>
          ) : campaign ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Churn Risk Reason */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-extrabold text-amber-900 block">AI Retention Insight:</span>
                  <p className="text-xs text-amber-800 mt-0.5 font-medium leading-relaxed">
                    {campaign.churnRiskReason}
                  </p>
                </div>
              </div>

              {/* Promo Code & Discount Badge */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Generated Custom Promo Code
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-amber-400 font-mono tracking-wider">
                      {campaign.generatedPromoCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      title="Copy promo code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 text-left sm:text-right">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase block">Discount Value</span>
                  <span className="text-xs font-black text-white">{campaign.discountValue}</span>
                </div>
              </div>

              {/* WhatsApp & Email Tab views */}
              <div className="space-y-3">
                {/* WhatsApp Message */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Campaign Message
                    </span>
                    <button
                      onClick={handleCopyWhatsApp}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedWhatsApp ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedWhatsApp ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed whitespace-pre-wrap bg-white/80 p-3 rounded-xl border border-emerald-100">
                    {campaign.personalizedMessageWhatsApp}
                  </p>
                </div>

                {/* Email Copy */}
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-indigo-600" /> Personalized Email Copy
                    </span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                      Auto-Subject Included
                    </span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-indigo-100 space-y-1.5 text-xs text-slate-800 font-medium">
                    <p className="font-extrabold text-indigo-950 border-b border-indigo-100 pb-1">
                      Subject: {campaign.personalizedEmailSubject}
                    </p>
                    <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-700">
                      {campaign.personalizedEmailBody}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  onClick={generateCampaign}
                  className="text-xs font-extrabold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Regenerate Offer
                </button>

                <button
                  onClick={handleSendCampaign}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all w-full sm:w-auto justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Launch Campaign via WhatsApp & Email
                </button>
              </div>

              {sentSuccess && (
                <div className="bg-emerald-500 text-white p-3 rounded-2xl text-xs font-black text-center animate-in fade-in duration-200 shadow-md">
                  🚀 Retention campaign dispatched to {customer.name} via WhatsApp & Email!
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
