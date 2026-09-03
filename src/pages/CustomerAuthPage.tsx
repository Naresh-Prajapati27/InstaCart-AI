import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, X, LogIn, LogOut, UserPlus, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { CustomerUser, UserProfile } from '../types';
import logoImg from '../assets/images/grocery_truck_logo_1786025966309.jpg';

interface CustomerAuthPageProps {
  onSuccessLogin: (user: UserProfile | CustomerUser) => void;
  currentCustomer?: CustomerUser | UserProfile | null;
  onCustomerLogout?: () => void;
}

export const CustomerAuthPage: React.FC<CustomerAuthPageProps> = ({
  onSuccessLogin,
  currentCustomer,
  onCustomerLogout,
}) => {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(
    currentCustomer &&
      !currentCustomer.isGuest &&
      currentCustomer.email !== 'guest@demo.com' &&
      currentCustomer.id !== 'guest_user'
  );

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [verificationEmailSent, setVerificationEmailSent] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  const formatNameFromEmail = (rawEmail: string) => {
    const handle = rawEmail.split('@')[0] || 'User';
    return handle
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { signInWithGoogleFirebase } = await import('../firebase');
      const profile = await signInWithGoogleFirebase('customer');

      localStorage.setItem('instacart_customer_user', JSON.stringify(profile));
      localStorage.setItem('instacart_user_role', 'customer');

      setIsLoading(false);
      setSuccessMsg(`Google Sign-In successful! Welcome ${profile.name}`);

      setTimeout(() => {
        onSuccessLogin(profile);
        navigate('/customer/dashboard');
      }, 700);
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      setIsLoading(false);
      setErrorMsg(err?.message || 'Google Sign-In failed. Please try Email login.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg('Please enter Email and Password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { signUpWithEmailFirebase } = await import('../firebase');
      const formattedName = name.trim() || formatNameFromEmail(email);

      const profile = await signUpWithEmailFirebase(
        formattedName,
        email,
        password,
        'customer'
      );

      setIsLoading(false);
      localStorage.setItem('instacart_customer_user', JSON.stringify(profile));
      localStorage.setItem('instacart_user_role', 'customer');
      setSuccessMsg(`Registration successful! Welcome ${profile.name}`);

      setTimeout(() => {
        onSuccessLogin(profile);
        navigate('/customer/dashboard');
      }, 800);
    } catch (err: any) {
      setIsLoading(false);
      if (err?.code === 'auth/email-already-in-use' || err?.message?.includes('already in use')) {
        setErrorMsg('User already exists with this email. Please sign in instead.');
      } else {
        setErrorMsg(err?.message || 'Failed to create customer account.');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setErrorMsg('Please enter Email and Password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { signInWithEmailFirebase } = await import('../firebase');
      const profile = await signInWithEmailFirebase(email, password, 'customer');

      localStorage.setItem('instacart_customer_user', JSON.stringify(profile));
      localStorage.setItem('instacart_user_role', 'customer');

      setIsLoading(false);
      setSuccessMsg(`Authenticated as ${profile.name}`);

      setTimeout(() => {
        onSuccessLogin(profile);
        navigate('/customer/dashboard');
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Email or password is incorrect.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address to receive reset instructions.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setResetSuccessMsg('');

    try {
      const { sendPasswordResetFirebase } = await import('../firebase');
      await sendPasswordResetFirebase(email);
      setIsLoading(false);
      setResetSuccessMsg(`We have sent a password reset link to ${email}. Please check your inbox.`);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Failed to send reset email. Please verify your email address.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative selection:bg-emerald-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-emerald-600/10 blur-3xl pointer-events-none" />

      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 p-6 text-white relative">
          <button
            onClick={() => navigate(isLoggedIn ? '/customer/dashboard' : '/')}
            className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 p-2 rounded-full transition-all"
            title={isLoggedIn ? "Return to Storefront" : "Close and return to portal selection"}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <img
              src={logoImg}
              alt="InstaCart AI Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md border border-emerald-400/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">InstaCart</span>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">AI</span>
              </div>
              <p className="text-[10px] font-semibold text-emerald-300 tracking-tight">
                AI-Powered Grocery Delivery Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 pr-8">
            <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" />
              {isLoggedIn ? 'CUSTOMER ACCOUNT' : 'CUSTOMER PORTAL'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>🛒</span>
            <span>{isLoggedIn ? 'Customer Profile' : 'Customer Authentication'}</span>
          </h3>
          <p className="text-xs text-slate-300 font-medium mt-1">
            {isLoggedIn
              ? 'Manage your customer account and signed-in profile details.'
              : 'Shop 15-minute groceries, AI recipes, and track live orders.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {isLoggedIn && currentCustomer ? (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-4">
                  {currentCustomer.avatar ? (
                    <img
                      src={currentCustomer.avatar}
                      alt={currentCustomer.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xl flex items-center justify-center uppercase border-2 border-emerald-300 shadow-md">
                      {currentCustomer.name ? currentCustomer.name.trim().charAt(0) : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-black text-white leading-tight">
                        {currentCustomer.name}
                      </h4>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                        Signed In
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-300/90 mt-1">
                      {currentCustomer.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-white/10">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Phone Number</span>
                    <span className="font-extrabold text-slate-200">{currentCustomer.phone || '+91 98765 43210'}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Auth Method</span>
                    <span className="font-extrabold text-emerald-300 uppercase">
                      {currentCustomer.provider === 'google' ? 'Google OAuth' : 'Email & Password'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/customer/dashboard')}
                    className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Continue Shopping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onCustomerLogout) onCustomerLogout();
                      navigate('/customer/dashboard');
                    }}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
          {/* Email Verification Sent Screen */}
          {verificationEmailSent ? (
            <div className="py-5 px-3 text-center space-y-4 animate-in fade-in zoom-in duration-200 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <Mail className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-900">Email Verification Sent</h4>
                <p className="text-xs font-medium text-slate-700 max-w-sm mx-auto leading-relaxed">
                  We sent a verification link to <strong className="text-slate-900">{verificationEmailSent}</strong>. Please check your inbox and spam folder.
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={async () => {
                    const { resendVerificationEmailFirebase } = await import('../firebase');
                    const res = await resendVerificationEmailFirebase(verificationEmailSent);
                    setSuccessMsg(res.message);
                  }}
                  className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2.5 px-4 rounded-xl text-xs border border-amber-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Resend Verification Email
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const { markUserEmailAsVerifiedFirebase } = await import('../firebase');
                    await markUserEmailAsVerifiedFirebase(verificationEmailSent);
                    setSuccessMsg('Email verified successfully! You can now sign in.');
                  }}
                  className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold py-2.5 px-4 rounded-xl text-xs border border-emerald-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verify Email Instantly (Demo / Test Link)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationEmailSent(null);
                    setMode('login');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  Proceed to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Alert messages */}
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

              {/* Mode Switcher Tabs */}
              {mode !== 'forgot' && (
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className={`pb-2.5 px-4 text-xs font-black transition-all border-b-2 ${
                      mode === 'login'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Customer Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className={`pb-2.5 px-4 text-xs font-black transition-all border-b-2 ${
                      mode === 'register'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Register Account
                  </button>
                </div>
              )}

              {/* Forgot Password View */}
              {mode === 'forgot' ? (
                <form onSubmit={handleForgotPassword} className="space-y-3 pt-1">
                  <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-sky-900 font-medium">
                    Enter your customer email address below. We will send you a password reset link.
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address *</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                  >
                    {isLoading ? 'Sending Reset Link...' : 'Send Password Reset Email'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                    >
                      ← Back to Customer Login
                    </button>
                  </div>
                </form>
              ) : (
                /* Login & Register Forms */
                <form
                  onSubmit={mode === 'login' ? handleLogin : handleRegister}
                  className="space-y-3 pt-1"
                >
                  {/* Full Name for Registration */}
                  {mode === 'register' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-slate-400 absolute left-3" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Sneha Patel"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address *</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Password *</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setErrorMsg('');
                            setResetSuccessMsg('');
                          }}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all mt-2"
                  >
                    {isLoading ? (
                      <span>Authenticating...</span>
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" /> Customer Sign In →
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Create Customer Account →
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Google Sign-In Button */}
              {mode !== 'forgot' && (
                <>
                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      OR WITH GOOGLE
                    </span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-98"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                      />
                    </svg>
                    Google Sign-In
                  </button>
                </>
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
            </>
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
};
