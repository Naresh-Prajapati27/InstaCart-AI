import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, DeliveryAgent, OrderStatus, WithdrawalRequest, DeliveryNotification } from '../types';
import { getOrdersFromFirestore, getAgentsFromFirestore } from '../firebase';
import { maskCustomerName, maskCustomerPhone, maskCustomerAddress } from '../utils/maskCustomerData';
import {
  Truck, CheckCircle2, Phone, MapPin, Navigation, DollarSign, ShieldCheck,
  Clock, Key, AlertCircle, Wallet, FileText, ArrowRight, X, RefreshCw, UserCheck,
  Send, MessageSquare, Award, ArrowUpRight, Power, User, Lock, ChevronRight, Ban, LogOut, Compass
} from 'lucide-react';

interface DeliveryAgentPortalProps {
  onOrderUpdated?: () => void;
}

export const DeliveryAgentPortal: React.FC<DeliveryAgentPortalProps> = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(() => {
    return localStorage.getItem('instacart_active_agent_id') || 'agent_1';
  });
  const activeAgentIdRef = useRef<string | null>(activeAgentId);

  // Check if viewing in guest / demo mode (Delivery Driver always sees unmasked customer details)
  const isGuestDriver = false;

  const activeAgent = agents.find((a) => a.id === activeAgentId) || (activeAgentId === null ? null : agents[0]) || null;

  const handleSelectAgent = (agentId: string) => {
    setActiveAgentId(agentId);
    activeAgentIdRef.current = agentId;
    localStorage.setItem('instacart_active_agent_id', agentId);
  };

  const handleAgentLogout = () => {
    setActiveAgentId(null);
    activeAgentIdRef.current = null;
    localStorage.removeItem('instacart_active_agent_id');
    localStorage.removeItem('instacart_user_role');
    navigate('/delivery/auth');
  };

  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab State: 'dashboard' | 'wallet' | 'history' | 'profile' | 'auth'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'history' | 'profile' | 'auth'>('dashboard');

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regVehicle, setRegVehicle] = useState('Honda Activa EV');
  const [regVehicleType, setRegVehicleType] = useState<'Bike' | 'Scooter' | 'EV Scooter' | 'Bicycle'>('EV Scooter');
  const [regCity, setRegCity] = useState('New Delhi');
  const [regLicense, setRegLicense] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regUpi, setRegUpi] = useState('');

  // Forgot Password State
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Order Handover OTP State
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

  // Reject / Cancel Order State
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Customer unreachable');
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Store location too far');

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'UPI' | 'Bank Transfer'>('UPI');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Chat State
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; text: string; timestamp: string }>>([]);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileVehicle, setProfileVehicle] = useState('');
  const [profileUpi, setProfileUpi] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState('');

  // Live GPS Movement Simulation Toggle
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);

  // AI Delivery Route & Navigation State
  const [aiRouteData, setAiRouteData] = useState<{
    optimizedOrderSequence: string[];
    totalEstimatedDistanceKm: number;
    totalEstimatedDurationMins: number;
    trafficStatus: string;
    turnByTurnDirections: string[];
  } | null>(null);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);

  const handleOptimizeRoute = async () => {
    if (!activeAgent) return;
    setIsOptimizingRoute(true);
    try {
      const res = await fetch('/api/ai/route-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: activeAgent.id,
          orderIds: (assignedOrders || []).map((o) => o.id),
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiRouteData(data.data);
        if ('speechSynthesis' in window && data.data.trafficStatus) {
          const u = new SpeechSynthesisUtterance(`AI Navigation Active: ${data.data.trafficStatus}`);
          window.speechSynthesis.speak(u);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOptimizingRoute(false);
    }
  };

  const fetchAgentData = async () => {
    try {
      const agentsRes = await fetch('/api/agents');
      const isAgentsJson = agentsRes.headers.get('content-type')?.includes('application/json');
      let agentsList: DeliveryAgent[] = [];

      if (agentsRes.ok && isAgentsJson) {
        const agentsData = await agentsRes.json();
        if (agentsData.success && agentsData.data) {
          agentsList = agentsData.data;
        }
      }
      
      if (!agentsList || agentsList.length === 0) {
        agentsList = await getAgentsFromFirestore();
      }

      if (agentsList && agentsList.length > 0) {
        setAgents(agentsList);
        const storedId = localStorage.getItem('instacart_active_agent_id');
        let currentId = activeAgentIdRef.current || storedId;

        // Verify if currentId exists in agentsList
        let matched = agentsList.find((a) => a.id === currentId);

        if (!matched) {
          // Attempt email matching from customer_user storage if present
          const userRaw = localStorage.getItem('instacart_customer_user');
          if (userRaw) {
            try {
              const u = JSON.parse(userRaw);
              if (u.email) {
                matched = agentsList.find((a) => a.email && a.email.toLowerCase() === u.email.toLowerCase());
              }
            } catch (e) {
              // ignore json parse error
            }
          }
        }

        if (!matched) {
          matched = agentsList.find((a) => a.id === 'agent_1') || agentsList[0];
        }

        if (matched && matched.id !== activeAgentIdRef.current) {
          setActiveAgentId(matched.id);
          activeAgentIdRef.current = matched.id;
          localStorage.setItem('instacart_active_agent_id', matched.id);
        }
      }

      const ordersRes = await fetch('/api/orders');
      const isOrdersJson = ordersRes.headers.get('content-type')?.includes('application/json');
      if (ordersRes.ok && isOrdersJson) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.data) {
          setAssignedOrders(ordersData.data);
        }
      } else {
        const fsOrders = await getOrdersFromFirestore();
        if (fsOrders && fsOrders.length > 0) {
          setAssignedOrders(fsOrders);
        }
      }
    } catch {
      // Fallback silently to Firestore
      try {
        const [fsAgents, fsOrders] = await Promise.all([
          getAgentsFromFirestore(),
          getOrdersFromFirestore(),
        ]);
        if (fsAgents && fsAgents.length > 0) setAgents(fsAgents);
        if (fsOrders && fsOrders.length > 0) setAssignedOrders(fsOrders);
      } catch {
        // silent fallback
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 3500);
    return () => clearInterval(interval);
  }, []);

  // Update profile edit state when active agent changes
  useEffect(() => {
    if (activeAgent) {
      setProfileName(activeAgent.name);
      setProfilePhone(activeAgent.phone);
      setProfileVehicle(activeAgent.vehicle);
      setProfileUpi(activeAgent.bankDetails?.upiId || '');
    }
  }, [activeAgent]);

  // GPS Simulation interval
  useEffect(() => {
    if (!isSimulatingGps || !activeAgent) return;
    const gpsInterval = setInterval(async () => {
      const activeOrd = (assignedOrders || []).find(
        (o) => o.deliveryAgentId === activeAgent.id && o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
      );
      const targetAddress = activeOrd ? activeOrd.deliveryAddress : 'Dark Store Central Hub';
      const customerInfo = activeOrd ? ` (For: ${activeOrd.customerName || 'Customer'})` : '';

      const deltaLat = (Math.random() - 0.48) * 0.001;
      const deltaLng = (Math.random() - 0.48) * 0.001;
      const newLat = Number((activeAgent.currentLocation.lat + deltaLat).toFixed(5));
      const newLng = Number((activeAgent.currentLocation.lng + deltaLng).toFixed(5));
      const statusAddress = `En-route to ${targetAddress}${customerInfo}`;

      try {
        await fetch(`/api/agents/${activeAgent.id}/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: newLat,
            lng: newLng,
            address: statusAddress,
          }),
        });

        setAgents((prev) =>
          prev.map((a) =>
            a.id === activeAgent.id
              ? {
                  ...a,
                  currentLocation: {
                    ...a.currentLocation,
                    lat: newLat,
                    lng: newLng,
                    address: statusAddress,
                    lastUpdated: new Date().toISOString(),
                  },
                }
              : a
          )
        );
      } catch (e) {
        console.error(e);
      }
    }, 2500);

    return () => clearInterval(gpsInterval);
  }, [isSimulatingGps, activeAgent, assignedOrders]);

  const handleToggleOnlineStatus = async () => {
    if (!activeAgent) return;
    if (!activeAgent.documentsVerified && activeAgent.status !== 'online') {
      alert('Your account is currently Awaiting Approval by a Store Administrator. Once approved in the Admin Console, you can go online to accept delivery orders.');
      return;
    }
    const newStatus = activeAgent.status === 'online' ? 'offline' : 'online';

    try {
      const res = await fetch(`/api/agents/${activeAgent.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        fetchAgentData();
      } else {
        alert(data.message || 'Status update failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, otpCode?: string) => {
    setOtpError('');
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, otp: otpCode }),
      });

      const data = await res.json();
      if (data.success) {
        setVerifyingOrderId(null);
        setOtpInput('');
        fetchAgentData();
      } else {
        setOtpError(data.message || 'OTP verification failed');
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Failed to update order status');
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!activeAgent) return;
    try {
      await fetch(`/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: activeAgent.id }),
      });
      fetchAgentData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectingOrder || !activeAgent) return;
    try {
      await fetch(`/api/orders/${rejectingOrder.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: activeAgent.id, reason: rejectionReason }),
      });
      setRejectingOrder(null);
      fetchAgentData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder || !activeAgent) return;
    try {
      await fetch(`/api/orders/${cancellingOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancellationReason, cancelledBy: activeAgent.name }),
      });
      setCancellingOrder(null);
      fetchAgentData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const res = await fetch('/api/agents/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: loginPhone, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        handleSelectAgent(data.data.id);
        setActiveTab('dashboard');
        setAuthSuccess('Welcome back, ' + data.data.name + '!');
      } else {
        setAuthError(data.message || 'Invalid login details');
      }
    } catch (err) {
      setAuthError('Connection error during login');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail,
          vehicle: regVehicle,
          vehicleType: regVehicleType,
          city: regCity,
          drivingLicense: regLicense,
          aadhaarNumber: regAadhaar,
          upiId: regUpi,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        handleSelectAgent(data.data.id);
        setActiveTab('dashboard');
        setAuthSuccess('Registration completed! Welcome bonus ₹150 added.');
      } else {
        setAuthError(data.message || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Error submitting registration');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (forgotStep === 1) {
      try {
        const res = await fetch('/api/agents/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: forgotPhone }),
        });
        const data = await res.json();
        if (data.success) {
          setForgotStep(2);
          setAuthSuccess(data.message);
        } else {
          setAuthError(data.message || 'Failed to send OTP');
        }
      } catch (e) {
        setAuthError('Failed to process forgot password');
      }
    } else {
      try {
        const res = await fetch('/api/agents/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: forgotPhone, otp: forgotOtp, newPassword }),
        });
        const data = await res.json();
        if (data.success) {
          setAuthSuccess('Password updated! You can now login.');
          setAuthMode('login');
          setForgotStep(1);
        } else {
          setAuthError(data.message || 'OTP verification failed');
        }
      } catch (e) {
        setAuthError('Error verifying OTP');
      }
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawMessage('');

    if (!activeAgent) return;

    try {
      const res = await fetch(`/api/agents/${activeAgent.id}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: withdrawAmount,
          method: withdrawMethod,
          targetAccount: withdrawAccount || activeAgent.bankDetails?.upiId || `${activeAgent.phone}@upi`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWithdrawMessage(data.message);
        setWithdrawAmount('');
        fetchAgentData();
      } else {
        setWithdrawError(data.message || 'Withdrawal failed');
      }
    } catch (e) {
      setWithdrawError('Error submitting withdrawal request');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAgent) return;
    setProfileSaveSuccess('');

    try {
      const res = await fetch(`/api/agents/${activeAgent.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          vehicle: profileVehicle,
          bankDetails: { upiId: profileUpi },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProfileSaveSuccess('Profile & payout details updated successfully!');
        fetchAgentData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openChatModal = async (ord: Order) => {
    setChatOrder(ord);
    try {
      const res = await fetch(`/api/orders/${ord.id}/messages`);
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatOrder || !chatMessageInput.trim()) return;

    const textToSend = chatMessageInput.trim();
    setChatMessageInput('');

    try {
      const res = await fetch(`/api/orders/${chatOrder.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'agent', text: textToSend }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, data.data]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 animate-spin flex items-center justify-center mx-auto mb-3">
          <Truck className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-700">Loading Delivery Partner Portal...</p>
      </div>
    );
  }

  if (!activeAgent) {
    return (
      <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto my-12 border border-slate-800 shadow-2xl animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-md">
          <LogOut className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight">Signed Out of Delivery Partner Portal</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Sign in with your registered rider account to accept orders and manage deliveries.
          </p>
        </div>
        <button
          onClick={() => navigate('/delivery/auth')}
          className="w-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20"
        >
          Go to Rider Sign In Page
        </button>
      </div>
    );
  }

  const myOrders = assignedOrders.filter(
    (o) => o.deliveryAgentId === activeAgent.id || (o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled')
  );

  const activeDeliveries = myOrders.filter((o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');
  const historyDeliveries = myOrders.filter((o) => o.orderStatus === 'delivered' || o.orderStatus === 'cancelled');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Pending Store Administrator Approval Banner */}
      {!activeAgent.documentsVerified && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-2 border-amber-500/40 text-amber-950 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-md flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  AWAITING STORE ADMIN APPROVAL
                </span>
                <h4 className="text-sm font-black text-amber-950 tracking-tight">
                  Your Delivery Profile is Under Review
                </h4>
              </div>
              <p className="text-xs text-amber-900 font-medium mt-1">
                Email verification is complete. After email verification, your profile will await approval by a Store Administrator before accepting orders.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & Partner Switcher Header */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 rounded-3xl p-6 text-white shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activeAgent.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}
                alt={activeAgent.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400/50 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  activeAgent.status === 'online' ? 'bg-emerald-400' : 'bg-rose-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold tracking-tight">{activeAgent.name}</h2>
                <span className="text-[11px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                  ★ {activeAgent.rating} ({activeAgent.ratingsCount || 82})
                </span>
                {activeAgent.documentsVerified ? (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED RIDER
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md">
                    DOCS PENDING
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-200/90 font-medium mt-0.5">
                {activeAgent.vehicle} • {activeAgent.phone} • {activeAgent.city || 'Delhi NCR'}
              </p>
            </div>
          </div>

          {/* Quick Controls & Agent Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Demo Agent Selector Switcher */}
            <div className="bg-slate-800/80 p-1.5 rounded-2xl border border-teal-800/60 flex items-center gap-1">
              <span className="text-[10px] text-slate-400 font-bold px-2 uppercase">Switch Rider:</span>
              <select
                value={activeAgent.id}
                onChange={(e) => handleSelectAgent(e.target.value)}
                className="bg-slate-900 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none border border-teal-700/50"
              >
                {(agents || []).map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} ({ag.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Online/Offline Toggle */}
            <button
              onClick={handleToggleOnlineStatus}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 ${
                activeAgent.status === 'online'
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {activeAgent.status === 'online' ? 'Go Offline' : 'Go Online'}
            </button>

            {/* Delivery Agent Sign Out Button */}
            <button
              onClick={handleAgentLogout}
              className="bg-rose-900/80 hover:bg-rose-800 border border-rose-700/60 text-white px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 active:scale-95 shrink-0"
              title="Sign Out of Delivery Agent Portal"
            >
              <LogOut className="w-4 h-4 text-rose-300" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-teal-800/60 mt-5 relative z-10">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs">
            <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block">Completed Trips</span>
            <span className="text-lg font-black text-white">{activeAgent.completedDeliveries} Orders</span>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs">
            <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block">Total Earnings</span>
            <span className="text-lg font-black text-amber-300">₹{activeAgent.totalEarnings}</span>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs">
            <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block">Wallet Balance</span>
            <span className="text-lg font-black text-emerald-300">₹{activeAgent.walletBalance}</span>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs">
            <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block">Active Queue</span>
            <span className="text-lg font-black text-teal-200">{activeDeliveries.length} Pending</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" /> Active Delivery Queue ({activeDeliveries.length})
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'wallet'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4" /> Wallet & Withdrawals (₹{activeAgent.walletBalance})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" /> Delivery History & Reports
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" /> Profile & Documents
        </button>

        <button
          onClick={() => setActiveTab('auth')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ml-auto ${
            activeTab === 'auth'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Partner Account Auth / Switch
        </button>
      </div>

      {/* ================= TAB 1: ACTIVE DASHBOARD QUEUE ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Live GPS Simulator Bar */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-xs">
                <Navigation className={`w-5 h-5 ${isSimulatingGps ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  Live GPS Tracker Simulator {isSimulatingGps ? <span className="text-emerald-700 animate-pulse font-extrabold">● LIVE STREAMING</span> : <span className="text-slate-500">○ PAUSED</span>}
                </h4>
                <p className="text-[11px] font-extrabold text-amber-900 mt-0.5">
                  {activeDeliveries.length > 0 ? (
                    <span>
                      Navigation Target: <span className="underline text-amber-950 font-black">{activeDeliveries[0].deliveryAddress}</span> (Customer: {activeDeliveries[0].customerName})
                    </span>
                  ) : (
                    <span>Navigation Target: Standby at Dark Store Fulfillment Center</span>
                  )}
                </p>
                <p className="text-[10px] text-amber-800 font-mono font-semibold">
                  Rider GPS Coords: {activeAgent.currentLocation.lat.toFixed(4)}, {activeAgent.currentLocation.lng.toFixed(4)} • Location: {activeAgent.currentLocation.address}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (!navigator.geolocation) {
                    alert('Geolocation is not supported by your browser.');
                    return;
                  }
                  navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                      const lat = Number(pos.coords.latitude.toFixed(5));
                      const lng = Number(pos.coords.longitude.toFixed(5));
                      const address = `Accurate GPS Device Fix (${lat}, ${lng})`;
                      try {
                        await fetch(`/api/agents/${activeAgent.id}/location`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ lat, lng, address }),
                        });
                        const updatedAgent = {
                          ...activeAgent,
                          currentLocation: { lat, lng, address, lastUpdated: new Date().toISOString() },
                        };
                        try {
                          const { saveAgentToFirestore } = await import('../firebase');
                          await saveAgentToFirestore(updatedAgent);
                        } catch (e) {
                          console.warn('Firestore location save notice:', e);
                        }
                        setAgents((prev) => prev.map((a) => (a.id === activeAgent.id ? updatedAgent : a)));
                        alert(`Accurate Device GPS location set successfully: ${lat}, ${lng}`);
                      } catch (err) {
                        console.error(err);
                      }
                    },
                    (err) => {
                      alert(`GPS Error: ${err.message}. Please allow browser location permissions.`);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Get exact GPS coordinates from browser device location"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-200" />
                Sync Real Device GPS
              </button>

              <button
                onClick={() => setIsSimulatingGps(!isSimulatingGps)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  isSimulatingGps
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm'
                    : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm'
                }`}
              >
                {isSimulatingGps ? 'Stop GPS Simulation' : 'Start GPS Simulator'}
              </button>
            </div>
          </div>

          {/* AI Delivery Co-Pilot Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-900 rounded-3xl p-5 text-white shadow-lg border border-purple-800/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold shadow-md">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold">AI Route & Traffic Co-Pilot</h3>
                    <span className="bg-purple-500/30 text-purple-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-400/40">
                      Gemini Traffic Aware
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/90 font-medium">
                    Optimizes multi-stop dispatch order, predicts live traffic slowdowns & calculates accurate ETA
                  </p>
                </div>
              </div>

              <button
                onClick={handleOptimizeRoute}
                disabled={isOptimizingRoute}
                className="bg-purple-500 hover:bg-purple-600 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shrink-0 active:scale-95 transition-transform"
              >
                {isOptimizingRoute ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Calculating AI Route...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" /> Optimize Route & ETA
                  </>
                )}
              </button>
            </div>

            {aiRouteData && (
              <div className="mt-4 pt-4 border-t border-purple-800/60 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-300">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-200 uppercase block">Traffic & Road Conditions</span>
                  <span className="text-xs font-extrabold text-emerald-300 block mt-0.5">{aiRouteData.trafficStatus}</span>
                  <span className="text-[11px] text-purple-100 font-semibold block">
                    Dist: {aiRouteData.totalEstimatedDistanceKm} km • Est: {aiRouteData.totalEstimatedDurationMins} mins
                  </span>
                </div>

                <div className="bg-white/10 p-3 rounded-2xl md:col-span-2">
                  <span className="text-[10px] font-bold text-purple-200 uppercase block">Turn-by-Turn Navigation Voice Plan</span>
                  <ul className="text-xs font-semibold text-purple-100 space-y-1 mt-1">
                    {aiRouteData.turnByTurnDirections?.slice(0, 3).map((step, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Active Orders List */}
          {activeDeliveries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-900">All assigned deliveries completed!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Keep your duty status ON to automatically receive fresh customer grocery dispatches in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {(activeDeliveries || []).map((ord) => {
                const baseTripPay = 45;
                const tipAmount = ord.tip || 0;
                const totalOrderEarning = baseTripPay + tipAmount;

                return (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-4 relative overflow-hidden transition-all"
                >
                  {/* Top Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-slate-900">{ord.id}</span>
                        <span
                          className={`font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                            ord.orderStatus === 'placed'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : ord.orderStatus === 'packed'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {ord.orderStatus.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          ETA: {ord.estimatedDeliveryTime}
                        </span>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                          <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                          Rider Pay: ₹{totalOrderEarning}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 mt-1 block">
                        Customer: <span className="text-slate-900 font-extrabold">{ord.customerName}</span> ({ord.customerPhone})
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment Status</span>
                      <span className="text-base font-black text-slate-900">
                        {ord.paymentMethod === 'cod' ? (
                          <span className="text-amber-700">💵 Collect ₹{ord.totalAmount} CASH</span>
                        ) : (
                          <span className="text-emerald-700">
                            💳 PAID ONLINE ₹{ord.totalAmount} ({ord.paymentMethod.toUpperCase()})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Order Earning Breakdown Banner */}
                  <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 shadow-xs">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Order Earning for Delivery Agent</span>
                        <span className="text-sm font-black text-emerald-950">
                          ₹{totalOrderEarning} <span className="text-xs font-semibold text-emerald-700">(₹{baseTripPay} Trip Pay + ₹{tipAmount} Customer Tip)</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-200/70 px-2.5 py-1 rounded-lg border border-emerald-300/60">
                      Credited upon Delivery
                    </span>
                  </div>

                  {/* Customer Address & Order Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">
                          Delivery Address ({ord.addressType})
                        </span>
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="text-xs font-bold text-teal-700 flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Customer
                        </a>
                      </div>
                      <p className="font-bold text-slate-900 text-xs flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        {ord.deliveryAddress}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">
                          Store Dispatch Items ({ord.items.length})
                        </span>
                        <button
                          onClick={() => openChatModal(ord)}
                          className="text-xs font-extrabold text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Live Customer Chat
                        </button>
                      </div>
                      <p className="font-semibold text-slate-800 line-clamp-2">
                        {(ord.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Action Controls Stepper */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${encodeURIComponent(ord.deliveryAddress)}`,
                            '_blank'
                          )
                        }
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-teal-600" /> Map Navigation
                      </button>

                      <button
                        onClick={() => openChatModal(ord)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>

                      <button
                        onClick={() => setCancellingOrder(ord)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancel Trip
                      </button>
                    </div>

                    {/* Step Advancement Buttons */}
                    <div>
                      {ord.orderStatus === 'placed' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptOrder(ord.id)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-black px-4 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Accept Order
                          </button>
                          <button
                            onClick={() => setRejectingOrder(ord)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-xl text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {ord.orderStatus === 'packed' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'out_for_delivery')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                        >
                          <Truck className="w-4 h-4" /> Mark Picked Up & Start Delivery
                        </button>
                      )}

                      {ord.orderStatus === 'out_for_delivery' && (
                        <button
                          onClick={() => setVerifyingOrderId(ord.id)}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                        >
                          <Key className="w-4 h-4" /> Enter Handover OTP to Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* OTP Verification Prompt */}
                  {verifyingOrderId === ord.id && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-amber-600" /> Enter Customer Handover OTP
                        </span>
                        <span className="text-[10px] text-amber-800 font-mono font-bold">(Demo OTP: {ord.otp})</span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={4}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="4-digit OTP"
                          className="bg-white border border-amber-300 rounded-xl px-4 py-2 text-sm font-mono font-black text-slate-900 outline-none focus:border-amber-600"
                        />

                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'delivered', otpInput)}
                          className="bg-amber-600 text-white font-black px-5 py-2 rounded-xl text-xs hover:bg-amber-700 shadow-xs"
                        >
                          Verify & Complete
                        </button>

                        <button
                          onClick={() => setVerifyingOrderId(null)}
                          className="text-xs text-slate-500 font-bold px-3 py-2"
                        >
                          Cancel
                        </button>
                      </div>

                      {otpError && <p className="text-xs font-bold text-rose-600">{otpError}</p>}
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: WALLET & EARNINGS ================= */}
      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Wallet Overview Card */}
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-3xl p-6 text-white border border-teal-800 shadow-xl space-y-4">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider block">Available Wallet Balance</span>
              <div className="text-3xl font-black text-amber-300">₹{activeAgent.walletBalance}</div>
              <p className="text-xs text-teal-200/80">
                Earnings are deposited immediately upon completing every delivery trip.
              </p>

              <div className="pt-3 border-t border-teal-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-teal-200">
                  <span>Base Delivery Pay:</span>
                  <span className="font-bold text-white">₹35 / order</span>
                </div>
                <div className="flex justify-between text-teal-200">
                  <span>Tips Earned:</span>
                  <span className="font-bold text-emerald-300">100% credited to you</span>
                </div>
                <div className="flex justify-between text-teal-200">
                  <span>Milestone Incentive Bonus:</span>
                  <span className="font-bold text-amber-300">₹{activeAgent.incentivesEarned || 0}</span>
                </div>
              </div>
            </div>

            {/* Instant Withdrawal Form */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 md:col-span-2">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Instant Payout Withdrawal Request
              </h3>

              {withdrawMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                  {withdrawMessage}
                </div>
              )}

              {withdrawError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  {withdrawError}
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Amount to Withdraw (₹)
                    </label>
                    <input
                      type="number"
                      max={activeAgent.walletBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Max ₹${activeAgent.walletBalance}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Withdrawal Method
                    </label>
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value as 'UPI' | 'Bank Transfer')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-teal-600"
                    >
                      <option value="UPI">Instant UPI (GPay / PhonePe / Paytm)</option>
                      <option value="Bank Transfer">Direct Bank Transfer (NEFT)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Target UPI ID / Account Number
                  </label>
                  <input
                    type="text"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder={activeAgent.bankDetails?.upiId || `${activeAgent.phone}@upi`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > activeAgent.walletBalance}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> Request Instant Payout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: DELIVERY HISTORY & REPORTS ================= */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" /> Completed & Cancelled Deliveries Log
            </h3>

            {historyDeliveries.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No past delivery records found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {(historyDeliveries || []).map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{ord.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            ord.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ord.orderStatus.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                        {ord.customerName} • {ord.deliveryAddress}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-slate-900 block">₹{ord.totalAmount}</span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        Fee + Tip: +₹{35 + (ord.tip || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: PROFILE & DOCUMENTS ================= */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" /> Partner Profile & Verification Documents
          </h3>

          {profileSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
              {profileSaveSuccess}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Vehicle Name & Reg No.</label>
                <input
                  type="text"
                  value={profileVehicle}
                  onChange={(e) => setProfileVehicle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">UPI Payout Address</label>
                <input
                  type="text"
                  value={profileUpi}
                  onChange={(e) => setProfileUpi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Verification Documents Status */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Verification Documents Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 text-[10px] block uppercase">Driving License</span>
                <span className="font-extrabold text-slate-900">{activeAgent.documents?.drivingLicense?.number || 'DL-PENDING'}</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Verified by Admin</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 text-[10px] block uppercase">Aadhaar Card</span>
                <span className="font-extrabold text-slate-900">{activeAgent.documents?.aadhaarNumber?.number || 'AADHAAR-PENDING'}</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Verified by Admin</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-500 text-[10px] block uppercase">Vehicle RC</span>
                <span className="font-extrabold text-slate-900">{activeAgent.documents?.vehicleRC?.number || 'RC-PENDING'}</span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ Verified by Admin</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: AUTHENTICATION / REGISTRATION ================= */}
      {activeTab === 'auth' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 max-w-xl mx-auto shadow-md space-y-6 animate-in fade-in duration-300">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider ${
                authMode === 'login' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-slate-400'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider ${
                authMode === 'register' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-slate-400'
              }`}
            >
              Register Partner
            </button>
            <button
              onClick={() => { setAuthMode('forgot'); setAuthError(''); setAuthSuccess(''); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider ${
                authMode === 'forgot' ? 'border-b-2 border-teal-600 text-teal-700' : 'text-slate-400'
              }`}
            >
              Forgot Password
            </button>
          </div>

          {authSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
              {authSuccess}
            </div>
          )}

          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
              {authError}
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Phone or Email</label>
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210 or aarav.sharma@instacart.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md"
              >
                Login to Partner Portal
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Rohit Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 11223"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Vehicle Name & Reg No.</label>
                  <input
                    type="text"
                    value={regVehicle}
                    onChange={(e) => setRegVehicle(e.target.value)}
                    placeholder="e.g. TVS iQube (DL01-AB-1234)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Vehicle Type</label>
                  <select
                    value={regVehicleType}
                    onChange={(e) => setRegVehicleType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                  >
                    <option value="EV Scooter">EV Scooter</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bike">Motorcycle</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Driving License No.</label>
                  <input
                    type="text"
                    value={regLicense}
                    onChange={(e) => setRegLicense(e.target.value)}
                    placeholder="DL-01-2023-XXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    value={regAadhaar}
                    onChange={(e) => setRegAadhaar(e.target.value)}
                    placeholder="12-digit Aadhaar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Bank UPI ID for Payouts</label>
                <input
                  type="text"
                  value={regUpi}
                  onChange={(e) => setRegUpi(e.target.value)}
                  placeholder="e.g. rohit@okicici"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md"
              >
                Complete Partner Registration (+₹150 Welcome Bonus)
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              {forgotStep === 1 ? (
                <div>
                  <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Registered Phone Number</label>
                  <input
                    type="text"
                    required
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                  />
                  <button
                    type="submit"
                    className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl text-xs"
                  >
                    Send Reset OTP
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Enter 4-Digit OTP (Demo: 1234)</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold font-mono text-slate-900 outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-500 uppercase text-[10px] block mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 outline-none focus:border-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold py-2.5 rounded-xl text-xs"
                  >
                    Reset Password & Login
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* ================= MODAL 1: REJECT ORDER DIALOG ================= */}
      {rejectingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Reject Assigned Order {rejectingOrder.id}?
            </h3>
            <p className="text-xs text-slate-600">Select a reason for rejecting this dispatch order:</p>

            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none"
            >
              <option value="Store location too far">Store location too far</option>
              <option value="Vehicle battery/fuel low">Vehicle battery/fuel low</option>
              <option value="Heavy rain / Weather condition">Heavy rain / Weather condition</option>
              <option value="Ending duty shift">Ending duty shift</option>
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleRejectOrder}
                className="flex-1 bg-rose-600 text-white font-black py-2.5 rounded-xl text-xs hover:bg-rose-700"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2.5 text-xs text-slate-600 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: CANCEL TRIP DIALOG ================= */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-600" /> Cancel Trip for {cancellingOrder.id}?
            </h3>
            <p className="text-xs text-slate-600">Please provide a valid cancellation reason:</p>

            <select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none"
            >
              <option value="Customer unreachable">Customer unreachable via phone</option>
              <option value="Store closed / Out of stock">Store closed / Out of stock</option>
              <option value="Vehicle breakdown">Vehicle breakdown</option>
              <option value="Wrong customer address">Wrong customer address</option>
            </select>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancelOrder}
                className="flex-1 bg-rose-600 text-white font-black py-2.5 rounded-xl text-xs hover:bg-rose-700"
              >
                Confirm Trip Cancellation
              </button>
              <button
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2.5 text-xs text-slate-600 font-bold"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: IN-APP LIVE CHAT ================= */}
      {chatOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full h-[520px] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase">Live Customer Chat</h3>
                <p className="text-[10px] text-teal-300 font-bold">
                  {chatOrder.customerName} ({chatOrder.id})
                </p>
              </div>
              <button
                onClick={() => setChatOrder(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              {(!chatMessages || chatMessages.length === 0) ? (
                <div className="text-center py-10 text-slate-400 font-medium">
                  No messages yet. Send a quick update to the customer!
                </div>
              ) : (
                (chatMessages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs font-semibold shadow-xs ${
                        msg.sender === 'agent'
                          ? 'bg-teal-600 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      <span className="text-[9px] opacity-75 font-bold block uppercase mb-0.5">
                        {msg.sender === 'agent' ? 'You (Rider)' : chatOrder.customerName}
                      </span>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Presets & Input */}
            <div className="p-3 bg-white border-t border-slate-200 space-y-2">
              <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                <button
                  onClick={() => setChatMessageInput('I am outside your building gate.')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold shrink-0"
                >
                  "Outside gate"
                </button>
                <button
                  onClick={() => setChatMessageInput('Please confirm your floor number.')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold shrink-0"
                >
                  "Confirm floor"
                </button>
                <button
                  onClick={() => setChatMessageInput('Arriving in 2 minutes.')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg font-bold shrink-0"
                >
                  "Arriving in 2 mins"
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Type message to customer..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-teal-600"
                />
                <button
                  onClick={handleSendChatMessage}
                  className="bg-teal-600 text-white p-2 rounded-xl hover:bg-teal-700"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
