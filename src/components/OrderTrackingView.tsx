import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import {
  Truck, CheckCircle2, PackageCheck, MapPin, Phone, ShieldCheck, Clock, Sparkles,
  AlertCircle, ArrowLeft, MessageSquare, Star, HeartHandshake, Send, X, DollarSign, Check, Ban, RotateCcw, ShieldAlert
} from 'lucide-react';

interface OrderTrackingViewProps {
  order: Order;
  onBackToShop: () => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onReorderItems?: (order: Order) => void;
}

const STEPS: Array<{ key: OrderStatus; label: string; desc: string }> = [
  { key: 'placed', label: 'Order Confirmed', desc: 'Sent to dark store' },
  { key: 'packed', label: 'Packed & Verified', desc: 'Cold chain quality check complete' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider on the way to your door' },
  { key: 'delivered', label: 'Delivered', desc: 'Handed over securely with OTP' },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  order,
  onBackToShop,
  onUpdateOrderStatus,
  onReorderItems,
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [agentProgress, setAgentProgress] = useState(65);

  // Chat Modal State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; timestamp: string }>>([]);

  // Feedback & Tipping State
  const [rating, setRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(20);
  const [commentText, setCommentText] = useState('');

  // Poll order status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setCurrentOrder(data.data);
            if (data.data.rating) {
              setFeedbackSubmitted(true);
            }
          }
        }
      } catch (err) {
        console.warn('Order tracking poll notice:', err);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [order.id]);

  // Animate map canvas delivery icon
  useEffect(() => {
    if (currentOrder.orderStatus === 'out_for_delivery') {
      const timer = setInterval(() => {
        setAgentProgress((prev) => (prev >= 90 ? 25 : prev + 1.8));
      }, 500);
      return () => clearInterval(timer);
    } else if (currentOrder.orderStatus === 'delivered') {
      setAgentProgress(100);
    }
  }, [currentOrder.orderStatus]);

  const fetchChatMessages = async () => {
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const textToSend = chatInput.trim();
    setChatInput('');

    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'customer', text: textToSend }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        // Refetch chat after 2 seconds for auto-reply
        setTimeout(fetchChatMessages, 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
    fetchChatMessages();
  };

  const handleSubmitFeedback = async () => {
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}/rate-tip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars: rating,
          rating,
          tipAmount,
          tip: tipAmount,
          comment: commentText,
          comments: commentText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackSubmitted(true);
        if (data.data) {
          setCurrentOrder(data.data);
        }
      } else {
        alert(data.message || 'Failed to submit rating & tip');
      }
    } catch (e) {
      console.error('Submit feedback error:', e);
      alert('Error submitting feedback');
    }
  };

  const isCancelled = currentOrder.orderStatus === 'cancelled';
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentOrder.orderStatus);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToShop}
          className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>

        <div className="flex items-center gap-2">
          {isCancelled && (
            <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> CANCELLED
            </span>
          )}
          <span className="text-xs font-extrabold text-slate-500">Order ID:</span>
          <span className="bg-slate-900 text-white text-xs font-mono font-black px-2.5 py-1 rounded-lg">
            {currentOrder.id}
          </span>
        </div>
      </div>

      {/* Hero Status Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl border relative overflow-hidden transition-all ${
        isCancelled
          ? 'bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 border-rose-800/60'
          : 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-emerald-800/40'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            {isCancelled ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold">
                <Ban className="w-3.5 h-3.5 text-rose-400" />
                <span>Trip Terminated</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Est. Delivery Time: {currentOrder.estimatedDeliveryTime}</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isCancelled
                ? '❌ Order Cancelled by Delivery Partner'
                : currentOrder.orderStatus === 'delivered'
                ? '🎉 Order Delivered Successfully!'
                : currentOrder.orderStatus === 'out_for_delivery'
                ? '🚚 Agent is on the Way with Your Groceries!'
                : currentOrder.orderStatus === 'packed'
                ? '📦 Packed & Freshness Checked!'
                : '⚡ Order Confirmed & Being Prepared'}
            </h2>

            {isCancelled ? (
              <p className="text-xs sm:text-sm text-rose-200 font-semibold bg-rose-950/40 border border-rose-800/50 px-3 py-2 rounded-xl">
                Reason: <strong>{currentOrder.cancellationReason || 'Delivery partner was unable to fulfill this trip'}</strong>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Delivering to <span className="text-white font-bold">{currentOrder.deliveryAddress}</span>
              </p>
            )}
          </div>

          {/* Right Badge Box */}
          {isCancelled ? (
            <div className="bg-rose-950/60 backdrop-blur-md rounded-2xl p-4 border border-rose-500/30 text-center shrink-0 min-w-[180px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 block mb-1">
                Refund Status
              </span>
              <div className="text-2xl font-mono font-black text-emerald-400">100% Refund</div>
              <span className="text-[10px] text-slate-300 font-medium mt-1 block">
                ₹{currentOrder.totalAmount} credited to {currentOrder.paymentMethod.toUpperCase()}
              </span>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                Delivery Handover OTP
              </span>
              <div className="text-3xl font-mono font-black tracking-widest text-white">{currentOrder.otp}</div>
              <span className="text-[10px] text-slate-300 font-medium mt-1 block">
                Share code with agent on arrival
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Re-Order Call-to-action Banner if Cancelled */}
      {isCancelled && (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 text-white border border-rose-900/50 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base font-extrabold flex items-center gap-2 text-white">
                <RotateCcw className="w-5 h-5 text-rose-400" /> Would you like to Re-Order these items?
              </h4>
              <p className="text-xs text-slate-300">
                You can easily add all {currentOrder.items.length} grocery items back to your cart and attempt a new express checkout.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              {onReorderItems && (
                <button
                  onClick={() => onReorderItems(currentOrder)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Add Items & Re-Order
                </button>
              )}
              <button
                onClick={onBackToShop}
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition-all"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Stepper Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-6">
          {isCancelled ? 'Order Cancellation & Refund Timeline' : 'Live Order Status Stepper'}
        </h3>

        {isCancelled ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            <div className="flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Order Placed</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Order was received</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-300">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-900">Trip Cancelled</h4>
                <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                  {currentOrder.cancellationReason || 'Cancelled by agent'}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Refunded</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">₹{currentOrder.totalAmount} credited back</p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Re-Order Ready</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Instant basket restock</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-2xl transition-all ${
                    isCurrent ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>

                  <div>
                    <h4 className={`text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Delivery Route Map Simulation Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" /> Live GPS Delivery Route Canvas
          </h3>
          {isCancelled ? (
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600" /> GPS Inactive (Cancelled)
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Tracking
            </span>
          )}
        </div>

        {/* Custom Stylized Map Canvas */}
        <div className="relative h-64 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#10b981 1px, #0f172a 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <svg className="absolute inset-0 w-full h-full stroke-emerald-500 stroke-[3] fill-none stroke-dasharray-[6]">
            <path d="M 60 180 Q 200 60 400 140 T 750 80" />
          </svg>

          {/* Dark Store Hub Marker */}
          <div className="absolute left-[8%] bottom-[25%] flex flex-col items-center">
            <div className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md mb-1">
              InstaCart Hub
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-500/30">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Customer Home Marker */}
          <div className="absolute right-[8%] top-[25%] flex flex-col items-center">
            <div className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md mb-1">
              Your Home
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg ring-4 ring-amber-400/30">
              <MapPin className="w-4 h-4" />
            </div>
          </div>

          {/* Cancelled Map Overlay */}
          {isCancelled ? (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 z-20">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mb-3 animate-pulse">
                <Ban className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-white">Fulfillment Trip Cancelled</h4>
              <p className="text-xs text-rose-200 max-w-sm mt-1 font-medium">
                {currentOrder.cancellationReason || 'The delivery partner had to cancel this order.'}
              </p>
              <span className="text-[11px] text-emerald-400 font-bold mt-2.5 bg-emerald-950/80 border border-emerald-800 px-3.5 py-1 rounded-full">
                ✓ 100% Refund Processed: ₹{currentOrder.totalAmount}
              </span>
            </div>
          ) : (
            /* Moving Agent Vehicle Icon */
            <div
              className="absolute transition-all duration-500 ease-out flex flex-col items-center"
              style={{
                left: `${agentProgress}%`,
                top: `${Math.sin((agentProgress / 100) * Math.PI) * 40 + 40}%`,
              }}
            >
              <div className="bg-white text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg border border-slate-200 mb-1 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-600" /> {currentOrder.deliveryAgentName || 'Aarav Sharma'}
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl ring-4 ring-emerald-400/50 animate-bounce">
                <Truck className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Agent & Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Agent Info Card */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Your Assigned Delivery Partner
          </h3>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-xl flex items-center justify-center shadow-md">
              {currentOrder.deliveryAgentName ? currentOrder.deliveryAgentName[0] : 'A'}
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                {currentOrder.deliveryAgentName || 'Aarav Sharma'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {currentOrder.deliveryAgentVehicle || 'Electric Scooter'}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-1">
                ★ 4.96 Rating (428 deliveries)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${currentOrder.deliveryAgentPhone}`}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call Rider
            </a>

            <button
              onClick={handleOpenChat}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat Live
            </button>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Item Summary ({currentOrder.items.length} items)
            </h3>
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
              {currentOrder.paymentMethod === 'cod'
                ? 'COD Pending'
                : `Paid via ${
                    currentOrder.paymentMethod === 'gpay'
                      ? 'Google Pay'
                      : currentOrder.paymentMethod === 'phonepe'
                      ? 'PhonePe'
                      : 'Card'
                  }`}
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {(currentOrder.items || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-500">{item.unit}</span>
                  </div>
                </div>
                <span className="font-extrabold text-slate-800">
                  {item.quantity} x ₹{item.price}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm font-black text-slate-900">
            <span>Total Amount</span>
            <span className="text-lg text-emerald-800">₹{currentOrder.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* RATING & TIPPING SECTION (When delivered or in progress) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-emerald-600" /> Rate & Tip Your Delivery Agent
        </h3>

        {feedbackSubmitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold">Thank you for rating {currentOrder.deliveryAgentName || 'your rider'}!</h4>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {rating}★ Rating & ₹{currentOrder.tip || tipAmount} Tip added directly to their partner wallet.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Star Rating selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Rate Delivery:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tip Presets */}
            <div>
              <span className="font-bold text-slate-700 block mb-2">Add Tip for Rider:</span>
              <div className="flex flex-wrap gap-2">
                {[10, 20, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTipAmount(amount)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                      tipAmount === amount
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    + ₹{amount}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTipAmount(0)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                    tipAmount === 0 ? 'bg-slate-900 text-white' : 'text-slate-500 border-slate-200'
                  }`}
                >
                  No Tip
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmitFeedback}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md"
            >
              Submit Rating & Tip (₹{tipAmount})
            </button>
          </div>
        )}
      </div>

      {/* CUSTOMER IN-APP CHAT MODAL SHEET */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full h-[500px] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase">Live Chat with Delivery Partner</h3>
                <p className="text-[10px] text-emerald-300 font-bold">
                  {currentOrder.deliveryAgentName || 'Aarav Sharma'} ({currentOrder.id})
                </p>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              {(!messages || messages.length === 0) ? (
                <div className="text-center py-10 text-slate-400 font-medium">
                  Say hi to your delivery partner!
                </div>
              ) : (
                (messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs font-semibold shadow-xs ${
                        msg.sender === 'customer'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      <span className="text-[9px] opacity-75 font-bold block uppercase mb-0.5">
                        {msg.sender === 'customer' ? 'You' : currentOrder.deliveryAgentName || 'Rider'}
                      </span>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none focus:border-emerald-600"
              />
              <button
                onClick={handleSendMessage}
                className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
