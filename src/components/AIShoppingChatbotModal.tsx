import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  X,
  ShoppingBag,
  Bot,
  User,
  Loader2,
  Plus,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Product } from '../types';

interface AIShoppingChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onAddMultipleToCart?: (items: { product: Product; quantity: number }[]) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  products?: Product[];
}

export const AIShoppingChatbotModal: React.FC<AIShoppingChatbotModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onAddMultipleToCart,
}) => {
  // Chat State
  const INITIAL_MESSAGE: Message = {
    id: 'msg_1',
    sender: 'bot',
    text: '👋 Hi there! I am your 24/7 InstaCart AI Shopping Concierge. Ask me anything like "What ingredients do I need for Italian pasta?", "Suggest high-protein snacks under ₹200", or "Find organic produce deals"!',
  };

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handler for Sending Chat Message
  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = customPrompt || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = { id: `msg_${Date.now()}`, sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/shopping-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: messages.slice(-6).map((m) => `${m.sender}: ${m.text}`),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const botMsg: Message = {
          id: `msg_${Date.now() + 1}`,
          sender: 'bot',
          text: data.data.reply,
          products: data.data.suggestedProducts,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Invalid response from AI chatbot endpoint');
      }
    } catch (err) {
      console.error(err);
      // Fallback matching products locally from catalog if server error or timeout
      const searchTerms = query.toLowerCase().split(' ');
      const matched = products.filter((p) =>
        searchTerms.some(
          (term) =>
            term.length > 2 &&
            (p.name.toLowerCase().includes(term) ||
              p.categoryName.toLowerCase().includes(term) ||
              p.dietaryTags.some((t) => t.toLowerCase().includes(term)))
        )
      ).slice(0, 4);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'bot',
          text: `Here are fresh items from our catalog matching "${query}":`,
          products: matched.length > 0 ? matched : products.slice(0, 3),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[620px] sm:h-[650px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Bot className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold tracking-tight">AI Shopping Assistant</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-emerald-300" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Recipes, ingredient suggestions & dietary grocery recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1 font-bold"
              title="Clear & Reset Chat"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/70 p-3 sm:p-4 space-y-3">
          {(messages || []).map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 max-w-[92%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-emerald-400'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Suggested Products attached to Bot Message */}
                {m.products && m.products.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" /> Matched Catalog Items ({m.products.length})
                      </span>
                      {onAddMultipleToCart && m.products.length > 1 && (
                        <button
                          onClick={() => {
                            if (onAddMultipleToCart && m.products) {
                              onAddMultipleToCart(m.products.map((p) => ({ product: p, quantity: 1 })));
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition-transform active:scale-95"
                        >
                          <ShoppingBag className="w-3 h-3" /> Add All ({m.products.length}) To Cart
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(m.products || []).map((p) => (
                        <div
                          key={p.id}
                          className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-900 text-xs block truncate">{p.name}</span>
                              <span className="text-xs font-extrabold text-emerald-700">₹{p.price}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => onAddToCart(p)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg shrink-0 shadow-xs active:scale-95 transition-transform"
                            title="Add to Cart"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 p-3 rounded-2xl w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> Searching InstaCart AI catalog...
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips & Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 pl-1">
              Quick AI Prompts:
            </span>
            {[
              '🎂 Cake ingredients',
              '🍝 Pasta recipe',
              '🥪 High-protein snacks',
              '⏱️ 15-min dinner under ₹300',
              '☕ Chai & Coffee',
              '🥗 Organic produce',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  const queryText = `What ingredients are needed for ${chip.replace(/^[^\w]+/, '').trim()}?`;
                  handleSend(undefined, queryText);
                }}
                className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-full shrink-0 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="bg-slate-50 border border-slate-200 rounded-2xl p-1.5 flex gap-2 shadow-xs focus-within:border-emerald-500 focus-within:bg-white transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask e.g. 'What ingredients do I need for Butter Chicken?' or 'Healthy breakfast under ₹200'..."
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" /> Ask AI
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
