import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/images/grocery_truck_logo_1786025966309.jpg';
import {
  ShoppingBag,
  Sparkles,
  Search,
  MapPin,
  Clock,
  UserCheck,
  Truck,
  ShieldAlert,
  Mic,
  LogIn,
  LogOut,
  PartyPopper,
  Package,
  Bot,
  Plus,
  Trash2,
  Check,
  X,
  Home,
  Briefcase,
  Dumbbell,
  Users,
  Building,
} from 'lucide-react';
import { AppRole, CustomerUser } from '../types';

export interface DeliveryAddress {
  id: string;
  type: 'Home' | 'Work' | 'Gym' | 'Friends' | 'Other';
  address: string;
  flatNo?: string;
  street?: string;
  city?: string;
  pincode?: string;
  time: string;
}

const INITIAL_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr_1',
    type: 'Home',
    address: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru, KA 560103',
    flatNo: 'Flat 402, Green Glen Layout',
    street: 'Bellandur',
    city: 'Bengaluru',
    pincode: '560103',
    time: '12-15 mins',
  },
  {
    id: 'addr_2',
    type: 'Work',
    address: '120 Market Street, Suite 800, San Francisco, CA 94105',
    flatNo: 'Suite 800',
    street: '120 Market Street',
    city: 'San Francisco',
    pincode: '94105',
    time: '15-20 mins',
  },
  {
    id: 'addr_3',
    type: 'Gym',
    address: '450 Mission St, San Francisco, CA 94105',
    flatNo: 'Main Center',
    street: '450 Mission St',
    city: 'San Francisco',
    pincode: '94105',
    time: '18 mins',
  },
];

