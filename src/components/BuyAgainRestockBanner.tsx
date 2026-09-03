import React, { useState, useEffect } from 'react';
import { ShoppingBag, RefreshCw, CheckCircle2, Clock, Sparkles, X, ArrowRight, Zap, Bell, Check } from 'lucide-react';
import { CustomerUser, CartItem, Product, OrderItem, Order } from '../types';
import { getBuyAgainRecordFromFirestore, BuyAgainRecord, saveOrderAndBuyAgainRecordToFirestore } from '../firebase';

interface BuyAgainRestockBannerProps {
  currentCustomer: CustomerUser | null;
  onAddToCart: (product: Product, quantity: number) => void;
  products: Product[];
  onOpenCart?: () => void;
  allOrders?: Order[];
}

export const BuyAgainRestockBanner: React.FC<BuyAgainRestockBannerProps> = ({
  currentCustomer,
  onAddToCart,
  products,
  onOpenCart,
  allOrders = [],
}) => {
  const [buyAgainRecord, setBuyAgainRecord] = useState<BuyAgainRecord | null>(null);
  const [simulatedDaysElapsed, setSimulatedDaysElapsed] = useState<number>(7);
  const [timeframeDays, setTimeframeDays] = useState<number>(7);
  const [isRestocked, setIsRestocked] = useState<boolean>(false);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const customerEmail = currentCustomer?.email ? currentCustomer.email.trim().toLowerCase() : '';

  useEffect(() => {
    async function loadRecord() {
      if (!currentCustomer || !customerEmail) {
        setBuyAgainRecord(null);
        return;
      }

      setIsLoading(true);
      try {
        // 1. Fetch saved Buy Again record from Firestore/localStorage for this specific customer email
        const record = await getBuyAgainRecordFromFirestore(customerEmail);
        if (record && record.items && record.items.length > 0) {
          setBuyAgainRecord(record);
          setTimeframeDays(record.timeframeDays || 7);
          setIsLoading(false);
          return;
        }

        // 2. Check allOrders for any order placed by this specific customer
        if (allOrders && allOrders.length > 0) {
          const userOrders = allOrders.filter(
            (o) => o.customerEmail && o.customerEmail.trim().toLowerCase() === customerEmail
          );

          if (userOrders.length > 0) {
            // Sort by order date descending
            const sorted = [...userOrders].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const latestOrder = sorted[0];

            if (latestOrder && latestOrder.items && latestOrder.items.length > 0) {
              const constructedRecord: BuyAgainRecord = {
                id: `buyagain_${customerEmail}`,
                userId: currentCustomer.id || customerEmail,
                customerEmail: customerEmail,
                lastOrderId: latestOrder.id,
                orderDate: latestOrder.createdAt,
                items: latestOrder.items,
                totalAmount: latestOrder.totalAmount,
                timeframeDays: 7,
                remindAt: new Date(new Date(latestOrder.createdAt).getTime() + 7 * 24 * 3600 * 1000).toISOString(),
                status: 'active',
                updatedAt: new Date().toISOString(),
              };

              setBuyAgainRecord(constructedRecord);
              setTimeframeDays(7);
              setIsLoading(false);
              return;
            }
          }
        }

        // 3. Registered customer has NOT ordered any items yet -> No banner shown
        setBuyAgainRecord(null);
      } catch (e) {
        console.warn('Error loading buy again record:', e);
        setBuyAgainRecord(null);
      } finally {
        setIsLoading(false);
      }
    }

    setIsClosed(false);
    setIsRestocked(false);
    loadRecord();
  }, [customerEmail, currentCustomer?.id, currentCustomer?.phone, currentCustomer?.name, allOrders]);

  if (isClosed || !buyAgainRecord || buyAgainRecord.items.length === 0) {
    return null;
  }

  // Calculate actual or simulated days since order
  const orderTime = new Date(buyAgainRecord.orderDate).getTime();
  const actualDays = Math.max(1, Math.floor((Date.now() - orderTime) / (1000 * 60 * 60 * 24)));
  const displayDays = Math.max(actualDays, simulatedDaysElapsed);

  // Is it time to restock? (i.e. displayDays >= timeframeDays)
  const isTimeForRestock = displayDays >= timeframeDays;

  const handleRestockAll = () => {
    buyAgainRecord.items.forEach((item) => {
      // Find matching product in catalog or construct fallback product
      const matchedProd = products.find((p) => p.id === item.productId || p.name.toLowerCase() === item.name.toLowerCase()) || {
        id: item.productId,
        name: item.name,
        price: item.price,
        unit: item.unit || '1 pack',
        image: item.image,
        category: 'fruits_vegetables' as const,
        categoryName: 'Grocery',
        dietaryTags: ['Fresh'],
        rating: 4.8,
        reviewsCount: 120,
        stock: 50,
        description: 'Restocked item from your last order.',
      };

      onAddToCart(matchedProd, item.quantity);
    });

    setIsRestocked(true);
    setTimeout(() => {
      if (onOpenCart) onOpenCart();
    }, 600);
  };

  const handleUpdateFrequency = async (newDays: number) => {
    setTimeframeDays(newDays);
    if (buyAgainRecord) {
      const updated = { ...buyAgainRecord, timeframeDays: newDays };
      setBuyAgainRecord(updated);
      try {
        const { saveOrderAndBuyAgainRecordToFirestore } = await import('../firebase');
        await saveOrderAndBuyAgainRecordToFirestore(
          {
            id: buyAgainRecord.lastOrderId,
            customerEmail,
            items: buyAgainRecord.items,
            totalAmount: buyAgainRecord.totalAmount,
            createdAt: buyAgainRecord.orderDate,
          } as any,
          newDays
        );
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 my-4">
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/30 rounded-3xl p-4 sm:p-5 relative shadow-sm overflow-hidden backdrop-blur-xs">
        {/* Background Sparkle & Badge */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          {/* Header Info */}
          <div className="space-y-1 flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Bell className="w-3 h-3 animate-bounce" />
                BUY AGAIN RESTOCK ALERT
              </span>
              <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-700" />
                {displayDays} Day(s) Since Last Order
              </span>
              <span className="text-slate-500 text-xs font-medium">
                (Order ID: <strong className="text-slate-800 font-mono">{buyAgainRecord.lastOrderId}</strong>)
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              🛒 Time to Restock Your Grocery Essentials!
            </h3>

            <p className="text-xs text-slate-600 font-medium max-w-2xl">
              It has been <strong className="text-emerald-800 font-bold">{displayDays} days</strong> since your last purchase on{' '}
              {new Date(buyAgainRecord.orderDate).toLocaleDateString()}. Based on your consumption cycle, items like{' '}
              <strong className="text-slate-800">
                {(buyAgainRecord.items || []).slice(0, 3).map((i) => i.name).join(', ')}
              </strong>{' '}
              may be running low.
            </p>
          </div>

          {/* Controls & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            {/* Simulation controls for demo testing */}
            <div className="bg-white/80 border border-slate-200 rounded-2xl p-2 flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider px-1">
                Restock Cycle:
              </span>
              <div className="flex gap-1">
                {[3, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSimulatedDaysElapsed(d);
                      handleUpdateFrequency(d);
                    }}
                    className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all ${
                      timeframeDays === d
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Every {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Restock All Button */}
            <button
              onClick={handleRestockAll}
              disabled={isRestocked}
              className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 ${
                isRestocked
                  ? 'bg-emerald-700 text-white shadow-emerald-700/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25'
              }`}
            >
              {isRestocked ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Restocked to Cart!
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" /> Restock Last Order (₹{buyAgainRecord.totalAmount})
                </>
              )}
            </button>

            {/* Dismiss button */}
            <button
              onClick={() => setIsClosed(true)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/60 transition-colors self-end sm:self-center"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Item Preview Pills */}
        <div className="mt-3.5 pt-3 border-t border-emerald-500/20 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-extrabold text-slate-700 shrink-0 uppercase tracking-wider">
            Items in Last Order ({(buyAgainRecord.items || []).length}):
          </span>
          <div className="flex items-center gap-2">
            {(buyAgainRecord.items || []).map((item, idx) => (
              <div
                key={idx}
                className="bg-white/90 border border-slate-200/90 rounded-xl px-2.5 py-1 flex items-center gap-2 shrink-0 shadow-2xs"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-6 h-6 object-cover rounded-md"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] sm:max-w-[160px]">
                  {item.name}
                </span>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                  x{item.quantity}
                </span>
                <span className="text-xs font-black text-slate-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
