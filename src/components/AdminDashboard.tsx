import React, { useState, useEffect } from 'react';
import { Product, Order, DeliveryAgent, AIDemandForecastResult } from '../types';
import logoImg from '../assets/images/grocery_truck_logo_1786025966309.jpg';
import { DataAnalyticsDashboard } from './DataAnalyticsDashboard';
import { GeminiStoreOpsConsole } from './GeminiStoreOpsConsole';
import { VisualInspectionModal } from './VisualInspectionModal';
import { RechartsOrderTrends } from './RechartsOrderTrends';
import { getOrdersFromFirestore, getAgentsFromFirestore } from '../firebase';
import { maskCustomerName, maskCustomerAddress } from '../utils/maskCustomerData';
import {
  ShieldAlert, Sparkles, TrendingUp, Package, ShoppingBag, Users, Plus, Edit3,
  Trash2, RefreshCw, Loader2, AlertTriangle, CheckCircle2, ShieldCheck, UserPlus,
  Ban, MapPin, Navigation, DollarSign, Award, Phone, Check, X, ArrowUpRight, BarChart3,
  Zap, Camera, Compass
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onRefreshData }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'store_ops' | 'overview' | 'products' | 'orders' | 'delivery_partners' | 'ai_forecast'>('analytics');
  const [fleetFilter, setFleetFilter] = useState<'all' | 'pending' | 'verified' | 'suspended'>('all');
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);

  // Determine if viewing in Guest / Demo Admin Mode (Admin always sees full unmasked customer data)
  const isGuestAdmin = false;

  // AI Demand Forecast State
  const [aiForecast, setAiForecast] = useState<AIDemandForecastResult | null>(null);
  const [isAnalyzingForecast, setIsAnalyzingForecast] = useState(false);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('fresh_fruits');
  const [newProdPrice, setNewProdPrice] = useState('149');
  const [newProdStock, setNewProdStock] = useState('30');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80');

  // Add / Edit Delivery Partner Modal State
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<DeliveryAgent | null>(null);
  const [agentFormName, setAgentFormName] = useState('');
  const [agentFormPhone, setAgentFormPhone] = useState('');
  const [agentFormEmail, setAgentFormEmail] = useState('');
  const [agentFormVehicle, setAgentFormVehicle] = useState('Honda Activa EV');
  const [agentFormCity, setAgentFormCity] = useState('New Delhi');
  const [agentFormLicense, setAgentFormLicense] = useState('DL-01-2024-9988');
  const [agentFormAadhaar, setAgentFormAadhaar] = useState('9988-7766-5544');

  // Manual Order Assignment State
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [selectedAgentForAssign, setSelectedAgentForAssign] = useState('');

  const fetchAdminData = async () => {
    try {
      const ordersRes = await fetch('/api/orders');
      const isOrdersJson = ordersRes.headers.get('content-type')?.includes('application/json');
      if (ordersRes.ok && isOrdersJson) {
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.data) {
          setOrders(ordersData.data);
        }
      } else {
        const fsOrders = await getOrdersFromFirestore();
        if (fsOrders && fsOrders.length > 0) setOrders(fsOrders);
      }

      const agentsRes = await fetch('/api/agents');
      const isAgentsJson = agentsRes.headers.get('content-type')?.includes('application/json');
      if (agentsRes.ok && isAgentsJson) {
        const agentsData = await agentsRes.json();
        if (agentsData.success && agentsData.data) {
          setAgents(agentsData.data);
        }
      } else {
        const fsAgents = await getAgentsFromFirestore();
        if (fsAgents && fsAgents.length > 0) setAgents(fsAgents);
      }
    } catch {
      // Fallback silently to Firestore data
      try {
        const [fsOrders, fsAgents] = await Promise.all([
          getOrdersFromFirestore(),
          getAgentsFromFirestore(),
        ]);
        if (fsOrders && fsOrders.length > 0) setOrders(fsOrders);
        if (fsAgents && fsAgents.length > 0) setAgents(fsAgents);
      } catch (fsErr) {
        // silent fallback
      }
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleRunAIForecast = async () => {
    setIsAnalyzingForecast(true);
    try {
      const res = await fetch('/api/ai/demand-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiForecast(data.data);
        setActiveTab('ai_forecast');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingForecast(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCategory,
          categoryName: newProdCategory.replace(/_/g, ' ').toUpperCase(),
          price: Number(newProdPrice),
          stock: Number(newProdStock),
          image: newProdImage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setNewProdName('');
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from catalog?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Agent Management APIs
  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        // Edit agent
        await fetch(`/api/agents/${editingAgent.id}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: agentFormName,
            phone: agentFormPhone,
            vehicle: agentFormVehicle,
          }),
        });
      } else {
        // Add new agent
        await fetch('/api/agents/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: agentFormName,
            phone: agentFormPhone,
            email: agentFormEmail,
            vehicle: agentFormVehicle,
            city: agentFormCity,
            drivingLicense: agentFormLicense,
            aadhaarNumber: agentFormAadhaar,
          }),
        });
      }

      setIsAddAgentModalOpen(false);
      setEditingAgent(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to remove this delivery agent from the fleet?')) return;
    
    // Optimistic UI removal
    setAgents((prev) => prev.filter((a) => a.id !== agentId));

    try {
      await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      try {
        const { deleteDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        await deleteDoc(doc(db, 'agents', agentId));
      } catch (e) {
        console.warn('Firestore delete doc notice:', e);
      }
    } catch (err) {
      console.error('Delete agent error:', err);
    } finally {
      fetchAdminData();
    }
  };

  const handleToggleAgentSuspension = async (agent: DeliveryAgent) => {
    const nextSuspendedState = !agent.isSuspended;

    // Optimistic local state update
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agent.id ? { ...a, isSuspended: nextSuspendedState, status: nextSuspendedState ? 'offline' : a.status } : a
      )
    );

    try {
      const res = await fetch(`/api/agents/${agent.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: nextSuspendedState }),
      });
      const resData = await res.json();
      const updatedAgent = resData.data || { ...agent, isSuspended: nextSuspendedState };

      try {
        const { saveAgentToFirestore } = await import('../firebase');
        await saveAgentToFirestore(updatedAgent);
      } catch (e) {
        console.warn('Firestore agent suspend save notice:', e);
      }
    } catch (err) {
      console.error('Toggle suspension error:', err);
    } finally {
      fetchAdminData();
    }
  };

  const handleToggleVerifyDocs = async (agent: DeliveryAgent) => {
    const nextVerified = !agent.documentsVerified;

    // Optimistic local state update
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? { ...a, documentsVerified: nextVerified } : a))
    );

    try {
      const res = await fetch(`/api/agents/${agent.id}/verify-docs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: nextVerified }),
      });
      const resData = await res.json();
      const updatedAgent = resData.data || { ...agent, documentsVerified: nextVerified };

      try {
        const { saveAgentToFirestore } = await import('../firebase');
        await saveAgentToFirestore(updatedAgent);
      } catch (e) {
        console.warn('Firestore agent verify save notice:', e);
      }
    } catch (err) {
      console.error('Toggle verify docs error:', err);
    } finally {
      fetchAdminData();
    }
  };

  const handleAssignOrder = async () => {
    if (!assigningOrder || !selectedAgentForAssign) return;
    try {
      await fetch(`/api/orders/${assigningOrder.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgentForAssign }),
      });
      setAssigningOrder(null);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddAgentModal = () => {
    setEditingAgent(null);
    setAgentFormName('');
    setAgentFormPhone('');
    setAgentFormEmail('');
    setAgentFormVehicle('TVS iQube EV');
    setAgentFormCity('New Delhi');
    setIsAddAgentModalOpen(true);
  };

  const openEditAgentModal = (agent: DeliveryAgent) => {
    setEditingAgent(agent);
    setAgentFormName(agent.name);
    setAgentFormPhone(agent.phone);
    setAgentFormEmail(agent.email || '');
    setAgentFormVehicle(agent.vehicle);
    setAgentFormCity(agent.city || 'Delhi NCR');
    setIsAddAgentModalOpen(true);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const lowStockCount = products.filter((p) => p.stock <= 15).length;
  const pendingAgentsCount = (agents || []).filter((a) => !a.documentsVerified).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 rounded-3xl p-6 text-white shadow-xl border border-amber-800/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="InstaCart AI Logo"
              className="w-12 h-12 rounded-2xl object-cover border border-amber-400/40 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">InstaCart AI</h2>
                <span className="text-xs bg-amber-500/30 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-400/30">Admin Console</span>
              </div>
              <p className="text-xs text-amber-200 font-medium">
                AI-Powered Grocery Delivery Platform • Dispatch & Fleet Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsVisualModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-slate-950" /> Visual Quality Inspection
            </button>

            <button
              onClick={handleRunAIForecast}
              disabled={isAnalyzingForecast}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              {isAnalyzingForecast ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Forecasting Demand...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" /> Run AI Inventory Forecast
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner for Pending Delivery Partner Approvals */}
      {pendingAgentsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-2 border-amber-500/40 text-amber-950 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl font-black shadow-md flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  STORE ADMIN ACTION REQUIRED
                </span>
                <h4 className="text-sm font-black text-amber-950 tracking-tight">
                  {pendingAgentsCount} Delivery Partner{pendingAgentsCount > 1 ? 's' : ''} Awaiting Profile Approval
                </h4>
              </div>
              <p className="text-xs text-amber-900 font-medium mt-1">
                Riders have registered & verified emails. Review and approve their document credentials to allow order acceptance.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('delivery_partners');
              setFleetFilter('pending');
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shrink-0 transition-all active:scale-95"
          >
            <span>Review Approvals ({pendingAgentsCount})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Gross Revenue</span>
          <span className="text-2xl font-black text-slate-900">₹{totalRevenue}</span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">↑ 24% growth</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Orders</span>
          <span className="text-2xl font-black text-slate-900">{orders.length} Orders</span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">11.4 min average ETA</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery Partners</span>
          <span className="text-2xl font-black text-teal-700">{agents.length} Fleet Partners</span>
          <span className="text-[11px] text-teal-600 font-bold block mt-1">
            {agents.filter((a) => a.status === 'online').length} Currently Online
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Low Stock Alerts</span>
          <span className="text-2xl font-black text-rose-600">{lowStockCount} Items</span>
          <span className="text-[11px] text-rose-500 font-bold block mt-1">Stock &lt; 15 units</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'analytics', label: '📊 Data Analytics Dashboard' },
          { key: 'store_ops', label: '⚡ Gemini Store Ops Console' },
          { key: 'overview', label: 'Store Overview' },
          { key: 'delivery_partners', label: `🚴 Delivery Fleet (${agents.length})${pendingAgentsCount > 0 ? ` • ⚠️ ${pendingAgentsCount} PENDING` : ''}` },
          { key: 'products', label: `Catalog Management (${products.length})` },
          { key: 'orders', label: `Order Dispatch (${orders.length})` },
          { key: 'ai_forecast', label: 'AI Inventory Forecast' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB 0: DATA ANALYTICS DASHBOARD ================= */}
      {activeTab === 'analytics' && (
        <DataAnalyticsDashboard
          products={products}
          orders={orders}
          agents={agents}
          onRefreshData={fetchAdminData}
        />
      )}

      {/* ================= TAB: GEMINI STORE OPS CONSOLE (FUNCTION CALLING) ================= */}
      {activeTab === 'store_ops' && (
        <GeminiStoreOpsConsole onRefreshStoreData={fetchAdminData} />
      )}

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <RechartsOrderTrends orders={orders} products={products} />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Recent Orders List */}
            <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Recent Live Orders</h3>
              <div className="space-y-3">
                {(orders || []).slice(0, 5).map((ord) => (
                  <div key={ord.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 block">
                        {ord.id} • {maskCustomerName(ord.customerName, isGuestAdmin)}
                      </span>
                      <span className="text-[10px] text-slate-500">{(ord.items || []).length} items • {(ord.paymentMethod || '').toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900 block">₹{ord.totalAmount}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {(ord.orderStatus || '').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Fleet Status */}
            <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Delivery Fleet Overview</h3>
              <div className="space-y-3">
                {(agents || []).map((ag) => (
                  <div key={ag.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={ag.avatar} alt={ag.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-slate-900 block">{ag.name}</span>
                        <span className="text-[10px] text-slate-500">{ag.vehicle} • ★ {ag.rating}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md ${
                        ag.isSuspended
                          ? 'bg-rose-100 text-rose-800'
                          : ag.status === 'online'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {ag.isSuspended ? 'SUSPENDED' : ag.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DELIVERY FLEET MANAGEMENT ================= */}
      {activeTab === 'delivery_partners' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>Delivery Agent Fleet Directory & Control</span>
                {pendingAgentsCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                    {pendingAgentsCount} PENDING APPROVAL
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review rider registrations, verify driver credentials, approve store access, and assign orders.
              </p>
            </div>

            <button
              onClick={openAddAgentModal}
              className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md"
            >
              <UserPlus className="w-4 h-4" /> Add Delivery Partner
            </button>
          </div>

          {/* Fleet Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFleetFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                fleetFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Riders ({agents.length})
            </button>
            <button
              onClick={() => setFleetFilter('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                fleetFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              Pending Admin Approval ({agents.filter((a) => !a.documentsVerified).length})
            </button>
            <button
              onClick={() => setFleetFilter('verified')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                fleetFilter === 'verified'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Approved & Verified ({agents.filter((a) => a.documentsVerified && !a.isSuspended).length})
            </button>
            <button
              onClick={() => setFleetFilter('suspended')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                fleetFilter === 'suspended'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <Ban className="w-3.5 h-3.5 text-rose-600" />
              Suspended ({agents.filter((a) => a.isSuspended).length})
            </button>
          </div>

          {/* Fleet Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Partner Info</th>
                    <th className="p-4">Duty Status</th>
                    <th className="p-4">Doc Verification & Approval</th>
                    <th className="p-4">Trips & Rating</th>
                    <th className="p-4">Wallet Balance</th>
                    <th className="p-4">Live Location</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(agents || [])
                    .filter((ag) => {
                      if (fleetFilter === 'pending') return !ag.documentsVerified;
                      if (fleetFilter === 'verified') return ag.documentsVerified && !ag.isSuspended;
                      if (fleetFilter === 'suspended') return ag.isSuspended;
                      return true;
                    })
                    .map((ag) => (
                      <tr
                        key={ag.id}
                        className={`transition-colors ${
                          !ag.documentsVerified
                            ? 'bg-amber-50/40 hover:bg-amber-50/70 border-l-4 border-l-amber-500'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="p-4 flex items-center gap-3">
                          <img src={ag.avatar} alt={ag.name} className="w-10 h-10 rounded-2xl object-cover shrink-0" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 block">{ag.name}</span>
                              {!ag.documentsVerified && (
                                <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {ag.phone} • {ag.vehicle} • {ag.email || 'No email'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          {ag.isSuspended ? (
                            <span className="bg-rose-100 text-rose-800 font-black text-[10px] px-2.5 py-1 rounded-md">
                              SUSPENDED
                            </span>
                          ) : (
                            <span
                              className={`font-black text-[10px] px-2.5 py-1 rounded-md ${
                                ag.status === 'online' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {ag.status === 'online' ? '● ONLINE' : '○ OFFLINE'}
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          {!ag.documentsVerified ? (
                            <button
                              onClick={() => handleToggleVerifyDocs(ag)}
                              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold px-3 py-1.5 rounded-xl text-[11px] shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Verify Rider</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleVerifyDocs(ag)}
                              className="bg-emerald-500/10 text-emerald-700 border border-emerald-300 hover:bg-emerald-500/20 text-[10px] font-black px-2.5 py-1 rounded-md flex items-center gap-1 transition-all"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>APPROVED</span>
                            </button>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{ag.completedDeliveries} Trips</span>
                          <span className="text-[10px] font-bold text-amber-600">★ {ag.rating} ({ag.ratingsCount || 0} reviews)</span>
                        </td>

                        <td className="p-4 font-black text-emerald-700">₹{ag.walletBalance}</td>

                        <td className="p-4 text-slate-600 font-medium">
                          <span className="text-[10px] font-bold text-slate-900 block truncate max-w-[160px]">
                            {ag.currentLocation?.address || 'Central Delivery Depot, New Delhi'}
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[9px] text-slate-500 font-mono">
                              {ag.currentLocation?.lat ? ag.currentLocation.lat.toFixed(4) : '28.6139'}, {ag.currentLocation?.lng ? ag.currentLocation.lng.toFixed(4) : '77.2090'}
                            </span>
                            {ag.currentLocation?.lat && (
                              <a
                                href={`https://maps.google.com/?q=${ag.currentLocation.lat},${ag.currentLocation.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[9px] font-bold text-teal-700 hover:underline flex items-center gap-0.5 ml-1"
                                title="Open GPS Location in Google Maps"
                              >
                                <Compass className="w-2.5 h-2.5" /> Map
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!ag.documentsVerified && (
                              <button
                                onClick={() => handleToggleVerifyDocs(ag)}
                                className="px-2.5 py-1.5 text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
                                title="Approve Partner Registration Request"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-700" /> Approve
                              </button>
                            )}

                            <button
                              onClick={() => openEditAgentModal(ag)}
                              className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                              title="Edit Partner Profile"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleToggleAgentSuspension(ag)}
                              className={`px-2 py-1 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 border transition-all active:scale-95 cursor-pointer ${
                                ag.isSuspended
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                              }`}
                              title={ag.isSuspended ? 'Activate Rider Account' : 'Suspend Rider Account'}
                            >
                              <Ban className="w-3.5 h-3.5 text-amber-700" />
                              <span>{ag.isSuspended ? 'Unsuspend' : 'Suspend'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteAgent(ag.id)}
                              className="px-2 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 rounded-lg font-bold text-[10px] inline-flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                              title="Delete Rider Profile Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {(agents || []).filter((ag) => {
                    if (fleetFilter === 'pending') return !ag.documentsVerified;
                    if (fleetFilter === 'verified') return ag.documentsVerified && !ag.isSuspended;
                    if (fleetFilter === 'suspended') return ag.isSuspended;
                    return true;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500 text-xs font-medium">
                        No delivery partners found matching the selected filter ({fleetFilter}).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PRODUCTS CATALOG MANAGEMENT ================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Product Inventory Catalog
            </h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase">
                <tr>
                  <th className="p-4">Item Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(products || []).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[10px] text-slate-500">{p.unit}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700">{p.categoryName}</td>
                    <td className="p-4 font-black text-slate-900">₹{p.price}</td>
                    <td className="p-4">
                      <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${p.stock <= 10 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: ORDERS DISPATCH & MANUAL ASSIGNMENT ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-extrabold uppercase">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Partner</th>
                  <th className="p-4 text-right">Manual Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(orders || []).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="p-4 font-mono font-bold text-slate-900">{o.id}</td>
                    <td className="p-4 font-bold text-slate-800">
                      <div>
                        <span className="text-slate-900 font-extrabold block">{o.customerName || 'Customer'}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                          {o.customerPhone || '+91 98765 43210'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-xs">
                          {o.deliveryAddress}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600 uppercase">{o.paymentMethod}</td>
                    <td className="p-4">
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                        {o.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {o.deliveryAgentName || 'Unassigned'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setAssigningOrder(o); setSelectedAgentForAssign(o.deliveryAgentId || agents[0]?.id || ''); }}
                        className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-1.5 rounded-xl text-[11px]"
                      >
                        Assign Rider
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 5: AI DEMAND & RESTOCK FORECAST ================= */}
      {activeTab === 'ai_forecast' && (
        <div className="space-y-4">
          {!aiForecast ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
              <Sparkles className="w-10 h-10 text-emerald-600 mx-auto animate-pulse" />
              <h4 className="text-sm font-bold text-slate-800">Run Gemini AI Inventory Demand Analysis</h4>
              <button
                onClick={handleRunAIForecast}
                className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Analyze Inventory Trends
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-900 space-y-2">
                <h4 className="text-sm font-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" /> AI Executive Inventory Brief
                </h4>
                <p className="text-xs font-medium leading-relaxed">{aiForecast.summary}</p>
              </div>

              {/* Restock Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Recommended Purchase Orders
                </h4>
                <div className="space-y-2">
                  {aiForecast.stockRecommendations?.map((rec, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{rec.productName}</span>
                        <span className="text-[11px] text-slate-500">{rec.reason}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700 block">
                          + {rec.recommendedOrder} units recommended
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          Urgency: {rec.urgency.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT DELIVERY AGENT */}
      {isAddAgentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {editingAgent ? 'Edit Delivery Partner Details' : 'Add New Delivery Partner'}
            </h3>

            <form onSubmit={handleSaveAgent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={agentFormName}
                  onChange={(e) => setAgentFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={agentFormPhone}
                    onChange={(e) => setAgentFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Details</label>
                  <input
                    type="text"
                    required
                    value={agentFormVehicle}
                    onChange={(e) => setAgentFormVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {!editingAgent && (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={agentFormEmail}
                      onChange={(e) => setAgentFormEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Driving License</label>
                      <input
                        type="text"
                        value={agentFormLicense}
                        onChange={(e) => setAgentFormLicense(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Aadhaar Card</label>
                      <input
                        type="text"
                        value={agentFormAadhaar}
                        onChange={(e) => setAgentFormAadhaar(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddAgentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 text-white font-black px-5 py-2 rounded-xl text-xs hover:bg-teal-700"
                >
                  {editingAgent ? 'Save Partner Updates' : 'Add Delivery Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ORDER ASSIGNMENT */}
      {assigningOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Assign Order {assigningOrder.id} to Delivery Rider
            </h3>
            <p className="text-xs text-slate-600">
              Customer: {maskCustomerName(assigningOrder.customerName, isGuestAdmin)} ({maskCustomerAddress(assigningOrder.deliveryAddress, isGuestAdmin)})
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Select Delivery Agent:</label>
              <select
                value={selectedAgentForAssign}
                onChange={(e) => setSelectedAgentForAssign(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-900 outline-none"
              >
                {(agents || []).map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name} — {ag.vehicle} ({ag.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setAssigningOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignOrder}
                className="bg-teal-600 text-white font-black px-5 py-2 rounded-xl text-xs hover:bg-teal-700"
              >
                Confirm Dispatch Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add New Item to Catalog</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl text-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Multimodal Visual Inspection Modal */}
      <VisualInspectionModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
        onStockUpdated={fetchAdminData}
      />
    </div>
  );
};
