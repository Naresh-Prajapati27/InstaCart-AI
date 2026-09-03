import React from 'react';
import { Sparkles, Utensils, HeartPulse, BarChart3, Bot, Wallet, PartyPopper, Camera } from 'lucide-react';

interface AIFeaturesHubBarProps {
  onOpenGroceryGenerator: () => void;
  onOpenRecipeModal: () => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenShoppingChatbot?: () => void;
  onOpenBudgetBasket?: () => void;
  onOpenEventRecommendations?: () => void;
  onOpenNutritionAdvisor?: () => void;
  onOpenSnapAndRestock?: () => void;
}

export const AIFeaturesHubBar: React.FC<AIFeaturesHubBarProps> = ({
  onOpenGroceryGenerator,
  onOpenRecipeModal,
  onOpenCart,
  onOpenAdmin,
  onOpenShoppingChatbot,
  onOpenBudgetBasket,
  onOpenEventRecommendations,
  onOpenNutritionAdvisor,
  onOpenSnapAndRestock,
}) => {
  const aiFeatures = [
    {
      id: 'snap-and-restock',
      title: 'Snap & Restock AI',
      subtitle: 'Visual Search & OCR',
      icon: <Camera className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-400/30',
      action: onOpenSnapAndRestock || onOpenGroceryGenerator,
      badge: '📸 Visual AI',
    },
    {
      id: 'event-recommendations',
      title: 'AI Event Planner',
      subtitle: '10 Event Categories',
      icon: <PartyPopper className="w-4 h-4 text-pink-600" />,
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200/90 text-pink-950 shadow-sm hover:shadow-pink-500/20',
      action: onOpenEventRecommendations || onOpenGroceryGenerator,
      badge: '🎂 Party AI',
    },
    {
      id: 'shopping-chatbot',
      title: 'AI Concierge',
      subtitle: '24/7 Shopping Bot',
      icon: <Bot className="w-4 h-4 text-teal-600" />,
      color: 'bg-teal-50 hover:bg-teal-100 border-teal-200/90 text-teal-950 shadow-sm hover:shadow-teal-500/20',
      action: onOpenShoppingChatbot || onOpenGroceryGenerator,
      badge: 'Chatbot',
    },
    {
      id: 'budget-basket',
      title: 'AI Budget Basket',
      subtitle: 'Target Budget Cart',
      icon: <Wallet className="w-4 h-4 text-amber-600" />,
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200/90 text-amber-950 shadow-sm hover:shadow-amber-500/20',
      action: onOpenBudgetBasket || onOpenGroceryGenerator,
      badge: 'Budget',
    },
    {
      id: 'grocery-generator',
      title: 'Smart Grocery Planner',
      subtitle: 'Prompt to Cart List',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200/90 text-emerald-950 shadow-sm hover:shadow-emerald-500/20',
      action: onOpenGroceryGenerator,
      badge: '1-Click',
    },
    {
      id: 'recipe-converter',
      title: 'Recipe Auto-Adder',
      subtitle: 'Recipe to Cart',
      icon: <Utensils className="w-4 h-4 text-amber-600" />,
      color: 'bg-amber-50 hover:bg-amber-100 border-amber-200/90 text-amber-950 shadow-sm hover:shadow-amber-500/20',
      action: onOpenRecipeModal,
      badge: 'Auto',
    },
    {
      id: 'nutrition-advisor',
      title: 'AI Dietitian',
      subtitle: 'Health & Goal Advice',
      icon: <HeartPulse className="w-4 h-4 text-rose-600" />,
      color: 'bg-rose-50 hover:bg-rose-100 border-rose-200/90 text-rose-950 shadow-sm hover:shadow-rose-500/20',
      action: onOpenNutritionAdvisor || onOpenCart,
      badge: 'Diet AI',
    },
    {
      id: 'demand-forecast',
      title: 'AI Shopping Trends',
      subtitle: 'Top Items & Insights',
      icon: <BarChart3 className="w-4 h-4 text-blue-600" />,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200/90 text-blue-950 shadow-sm hover:shadow-blue-500/20',
      action: onOpenShoppingChatbot || onOpenGroceryGenerator,
      badge: 'Trends',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" /> Full AI Suite Active
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white">InstaCart Gemini AI Suite</h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 hidden sm:inline-block">
            Powered by Google Gemini 3.6 Flash & 2.5 Vision
          </span>
        </div>

        {/* AI Feature Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {(aiFeatures || []).map((feat) => (
            <button
              key={feat.id}
              onClick={feat.action}
              className={`p-2.5 rounded-2xl border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 group flex flex-col justify-between cursor-pointer ${feat.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1 rounded-xl bg-white shadow-xs group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-white/90 text-slate-900 font-mono shadow-2xs">
                    {feat.badge}
                  </span>
                </div>
                <h4 className="text-[11px] font-black line-clamp-1 leading-snug">{feat.title}</h4>
              </div>
              <p className="text-[9px] font-semibold opacity-80 mt-1 line-clamp-1">{feat.subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
