import React from 'react';
import { X, Package, Clock, MapPin, ArrowRight, RotateCcw, CheckCircle2, Truck, ShieldAlert, Key, ShoppingBag } from 'lucide-react';
import { Order, Product } from '../types';

interface CustomerOrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onReorderItems: (order: Order) => void;
  customerName?: string;
}

export const CustomerOrderHistoryModal: React.FC<CustomerOrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onTrackOrder,
  onReorderItems,
  customerName = 'Guest',
}) => {
  if (!isOpen) return null;

  const isGuest =
    !customerName ||
    customerName === 'Guest' ||
    customerName === 'Valued Customer' ||
    customerName === 'undefined' ||
    customerName.trim().length === 0;

  const displayCustomerName = isGuest ? 'Guest' : customerName;

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'placed':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" /> Order Placed
          </span>
        );
      case 'packed':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <Package className="w-3 h-3 text-purple-600" /> Packed at Dark Store
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
            <Truck className="w-3 h-3 text-amber-700" /> Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 overflow-y-auto p-3 sm:p-4 md:p-6 flex items-center justify-center min-h-screen"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 relative my-auto max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                Customer Order History
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Past orders & live express delivery status for <strong>{displayCustomerName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Order List Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {orders.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-extrabold text-slate-800">No Orders Found</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                You haven't placed any grocery orders yet. Start exploring fresh fruits, vegetables, and daily essentials!
              </p>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all"
              >
                Start Grocery Shopping
              </button>
            </div>
          ) : (
            (orders || []).map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 shadow-xs transition-all hover:shadow-md space-y-3"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {ord.id}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(ord.orderStatus)}
                    <span className="text-xs font-black text-slate-900">
                      ₹{ord.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Address & OTP Info if Active */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5 truncate max-w-md">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate font-medium">{ord.deliveryAddress}</span>
                  </div>
                  {ord.orderStatus !== 'delivered' && ord.orderStatus !== 'cancelled' && (
                    <div className="flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-lg font-black shrink-0">
                      <Key className="w-3.5 h-3.5 text-amber-700" />
                      <span>Delivery OTP: {ord.otp}</span>
                    </div>
                  )}
                </div>

                {/* Items Thumbnails & List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ordered Items ({(ord.items || []).reduce((sum, item) => sum + item.quantity, 0)})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(ord.items || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 bg-white border border-slate-100 p-2 rounded-xl">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="truncate flex-1">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {item.quantity}x • {item.unit} @ ₹{item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">
                    Paid via <span className="uppercase font-bold text-slate-800">{ord.paymentMethod}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { saveOrderAndBuyAgainRecordToFirestore } = await import('../firebase');
                          await saveOrderAndBuyAgainRecordToFirestore(ord, 7);
                        } catch (e) {
                          // ignore
                        }
                        onReorderItems(ord);
                      }}
                      className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600" /> Buy Again / Restock
                    </button>

                    {ord.orderStatus !== 'delivered' && ord.orderStatus !== 'cancelled' ? (
                      <button
                        type="button"
                        onClick={() => {
                          onTrackOrder(ord);
                          onClose();
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <Truck className="w-3.5 h-3.5" /> Track Live Order <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onTrackOrder(ord);
                          onClose();
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 transition-all active:scale-95"
                      >
                        View Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
