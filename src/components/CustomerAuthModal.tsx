import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  Check,
  ShoppingCart,
  Truck,
  ShieldAlert,
  LogIn,
  LogOut,
  UserPlus,
  CheckCircle2,
  Phone,
  Compass,
  ArrowRight,
  RotateCcw,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { AppRole, CustomerUser, UserRole, UserProfile } from '../types';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserProfile | CustomerUser, role: AppRole) => void;
  currentCustomer: CustomerUser | UserProfile | null;
  onCustomerLogout?: () => void;
  activeRole: AppRole;
  setActiveRole: (role: AppRole) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  currentCustomer,
  onCustomerLogout,
  activeRole,
  setActiveRole,
}) => {
  const isLoggedIn = Boolean(
    currentCustomer &&
      !currentCustomer.isGuest &&
      currentCustomer.email !== 'guest@demo.com' &&
      currentCustomer.id !== 'guest_user'
  );

  // Translate AppRole to UserRole
  const getInitialRole = (): UserRole => {
    if (activeRole === 'delivery') return 'driver';
    if (activeRole === 'admin') return 'admin';
    return 'customer';
  };

  const [selectedRole, setSelectedRole] = useState<UserRole>(getInitialRole());
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [verificationEmailSent, setVerificationEmailSent] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('Honda Activa EV');
  const [city, setCity] = useState('New Delhi');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');

  if (!isOpen) return null;

  const formatNameFromEmail = (rawEmail: string) => {
    const handle = rawEmail.split('@')[0] || 'User';
    return handle
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Roles definition for tabs
  const roles = [
    {
      id: 'customer' as UserRole,
      appRole: 'customer' as AppRole,
      label: 'Customer',
      icon: ShoppingCart,
      badge: '🛒',
      desc: 'Shop groceries & track orders',
    },
    {
      id: 'driver' as UserRole,
      appRole: 'delivery' as AppRole,
      label: 'Delivery Agent',
      icon: Truck,
      badge: '🚚',
      desc: 'Earn delivering express orders',
    },
    {
      id: 'admin' as UserRole,
      appRole: 'admin' as AppRole,
      label: 'Admin',
      icon: ShieldAlert,
      badge: '👨‍💼',
      desc: 'Store operations & rider approvals',
    },
  ];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    setSuccessMsg('');
    setResetSuccessMsg('');
    setVerificationEmailSent(null);

    // Enforce Admin Mode Rules: Login Only, no register or forgot password by default
    if (role === 'admin') {
      setMode('login');
      if (!email || email === 'princeshukla089@gmail.com') {
        setEmail('admin@instacartai.com');
        setPassword('Admin@123');
      }
    } else {
      if (email === 'admin@instacartai.com') {
        setEmail('');
        setPassword('');
      }
      setMode('login');
    }
  };

  const handleGoogleSignIn = async () => {
    if (selectedRole === 'admin') {
      setErrorMsg('Google Sign-In is disabled for Admin portal access.');
      return;
    }
    if (selectedRole === 'driver') {
      setErrorMsg('Google Sign-In is disabled for Delivery Agents. Please register using Email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { signInWithGoogleFirebase } = await import('../firebase');
      const profile = await signInWithGoogleFirebase(selectedRole);

      if (selectedRole === 'customer') {
        localStorage.setItem('instacart_customer_user', JSON.stringify(profile));
        localStorage.setItem('instacart_user_role', 'customer');
      } else {
        localStorage.removeItem('instacart_customer_user');
        localStorage.setItem('instacart_user_role', selectedRole);
      }

      setIsLoading(false);
      setSuccessMsg(`Google Sign-In successful! Welcome ${profile.name}`);

      const targetAppRole: AppRole = selectedRole === 'driver' ? 'delivery' : selectedRole === 'admin' ? 'admin' : 'customer';

      setTimeout(() => {
        setActiveRole(targetAppRole);
        onSuccessLogin(profile, targetAppRole);
        onClose();
      }, 700);
    } catch (err: any) {
      console.warn('Google Auth Error:', err);
      setIsLoading(false);
      setErrorMsg(err?.message || 'Google Sign-In failed. Please try Email login.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'admin') {
      setErrorMsg('Public registration is strictly disabled for Admin accounts.');
      return;
    }

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
    setSuccessMsg('');

    try {
      const { signUpWithEmailFirebase } = await import('../firebase');
      const formattedName = name.trim() || formatNameFromEmail(email);

      const profile = await signUpWithEmailFirebase(
        formattedName,
        email,
        password,
        selectedRole,
        { phone, vehicle, city }
      );

      setIsLoading(false);

      // Trigger verification email dispatch
      try {
        await fetch('/api/auth/send-verification-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase(), name: formattedName, role: selectedRole }),
        });
      } catch (e) {
        console.warn('Send verification email error:', e);
      }

      setVerificationEmailSent(email.trim().toLowerCase());
      setSuccessMsg(`Registration successful! Welcome ${profile.name}`);

      const targetAppRole: AppRole =
        profile.role === 'driver' ? 'delivery' : profile.role === 'admin' ? 'admin' : 'customer';

      if (profile.role === 'customer') {
        localStorage.setItem('instacart_customer_user', JSON.stringify(profile));
        localStorage.setItem('instacart_user_role', 'customer');
      } else {
        localStorage.removeItem('instacart_customer_user');
        localStorage.setItem('instacart_user_role', profile.role);
      }

      setTimeout(() => {
        setActiveRole(targetAppRole);
        onSuccessLogin(profile, targetAppRole);
        onClose();
      }, 900);
    } catch (err: any) {
      setIsLoading(false);
      if (
        err?.code === 'auth/email-already-in-use' ||
        err?.message === 'User already exists. Please sign in.' ||
        err?.message?.includes('already in use')
      ) {
        setErrorMsg('User already exists. Please sign in.');
      } else {
        setErrorMsg(err?.message || 'Registration failed. Please try again.');
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
    setSuccessMsg('');

    try {
      const { signInWithEmailFirebase } = await import('../firebase');
      const profile = await signInWithEmailFirebase(email, password, selectedRole);

      const targetAppRole: AppRole =
        profile.role === 'driver' ? 'delivery' : profile.role === 'admin' ? 'admin' : 'customer';

      if (profile.role === 'customer') {
        localStorage.setItem('instacart_customer_user', JSON.stringify(profile));
        localStorage.setItem('instacart_user_role', 'customer');
      } else {
        localStorage.removeItem('instacart_customer_user');
        localStorage.setItem('instacart_user_role', profile.role);
      }

      setIsLoading(false);
      setSuccessMsg(`Authenticated as ${profile.name} (${profile.role.toUpperCase()})`);

      setTimeout(() => {
        setActiveRole(targetAppRole);
        onSuccessLogin(profile, targetAppRole);
        onClose();
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

  const currentRoleObj = roles.find((r) => r.id === selectedRole) || roles[0];

  return (
    <div
      className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 overflow-y-auto p-3 sm:p-4 md:p-6 flex items-center justify-center min-h-screen"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in duration-200 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Badge & Title */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-slate-300 hover:text-white w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-2 mb-1.5 pr-8">
            <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" />
              PORTAL AUTHENTICATION
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{currentRoleObj.badge}</span>
            <span>{currentRoleObj.label} Login & Access</span>
          </h3>
          <p className="text-xs text-slate-300 font-medium mt-1">
            {selectedRole === 'admin'
              ? 'Authorized System Administrator Console'
              : selectedRole === 'driver'
              ? 'Delivery Partner Onboarding & Dashboard Access'
              : 'Grocery Shopping & Order Management'}
          </p>
        </div>

        {/* Main Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Active Signed-In Customer Account Profile Area */}
          {currentCustomer && (
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white border border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {currentCustomer.avatar ? (
                    <img
                      src={currentCustomer.avatar}
                      alt={currentCustomer.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center uppercase border-2 border-emerald-300 shadow-md">
                      {currentCustomer.name ? currentCustomer.name.trim().charAt(0) : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                        {currentCustomer.name}
                      </h4>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                        Active Profile
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-200/90 mt-0.5">
                      {currentCustomer.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/10">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Phone Number</span>
                  <span className="font-extrabold text-slate-200">{currentCustomer.phone || '+91 98765 43210'}</span>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Auth Method</span>
                  <span className="font-extrabold text-emerald-300 uppercase">
                    {currentCustomer.provider === 'google' ? 'Google OAuth' : 'Email & Password'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium text-slate-400">
                  InstaCart AI Account Management
                </span>
                {onCustomerLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onCustomerLogout();
                      onClose();
                    }}
                    className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 active:scale-95 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoggedIn && (
            <>
              {/* Role Selection Bar (Hidden when in Customer Area to isolate Customer Data) */}
              {activeRole !== 'customer' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Select Access Portal
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                    {roles.map((r) => {
                      const isSelected = selectedRole === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => handleRoleChange(r.id)}
                          className={`py-2 px-1.5 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'bg-white text-emerald-950 shadow-sm border border-slate-200/80 scale-[1.02]'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                          }`}
                        >
                          <span className="text-sm">{r.badge}</span>
                          <span className="text-[10px] sm:text-[11px] truncate w-full text-center">{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

          {/* Verification / Approval Pending State Screen for Delivery Agent */}
          {verificationEmailSent ? (
            <div className="py-5 px-3 text-center space-y-4 animate-in fade-in zoom-in duration-200 bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                <Mail className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <span className="bg-amber-200 text-amber-900 border border-amber-300 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-700" /> Pending Admin Review
                </span>
                <h4 className="text-lg font-black text-slate-900">Email Verification Sent</h4>
                <p className="text-xs font-medium text-slate-700 max-w-sm mx-auto leading-relaxed">
                  We have sent a verification email to <strong className="text-slate-900">{verificationEmailSent}</strong>. Please check your inbox and spam folder.
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
                    setEmail(verificationEmailSent);
                    setPassword('');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-98 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  Proceed to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Notifications */}
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {successMsg}
                </div>
              )}
              {resetSuccessMsg && (
                <div className="bg-sky-50 border border-sky-200 text-sky-900 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> {resetSuccessMsg}
                </div>
              )}

              {/* Mode Selector Header (Sign In / Register / Forgot) */}
              {selectedRole !== 'admin' && mode !== 'forgot' && (
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className={`pb-2 px-4 text-xs font-black transition-all border-b-2 ${
                      mode === 'login'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className={`pb-2 px-4 text-xs font-black transition-all border-b-2 ${
                      mode === 'register'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Forgot Password Mode */}
              {mode === 'forgot' ? (
                <form onSubmit={handleForgotPassword} className="space-y-3 pt-1">
                  <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-sky-900 font-medium">
                    Enter your registered email address below. We will send you a password reset link.
                  </div>
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
                      ← Back to Login
                    </button>
                  </div>
                </form>
              ) : (
                /* Login / Register Forms */
                <form
                  onSubmit={mode === 'login' ? handleLogin : handleRegister}
                  className="space-y-3 pt-1"
                >
                  {/* Admin Disclaimer Notice */}
                  {selectedRole === 'admin' && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
                      <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin Credentials Only
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Admin accounts are restricted to authorized store staff. Pre-configured credentials: <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-950">admin@instacartai.com</code> / <code className="bg-amber-100 font-mono px-1 py-0.5 rounded text-amber-950">Admin@123</code>
                      </p>
                    </div>
                  )}

                  {/* Delivery Partner Registration Notice */}
                  {selectedRole === 'driver' && mode === 'register' && (
                    <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl text-xs text-teal-900 space-y-0.5">
                      <p className="font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" /> Registration Review Policy
                      </p>
                      <p className="text-[11px] text-teal-800">
                        Upon registration, an email verification link will be sent to you. Access to the Delivery Agent dashboard requires approval by an Admin.
                      </p>
                    </div>
                  )}

                  {/* Name Input for Registration */}
                  {mode === 'register' && selectedRole !== 'admin' && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
                      <div className="relative flex items-center">
                        <User className="w-4 h-4 text-slate-400 absolute left-3" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Prince Shukla"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Delivery Agent Fields */}
                  {mode === 'register' && selectedRole === 'driver' && (
                    <>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number *</label>
                        <div className="relative flex items-center">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 00000"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Vehicle Type</label>
                          <select
                            value={vehicle}
                            onChange={(e) => setVehicle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                          >
                            <option value="Honda Activa EV">Honda Activa EV</option>
                            <option value="TVS iQube">TVS iQube</option>
                            <option value="Hero Electric">Hero Electric</option>
                            <option value="Bicycle">Bicycle / E-bike</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">City</label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="New Delhi"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email Input */}
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

                  {/* Password Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-700">Password *</label>
                      {mode === 'login' && selectedRole !== 'admin' && (
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all mt-2"
                  >
                    {isLoading ? (
                      <span>Authenticating...</span>
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" /> Sign In as {currentRoleObj.label} →
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Register as {currentRoleObj.label} →
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Google Sign-In Button (Customer Only) */}
              {selectedRole === 'customer' && mode !== 'forgot' && (
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
            </>
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
};