interface NavbarProps {
  activeRole: AppRole;
  setActiveRole: (role: AppRole) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAIGenerator: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  currentCustomer?: CustomerUser | null;
  onCustomerLogout?: () => void;
  onOpenAuthModal?: () => void;
  onOpenOrderHistory?: () => void;
  onOpenEventRecommendations?: () => void;
  onOpenShoppingChatbot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAIGenerator,
  searchQuery,
  setSearchQuery,
  currentCustomer,
  onCustomerLogout,
  onOpenAuthModal,
  onOpenOrderHistory,
  onOpenEventRecommendations,
  onOpenShoppingChatbot,
}) => {
  const navigate = useNavigate();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const isLoggedInCustomer = Boolean(
    currentCustomer &&
      !currentCustomer.isGuest &&
      currentCustomer.email !== 'guest@demo.com' &&
      currentCustomer.id !== 'guest_user'
  );

  // Address State with localStorage sync
  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>(() => {
    try {
      const stored = localStorage.getItem('instacart_user_addresses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ADDRESSES;
  });

  const [currentAddress, setCurrentAddress] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('instacart_current_address');
      if (stored) return stored;
    } catch (e) {
      console.error(e);
    }
    return savedAddresses[0]?.address || 'Flat 402, Green Glen Layout, Bellandur, Bengaluru';
  });

  // New Address Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newType, setNewType] = useState<'Home' | 'Work' | 'Gym' | 'Friends' | 'Other'>('Home');
  const [newFlatNo, setNewFlatNo] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPincode, setNewPincode] = useState('');

  // Persist addresses
  useEffect(() => {
    localStorage.setItem('instacart_user_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  // Persist current selected address
  useEffect(() => {
    localStorage.setItem('instacart_current_address', currentAddress);
  }, [currentAddress]);

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlatNo.trim() || !newStreet.trim()) return;

    const fullAddress = `${newFlatNo.trim()}, ${newStreet.trim()}${newCity.trim() ? `, ${newCity.trim()}` : ''}${newPincode.trim() ? ` ${newPincode.trim()}` : ''}`;

    const newAddrObj: DeliveryAddress = {
      id: `addr_${Date.now()}`,
      type: newType,
      address: fullAddress,
      flatNo: newFlatNo.trim(),
      street: newStreet.trim(),
      city: newCity.trim(),
      pincode: newPincode.trim(),
      time: '12-15 mins',
    };

    const updated = [newAddrObj, ...savedAddresses];
    setSavedAddresses(updated);
    setCurrentAddress(fullAddress);

    // Reset Form
    setNewFlatNo('');
    setNewStreet('');
    setNewCity('');
    setNewPincode('');
    setIsAddingNew(false);
  };

  const handleDeleteAddress = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAddresses.filter((a) => a.id !== idToDelete);
    if (updated.length === 0) return; // Keep at least one address
    setSavedAddresses(updated);

    const targetAddr = savedAddresses.find((a) => a.id === idToDelete);
    if (targetAddr && currentAddress === targetAddr.address) {
      setCurrentAddress(updated[0].address);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Home':
        return <Home className="w-3.5 h-3.5" />;
      case 'Work':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'Gym':
        return <Dumbbell className="w-3.5 h-3.5" />;
      case 'Friends':
        return <Users className="w-3.5 h-3.5" />;
      default:
        return <Building className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner Feature Bar & Active Role Badge */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white px-4 py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-300">
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-300 animate-pulse" />
              15-Min Delivery
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300 font-normal">
              Fresh Organic Produce & Instant Grocery Essentials
            </span>
          </div>

          {/* Active Role Indicator */}
          <div className="flex items-center gap-2">
            {activeRole === 'customer' ? (
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-emerald-300" />
                  <span>Customer Storefront</span>
                </span>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
                  title="Switch Portal Selection"
                >
                  <LogOut className="w-3 h-3 text-slate-300" />
                  <span className="hidden md:inline">Portals</span>
                </button>
              </div>
            ) : activeRole === 'delivery' ? (
              <div className="flex items-center gap-2">
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold flex items-center gap-1">
                  <Truck className="w-3 h-3 text-teal-300" />
                  <span>Delivery Partner App</span>
                </span>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
                  title="Switch Portal Selection"
                >
                  <LogOut className="w-3 h-3 text-slate-300" />
                  <span className="hidden md:inline">Portals</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-300" />
                  <span>Admin Console</span>
                </span>
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/10"
                  title="Switch Portal Selection"
                >
                  <LogOut className="w-3 h-3 text-slate-300" />
                  <span className="hidden md:inline">Portals</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div
            onClick={() => navigate(isLoggedInCustomer ? '/customer/dashboard' : '/')}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
            title={isLoggedInCustomer ? "InstaCart AI Storefront" : "Go to Role Selection Portal"}
          >
            <img
              src={logoImg}
              alt="InstaCart AI Logo"
              className="w-10 h-10 rounded-xl object-cover shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform border border-emerald-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 bg-clip-text text-transparent">
                  InstaCart
                </span>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-700/90 -mt-0.5 tracking-tight">
                AI-Powered Grocery Delivery Platform
              </p>
            </div>
          </div>

          {/* Customer Specific Controls: Location & Search */}
          {activeRole === 'customer' && (
            <>
              {/* Delivery Address Selector */}
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setIsLocationModalOpen(true);
                }}
                className="hidden lg:flex items-center gap-2 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 text-slate-700 px-3 py-2 rounded-xl text-xs transition-all text-left group shrink-0"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="truncate max-w-[180px]">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    Deliver in 15 mins <Clock className="w-2.5 h-2.5 text-emerald-600" />
                  </div>
                  <div className="font-bold text-slate-800 truncate text-xs">
                    {currentAddress.split(',')[0]}
                  </div>
                </div>
              </button>

              {/* Search input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('products-grid') || document.getElementById('fresh-grocery-items');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 max-w-xl relative hidden sm:block"
              >
                <div className="relative flex items-center">
                  <button
                    type="submit"
                    title="Click to search items"
                    className="absolute left-2.5 p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors z-10"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search organic fruits, sourdough, milk or ask AI..."
                    className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-900 text-xs pl-10 pr-20 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-14 text-slate-400 hover:text-slate-600 text-xs p-1 rounded-md"
                      title="Clear search query"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg shadow-2xs transition-all"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Action Buttons: Account Profile & Cart */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Account / Login Button */}
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  title="View Profile & Account Settings"
                >
                  {currentCustomer &&
                  currentCustomer.name &&
                  !currentCustomer.isGuest &&
                  currentCustomer.email !== 'guest@demo.com' &&
                  currentCustomer.id !== 'guest_user' ? (
                    <>
                      {currentCustomer.avatar ? (
                        <img
                          src={currentCustomer.avatar}
                          alt={currentCustomer.name}
                          className="w-6 h-6 rounded-full object-cover border border-emerald-500 shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center border border-emerald-400 shadow-2xs uppercase shrink-0">
                          {currentCustomer.name ? currentCustomer.name.trim().charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="hidden md:inline font-extrabold max-w-[100px] truncate">
                        {currentCustomer.name.split(' ')[0]}
                      </span>
                      {currentCustomer.provider === 'google' && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.2 rounded border border-blue-200">
                          G
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-emerald-600" />
                      <span className="hidden sm:inline">Sign In</span>
                    </>
                  )}
                </button>

                {/* AI Shopping Assistant Button */}
                <button
                  onClick={onOpenShoppingChatbot}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200/80 text-teal-950 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0"
                  title="AI Shopping Concierge, Smart Cart Completer & Price Bargains"
                >
                  <Bot className="w-4 h-4 text-teal-600" />
                  <span className="hidden xl:inline">AI Shopping Assistant</span>
                </button>

                {/* AI Events & Occasions Button */}
                <button
                  onClick={onOpenEventRecommendations}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border border-pink-200/80 text-pink-900 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0"
                  title="AI Personalized Event & Celebration Assistant"
                >
                  <PartyPopper className="w-4 h-4 text-pink-600" />
                  <span className="hidden lg:inline">AI Event Assistant</span>
                </button>

                {/* Order History Button */}
                <button
                  onClick={onOpenOrderHistory}
                  className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                  title="View Customer Order History"
                >
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span className="hidden md:inline">Orders</span>
                </button>

                <button
                  onClick={onOpenAIGenerator}
                  className="sm:hidden bg-emerald-50 border border-emerald-200 text-emerald-700 p-2 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </button>

                <button
                  onClick={onOpenCart}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <div className="relative">
                    <ShoppingBag className="w-4.5 h-4.5 stroke-[2.5]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-600 shadow-xs">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline border-l border-emerald-500 pl-2.5">
                    ₹{cartTotal}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Delivery Role Header Bar */}
          {activeRole === 'delivery' && (
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-teal-50 text-teal-700 border border-teal-200 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                Delivery Partner App
              </span>
            </div>
          )}

          {/* Admin Role Header Bar */}
          {activeRole === 'admin' && (
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Store Operations Portal
              </span>
            </div>
          )}
        </div>

        {/* Mobile Search Bar */}
        {activeRole === 'customer' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.getElementById('products-grid') || document.getElementById('fresh-grocery-items');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="mt-2 sm:hidden relative flex items-center"
          >
            <button
              type="submit"
              className="absolute left-3 text-slate-400 hover:text-emerald-600"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grocery items..."
              className="w-full bg-slate-100 text-slate-900 text-xs pl-9 pr-16 py-2 rounded-xl border border-transparent focus:border-emerald-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-12 text-slate-400 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg"
            >
              Go
            </button>
          </form>
        )}
      </div>

      {/* Address Selection Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200 max-h-[88vh] flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {isAddingNew ? 'Add New Address' : 'Select Delivery Address'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isAddingNew ? 'Enter details for express 15-min delivery' : 'Choose where you want your groceries delivered'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setIsAddingNew(false);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isAddingNew ? (
              /* Add New Address Form */
              <form onSubmit={handleSaveNewAddress} className="space-y-3 overflow-y-auto pr-1 flex-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Address Label / Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['Home', 'Work', 'Gym', 'Friends', 'Other'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewType(t)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                          newType === t
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {getTypeIcon(t)} {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Flat / House No / Building Name *
                  </label>
                  <input
                    type="text"
                    value={newFlatNo}
                    onChange={(e) => setNewFlatNo(e.target.value)}
                    placeholder="e.g. Flat 301, Rosewood Apartments"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Street / Area / Locality *
                  </label>
                  <input
                    type="text"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    placeholder="e.g. Bellandur Main Road, Near Ecoworld"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      placeholder="e.g. Bengaluru / San Francisco"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Postal Code / Pincode
                    </label>
                    <input
                      type="text"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      placeholder="e.g. 560103 / 94105"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Save & Deliver Here
                  </button>
                </div>
              </form>
            ) : (
              /* Address List View with Scrollbar */
              <div className="flex-1 flex flex-col space-y-3 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Saved Addresses ({savedAddresses.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(true)}
                    className="text-xs font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Address
                  </button>
                </div>

                {/* Scrollable list of saved addresses */}
                <div className="space-y-2.5 overflow-y-auto max-h-[45vh] pr-1 flex-1">
                  {(savedAddresses || []).map((loc) => {
                    const isSelected = currentAddress === loc.address;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setCurrentAddress(loc.address)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 relative group ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {getTypeIcon(loc.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[11px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md">
                                {loc.type}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-800 font-semibold leading-snug break-words">
                              {loc.address}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                            ⚡ {loc.time}
                          </span>
                          {savedAddresses.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteAddress(loc.id, e)}
                              title="Delete address"
                              className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm Address Button */}
                <div className="pt-2 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => setIsLocationModalOpen(false)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-98"
                  >
                    Confirm Delivery Address →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
