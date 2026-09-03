import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, X, LogIn, UserPlus, CheckCircle2, AlertCircle, Phone, Truck, Clock, Compass } from 'lucide-react';
import { UserProfile } from '../types';
import logoImg from '../assets/images/grocery_truck_logo_1786025966309.jpg';

interface DeliveryAuthPageProps {
  onSuccessLogin: (user: UserProfile) => void;
}

export const DeliveryAuthPage: React.FC<DeliveryAuthPageProps> = ({ onSuccessLogin }) => {
  const navigate = useNavigate();

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

  const formatNameFromEmail = (rawEmail: string) => {
    const handle = rawEmail.split('@')[0] || 'Rider';
    return handle
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      const { signUpWithEmailFirebase, saveAgentToFirestore } = await import('../firebase');
      const formattedName = name.trim() || formatNameFromEmail(email);

      const profile = await signUpWithEmailFirebase(
        formattedName,
        email,
        password,
        'driver',
        { phone, vehicle, city }
      );

      // Create DeliveryAgent in server memory & Firestore
      const agentId = profile.id || `agent_${Date.now()}`;
      const newAgentObj = {
        id: agentId,
        name: formattedName,
        phone: phone || '+91 98765 00000',
        email: email.trim().toLowerCase(),
        password,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formattedName)}`,
        vehicle: vehicle || 'Honda Activa EV',
        vehicleType: 'EV Scooter' as const,
        city: city || 'New Delhi',
        rating: 5.0,
        ratingsCount: 0,
        status: 'offline' as const,
        isSuspended: false,
        documentsVerified: false, // Requires Store Administrator Approval
        documents: {
          drivingLicense: { number: 'DL-REG-2024-9901', verified: false },
          aadhaarNumber: { number: '9981-2201-4412', verified: false },
          vehicleRC: { number: 'RC-TEMP-2024-110', verified: false },
        },
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        totalEarnings: 150,
        walletBalance: 150,
        incentivesEarned: 150,
        bankDetails: {
          accountName: formattedName,
          upiId: `${phone || '9876500000'}@upi`,
        },
        currentLocation: {
          lat: 28.6139 + (Math.random() - 0.5) * 0.05,
          lng: 77.209 + (Math.random() - 0.5) * 0.05,
          address: 'Central Delivery Depot, New Delhi',
          lastUpdated: new Date().toISOString(),
        },
        joinedDate: new Date().toISOString().split('T')[0],
      };

      try {
        await fetch('/api/agents/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAgentObj),
        });
      } catch (e) {
        console.warn('API register notice:', e);
      }

      try {
        await saveAgentToFirestore(newAgentObj);
      } catch (e) {
        console.warn('Firestore agent save notice:', e);
      }

      setIsLoading(false);
      setVerificationEmailSent(email.trim().toLowerCase());
    } catch (err: any) {
      setIsLoading(false);
      if (err?.code === 'auth/email-already-in-use' || err?.message?.includes('already in use')) {
        setErrorMsg('Delivery Agent account already exists with this email. Please sign in.');
      } else {
        setErrorMsg(err?.message || 'Failed to register delivery agent.');
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
      const profile = await signInWithEmailFirebase(email, password, 'driver');

      localStorage.removeItem('instacart_customer_user');
      localStorage.setItem('instacart_user_role', 'driver');

      // Map email to agent ID if matching predefined agent
      const cleanEmail = email.trim().toLowerCase();
      let matchedAgentId = profile.id;
      if (cleanEmail === 'aarav.sharma@instacart.com') {
        matchedAgentId = 'agent_1';
      } else if (cleanEmail === 'priya.v@instacart.com') {
        matchedAgentId = 'agent_2';
      } else if (cleanEmail === 'vikram.s@instacart.com') {
        matchedAgentId = 'agent_3';
      } else if (cleanEmail === 'rohan.mehta@instacart.com') {
        matchedAgentId = 'agent_4';
      }

      localStorage.setItem('instacart_active_agent_id', matchedAgentId);
      localStorage.setItem('instacart_customer_user', JSON.stringify({ ...profile, id: matchedAgentId }));

      setIsLoading(false);
      setSuccessMsg(`Authenticated as Delivery Partner ${profile.name}`);

      setTimeout(() => {
        onSuccessLogin({ ...profile, id: matchedAgentId });
        navigate('/delivery/dashboard');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative selection:bg-teal-500 selection:text-white">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-teal-600/10 blur-3xl pointer-events-none" />

      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in fade-in zoom-in duration-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 p-6 text-white relative">
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
              className="w-10 h-10 rounded-xl object-cover shadow-md border border-teal-400/40"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">InstaCart</span>
                <span className="bg-teal-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">AI</span>
              </div>
              <p className="text-[10px] font-semibold text-teal-300 tracking-tight">
                AI-Powered Grocery Delivery Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2 pr-8">
            <span className="bg-teal-500/30 text-teal-300 border border-teal-400/40 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 text-teal-300 animate-pulse" />
              RIDER NETWORK PORTAL
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>🚚</span>
            <span>Delivery Partner Auth</span>
          </h3>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Accept active orders, navigate express routes, and view earnings.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Email Verification Sent Screen & Wait for Admin Approval Notice */}
          {verificationEmailSent ? (
            <div className="py-5 px-3 text-center space-y-4 animate-in fade-in zoom-in duration-200 bg-amber-50/70 border border-amber-200 rounded-2xl p-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="bg-amber-200 text-amber-900 border border-amber-300 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-700" /> Pending Admin Review
                </span>

                <h4 className="text-lg font-black text-slate-900">Verification Link Sent</h4>

                <p className="text-xs font-medium text-slate-700 max-w-sm mx-auto leading-relaxed">
                  We sent a verification email to <strong className="text-slate-900">{verificationEmailSent}</strong>. Please check your email inbox and spam folder.
                </p>

                <div className="p-3 bg-white/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 font-bold text-left space-y-1">
                  <p className="flex items-center gap-1.5 text-amber-800">
                    <Compass className="w-3.5 h-3.5 text-amber-600" /> Wait for Store Administrator Approval
                  </p>
                  <p className="font-medium text-slate-600">
                    After email verification, store administration will review your rider credentials. Once approved in the Admin Dashboard, you can log in and accept orders.
                  </p>
                </div>
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
                    setSuccessMsg('Email verified successfully! Profile is now awaiting Admin approval.');
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
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  Proceed to Rider Login
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
                <div className="bg-teal-50 border border-teal-200 text-teal-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
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
                        ? 'border-teal-600 text-teal-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Delivery Agent Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className={`pb-2.5 px-4 text-xs font-black transition-all border-b-2 ${
                      mode === 'register'
                        ? 'border-teal-600 text-teal-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Register as Rider
                  </button>
                </div>
              )}

              {/* Forgot Password View */}
              {mode === 'forgot' ? (
                <form onSubmit={handleForgotPassword} className="space-y-3 pt-1">
                  <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-xs text-sky-900 font-medium">
                    Enter your registered delivery partner email. We will send you a password reset link.
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address *</label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rider@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-teal-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-98 transition-all"
                  >
                    {isLoading ? 'Sending Reset Link...' : 'Send Password Reset Email'}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 underline"
                    >
                      ← Back to Rider Login
                    </button>
                  </div>
                </form>
              ) : (
                /* Login & Register Forms */
                <form
                  onSubmit={mode === 'login' ? handleLogin : handleRegister}
                  className="space-y-3 pt-1"
                >
                  {/* Delivery Registration Policy Badge */}
                  {mode === 'register' && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-0.5">
                      <p className="font-extrabold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Rider Approval Required
                      </p>
                      <p className="text-[11px] text-amber-800">
                        After email verification, your profile will await approval by a Store Administrator before accepting orders.
                      </p>
                    </div>
                  )}

                  {/* Name for Rider Registration */}
                  {mode === 'register' && (
                    <>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
                        <div className="relative flex items-center">
                          <User className="w-4 h-4 text-slate-400 absolute left-3" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone Number *</label>
                        <div className="relative flex items-center">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 00000"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
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
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </>
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
                        placeholder="rider@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-teal-500 font-mono"
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
                          className="text-[10px] font-bold text-teal-700 hover:text-teal-800 underline"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-teal-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 active:scale-98 transition-all mt-2"
                  >
                    {isLoading ? (
                      <span>Authenticating...</span>
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" /> Delivery Agent Sign In →
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Register as Delivery Partner →
                      </>
                    )}
                  </button>

                  {mode === 'login' && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Truck className="w-3 h-3 text-teal-600" />
                          Select from 4 Active Delivery Riders:
                        </span>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          Pass: password123
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEmail('aarav.sharma@instacart.com');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="text-left p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-all group"
                        >
                          <p className="text-[11px] font-black text-slate-900 group-hover:text-teal-900">🛵 Aarav Sharma</p>
                          <p className="text-[9px] text-slate-500 font-mono truncate">aarav.sharma@instacart.com</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEmail('priya.v@instacart.com');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="text-left p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-all group"
                        >
                          <p className="text-[11px] font-black text-slate-900 group-hover:text-teal-900">🛵 Priya Verma</p>
                          <p className="text-[9px] text-slate-500 font-mono truncate">priya.v@instacart.com</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEmail('vikram.s@instacart.com');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="text-left p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-all group"
                        >
                          <p className="text-[11px] font-black text-slate-900 group-hover:text-teal-900">🛵 Vikram Singh</p>
                          <p className="text-[9px] text-slate-500 font-mono truncate">vikram.s@instacart.com</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEmail('rohan.mehta@instacart.com');
                            setPassword('password123');
                            setErrorMsg('');
                          }}
                          className="text-left p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-all group"
                        >
                          <p className="text-[11px] font-black text-slate-900 group-hover:text-teal-900">🛵 Rohan Mehta</p>
                          <p className="text-[9px] text-slate-500 font-mono truncate">rohan.mehta@instacart.com</p>
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('instacart_user_role', 'guest_driver');
                      localStorage.setItem('instacart_active_agent_id', 'agent_1');
                      navigate('/delivery/dashboard');
                    }}
                    className="w-full bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-900 border border-slate-200 hover:border-teal-300 font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                    <span>Explore Agent Portal in Guest Mode</span>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
