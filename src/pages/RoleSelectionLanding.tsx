import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Truck, ShieldAlert, Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import logoImg from '../assets/images/grocery_truck_logo_1786025966309.jpg';

export const RoleSelectionLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Glow background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-600/15 via-teal-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="InstaCart AI Logo"
            className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-emerald-500/20 border border-emerald-400/30"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              InstaCart <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 text-xs font-black px-1.5 py-0.5 rounded tracking-wide uppercase">AI</span>
            </h1>
            <p className="text-[11px] font-semibold text-emerald-400/90 tracking-tight">
              AI-Powered Grocery Delivery Platform
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.setItem('instacart_user_role', 'guest');
            localStorage.removeItem('instacart_customer_user');
            navigate('/customer/dashboard');
          }}
          className="text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>Browse Store Guest Mode</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
        </button>
      </header>

      {/* Main Role Selection Area */}
      <main className="max-w-5xl w-full mx-auto my-auto py-8 relative z-10 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Portal Selection
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Access Portal</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium">
            Select your role below to navigate to your dedicated authentication page.
          </p>
        </div>

        {/* 3 Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Customer */}
          <div
            onClick={() => navigate('/customer/auth')}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-all" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl sm:text-4xl p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform">
                  🛒
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Grocery Shop
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                  Customer
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                  Shop 15-minute express groceries with AI recipe baskets, restock alerts, and live GPS order tracking.
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Personalized Recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Recipe to Cart</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Budget Basket</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                className="w-full bg-emerald-600 group-hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 group-hover:shadow-emerald-500/30 transition-all"
              >
                <span>Continue as Customer</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Delivery Partner */}
          <div
            onClick={() => navigate('/delivery/auth')}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full pointer-events-none group-hover:bg-teal-500/10 transition-all" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl sm:text-4xl p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform">
                  🚚
                </span>
                <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 border border-teal-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Rider Network
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white group-hover:text-teal-300 transition-colors">
                  Delivery Partner
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                  Onboard as an express delivery agent, accept active store orders, and track your daily payouts.
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>AI Route Optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Live GPS Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Daily Earnings Dashboard</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                className="w-full bg-teal-600 group-hover:bg-teal-500 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 group-hover:shadow-teal-500/30 transition-all"
              >
                <span>Continue as Delivery Partner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Admin */}
          <div
            onClick={() => navigate('/admin/login')}
            className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-all" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl sm:text-4xl p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 shadow-inner group-hover:scale-110 transition-transform">
                  👨‍💼
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Store Control
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                    Admin
                  </h3>
                  <span className="text-[10px] font-bold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    🔒 Authorized Personnel Only
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
                  Manage store inventory, edit product prices, approve delivery riders, and view store analytics.
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-semibold text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Product & Inventory Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Order & Delivery Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>AI Analytics Dashboard</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <button
                type="button"
                className="w-full bg-amber-600 group-hover:bg-amber-500 text-white font-black py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 group-hover:shadow-amber-500/30 transition-all"
              >
                <span>Admin Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center py-4 relative z-10 text-xs text-slate-500 font-medium border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>Powered by React • Firebase Authentication • Firestore • Gemini AI</p>
        <div className="flex items-center gap-4 text-slate-400">
          <button onClick={() => navigate('/customer/auth')} className="hover:text-white">Customer Auth</button>
          <span>•</span>
          <button onClick={() => navigate('/delivery/auth')} className="hover:text-white">Delivery Auth</button>
          <span>•</span>
          <button onClick={() => navigate('/admin/login')} className="hover:text-white">Admin Login</button>
        </div>
      </footer>
    </div>
  );
};
