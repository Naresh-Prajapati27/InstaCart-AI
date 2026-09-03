import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, X, LogIn, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import logoImg from '../assets/images/grocery_truck_logo_1786025966309.jpg';

interface AdminLoginPageProps {
  onSuccessLogin: (user: UserProfile) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccessLogin }) => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'forgot'>('login');

  // Form Fields - Default pre-filled with Admin account for convenience
  const [email, setEmail] = useState('admin@instacartai.com');
  const [password, setPassword] = useState('Admin@123');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg('Please enter Admin Email and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { signInWithEmailFirebase } = await import('../firebase');
      const profile = await signInWithEmailFirebase(email, password, 'admin');

      localStorage.removeItem('instacart_customer_user');
      localStorage.setItem('instacart_user_role', 'admin');

      setIsLoading(false);
      setSuccessMsg(`Authenticated as Administrator (${profile.name})`);

      setTimeout(() => {
        onSuccessLogin(profile);
        navigate('/admin/dashboard');
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Incorrect Admin credentials.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your admin email address to receive reset instructions.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setResetSuccessMsg('');

    try {
      const { sendPasswordResetFirebase } = await import('../firebase');
      await sendPasswordResetFirebase(email);
      setIsLoading(false);
      setResetSuccessMsg(`We have sent a password reset email to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Failed to send reset email. Please verify your admin email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative selection:bg-amber-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-amber-600/10 blur-3xl pointer-events-none" />

      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 p-6 text-white relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 p-2 rounded-full transition-all"
            title="Close and return to portal selection"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <img
              src={logoImg}
              alt="InstaCart AI Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md border border-amber-400/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">InstaCart</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">AI</span>
              </div>
              <p className="text-[10px] font-semibold text-amber-300 tracking-tight">
                AI-Powered Grocery Delivery Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 pr-8">
            <span className="bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              RESTRICTED CONSOLE
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>👨‍💼</span>
            <span>Store Operations Admin</span>
          </h3>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Store inventory control, price editing, rider approvals, and analytics.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Admin Credentials Policy Notice */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs space-y-1">
            <p className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Authorized Admin Login Only
            </p>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Public registration is disabled for Admin roles. Access is restricted to store management. Pre-configured credentials:
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-mono font-bold text-amber-950">
              <span className="bg-amber-200/80 px-2 py-0.5 rounded">admin@instacartai.com</span>
              <span className="bg-amber-200/80 px-2 py-0.5 rounded">Admin@123</span>
            </div>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {resetSuccessMsg && (
            <div className="bg-sky-50 border border-sky-200 text-sky-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {/* Forgot Password Form vs Login Form */}
          {mode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-3 pt-1">
              <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-sky-900 font-medium">
                Enter your Administrator email address. We will send you a password reset link.
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address *</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@instacartai.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 active:scale-98 transition-all"
              >
                {isLoading ? 'Sending Reset Link...' : 'Send Password Reset Email'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 underline"
                >
                  ← Back to Admin Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Admin Email *</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@instacartai.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-700">Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg('');
                      setResetSuccessMsg('');
                    }}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-800 underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 active:scale-98 transition-all mt-2"
              >
                {isLoading ? (
                  <span>Authenticating Admin...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Admin Console Sign In →
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('instacart_user_role', 'guest_admin');
                  navigate('/admin/dashboard');
                }}
                className="w-full bg-slate-100 hover:bg-amber-50 text-slate-800 hover:text-amber-900 border border-slate-200 hover:border-amber-300 font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Explore Admin Console in Guest Mode</span>
              </button>
            </form>
          )}

          {/* Bottom Navigation Link */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              ← Select Another Role Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
