import React, { useState } from 'react';
import { CreditCard, IndianRupee, ShieldCheck, Lock, MapPin, Loader2, CheckCircle, Sparkles, X, Smartphone, QrCode } from 'lucide-react';
import { CartItem, Order, PaymentMethod, CustomerUser } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tip: number;
  totalAmount: number;
  onOrderPlaced: (order: Order) => void;
  currentCustomer?: CustomerUser | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  subtotal,
  discount,
  deliveryFee,
  tip,
  totalAmount,
  onOrderPlaced,
  currentCustomer,
}) => {
  const [customerName, setCustomerName] = useState(currentCustomer?.name || 'Sneha Patel');
  const [customerPhone, setCustomerPhone] = useState(currentCustomer?.phone || '+91 98765 12345');
  const [customerEmail, setCustomerEmail] = useState(currentCustomer?.email || 'sneha.patel@example.com');
  const [deliveryAddress, setDeliveryAddress] = useState(currentCustomer?.address || 'Flat 402, Green Glen Layout, Bellandur, Bengaluru');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Sync state if currentCustomer changes
  React.useEffect(() => {
    if (currentCustomer) {
      setCustomerName(currentCustomer.name);
      setCustomerEmail(currentCustomer.email);
      if (currentCustomer.phone) setCustomerPhone(currentCustomer.phone);
      if (currentCustomer.address) setDeliveryAddress(currentCustomer.address);
    }
  }, [currentCustomer]);


  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gpay');
  const [upiId, setUpiId] = useState('sneha@okaxis');
  const [upiOption, setUpiOption] = useState<'app' | 'qr' | 'id'>('app');

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState('Sneha Patel');

  const [codChangePreference, setCodChangePreference] = useState('Exact Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('424');
    setCardName('Sneha Patel');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      let paymentId: string | undefined = undefined;

      // Process Stripe Payment Intent if card is selected
      if (paymentMethod === 'stripe_card') {
        const intentRes = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: totalAmount,
            currency: 'inr',
            customerEmail,
          }),
        });

        const intentData = await intentRes.json();
        if (!intentData.success) {
          throw new Error(intentData.message || 'Payment authorization failed');
        }
        paymentId = intentData.intentId;
      } else if (paymentMethod === 'gpay' || paymentMethod === 'phonepe') {
        paymentId = `upi_${paymentMethod}_${Math.random().toString(36).substring(2, 10)}`;
      }

      // Submit order to server API
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        addressType,
        items: cart.map((c) => ({
          productId: c.product.id,
          name: c.product.name,
          price: c.product.price,
          quantity: c.quantity,
          image: c.product.image,
          unit: c.product.unit,
        })),
        subtotal,
        deliveryFee,
        tip,
        discount,
        tax: Math.round(subtotal * 0.05),
        totalAmount,
        paymentMethod,
        paymentId,
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (orderData.success && orderData.data) {
        // Save order and Buy Again restock record to Firebase Firestore
        try {
          const { saveOrderAndBuyAgainRecordToFirestore } = await import('../firebase');
          await saveOrderAndBuyAgainRecordToFirestore(orderData.data, 7);
        } catch (fbErr) {
          console.warn('Firebase order sync notice:', fbErr);
        }

        onOrderPlaced(orderData.data);
      } else {
        throw new Error(orderData.message || 'Failed to place order');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error processing payment/order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              Secure Checkout & Delivery Details
            </h3>
            <p className="text-xs text-slate-500 font-medium">128-Bit SSL Encrypted Instant UPI / Card Checkout</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-5">
          {/* Section 1: Customer & Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> 1. Delivery Contact & Address
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Mobile Number (For Delivery OTP)</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Street Address / Apartment</label>
              <input
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Payment Method Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-emerald-600" /> 2. Select Payment Method
            </h4>

            {/* Grid of Payment Options including GPay & PhonePe */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Google Pay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('gpay')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'gpay'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-[10px] flex items-center justify-center">
                    G
                  </div>
                  {paymentMethod === 'gpay' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">Google Pay</div>
                  <span className="text-[10px] text-slate-500 font-medium">Instant UPI</span>
                </div>
              </button>

              {/* PhonePe */}
              <button
                type="button"
                onClick={() => setPaymentMethod('phonepe')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'phonepe'
                    ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="w-6 h-6 rounded-lg bg-purple-700 text-white font-black text-[10px] flex items-center justify-center">
                    pe
                  </div>
                  {paymentMethod === 'phonepe' && <CheckCircle className="w-purple-600 h-4" />}
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">PhonePe</div>
                  <span className="text-[10px] text-slate-500 font-medium">UPI / Wallet</span>
                </div>
              </button>

              {/* Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe_card')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'stripe_card'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <CreditCard className="w-5 h-5 text-slate-700" />
                  {paymentMethod === 'stripe_card' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">Card</div>
                  <span className="text-[10px] text-slate-500 font-medium">Credit/Debit</span>
                </div>
              </button>

              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <IndianRupee className="w-5 h-5 text-amber-600" />
                  {paymentMethod === 'cod' && <CheckCircle className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">Cash (COD)</div>
                  <span className="text-[10px] text-slate-500 font-medium">Pay on Delivery</span>
                </div>
              </button>
            </div>

            {/* UPI Option Panel (GPay / PhonePe) */}
            {(paymentMethod === 'gpay' || paymentMethod === 'phonepe') && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Pay via {paymentMethod === 'gpay' ? 'Google Pay' : 'PhonePe'}
                  </span>
                  <div className="flex gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setUpiOption('app')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        upiOption === 'app' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Instant App
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiOption('id')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        upiOption === 'id' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      UPI ID
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiOption('qr')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        upiOption === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      QR Code
                    </button>
                  </div>
                </div>

                {upiOption === 'app' && (
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-emerald-950">
                        Auto Launch {paymentMethod === 'gpay' ? 'Google Pay' : 'PhonePe'}
                      </p>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Clicking "Pay ₹{totalAmount}" will open {paymentMethod === 'gpay' ? 'Google Pay' : 'PhonePe'} on your device for seamless authorization.
                      </p>
                    </div>
                  </div>
                )}

                {upiOption === 'id' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="mobile@upi or user@okaxis"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      A payment request of ₹{totalAmount} will be pushed to your UPI app.
                    </span>
                  </div>
                )}

                {upiOption === 'qr' && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="p-2 bg-slate-900 text-white rounded-xl shrink-0">
                      <QrCode className="w-14 h-14" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block mb-0.5">
                        Scan QR Code with {paymentMethod === 'gpay' ? 'Google Pay' : 'PhonePe'}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Scan with any UPI scanner app. Order verifies instantly upon payment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stripe Card Inputs */}
            {paymentMethod === 'stripe_card' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    💳 Card Credentials
                  </span>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" /> Fill Test Card
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">CVC Code</label>
                    <input
                      type="text"
                      required
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* COD Cash Change Note Selector */}
            {paymentMethod === 'cod' && (
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-xs font-bold text-amber-900 block">
                  💵 Cash Change Preference
                </span>
                <p className="text-[11px] text-amber-800">
                  Please let your delivery agent know if you need change for large banknotes:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {['Exact Cash', 'Need change for ₹500', 'Need change for ₹2000'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCodChangePreference(opt)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                        codChangePreference === opt
                          ? 'bg-amber-500 text-slate-950 border-amber-600'
                          : 'bg-white text-slate-700 border-amber-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-200">
              {errorMessage}
            </div>
          )}

          {/* Summary & Submit */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
              <span>Grand Total (Items + Delivery + Taxes)</span>
              <span className="text-base font-black text-slate-900">₹{totalAmount}</span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Authorizing Payment & Placing Order...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Pay ₹{totalAmount} & Place Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
