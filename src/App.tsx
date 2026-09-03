import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Product, CartItem, CategoryId, Order, AppRole, CustomerUser, UserProfile } from './types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_RECIPES, INITIAL_ORDERS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AIGroceryGeneratorModal } from './components/AIGroceryGeneratorModal';
import { AIRecipeModal } from './components/AIRecipeModal';
import { AIShoppingChatbotModal } from './components/AIShoppingChatbotModal';
import { AIBudgetBasketModal } from './components/AIBudgetBasketModal';
import { AINutritionAdvisorModal } from './components/AINutritionAdvisorModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerOrderHistoryModal } from './components/CustomerOrderHistoryModal';
import { AIEventsRecommendationModal } from './components/AIEventsRecommendationModal';
import { SnapAndRestockModal } from './components/SnapAndRestockModal';
import { BuyAgainRestockBanner } from './components/BuyAgainRestockBanner';
import { AIFeaturesHubBar } from './components/AIFeaturesHubBar';
import { DeliveryAgentPortal } from './components/DeliveryAgentPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { RoleSelectionLanding } from './pages/RoleSelectionLanding';
import { CustomerAuthPage } from './pages/CustomerAuthPage';
import { DeliveryAuthPage } from './pages/DeliveryAuthPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { getProductsFromFirestore, getOrdersFromFirestore } from './firebase';
import { Sparkles, ShoppingBag } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRole, setActiveRole] = useState<AppRole>('customer');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState(INITIAL_CATEGORIES);
  const [recipes] = useState(INITIAL_RECIPES);

  // Customer Authentication State (Strictly null for Guest Mode unless signed in)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(() => {
    try {
      const role = localStorage.getItem('instacart_user_role');
      if (role !== 'customer') return null;
      const saved = localStorage.getItem('instacart_customer_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.isGuest && parsed.email !== 'guest@demo.com') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored customer user:', e);
    }
    return null;
  });

  // Keep state synchronized on navigation / route changes
  useEffect(() => {
    const role = localStorage.getItem('instacart_user_role');
    const saved = localStorage.getItem('instacart_customer_user');
    if (role !== 'customer' || !saved) {
      setCurrentCustomer(null);
    } else {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.isGuest && parsed.email !== 'guest@demo.com') {
          setCurrentCustomer(parsed);
        } else {
          setCurrentCustomer(null);
        }
      } catch {
        setCurrentCustomer(null);
      }
    }
  }, [location.pathname]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Orders State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [tipAmount, setTipAmount] = useState(30);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // AI Feature Modals State
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isSnapAndRestockOpen, setIsSnapAndRestockOpen] = useState(false);
  const [isEventsRecommendationOpen, setIsEventsRecommendationOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isShoppingChatbotOpen, setIsShoppingChatbotOpen] = useState(false);
  const [isBudgetBasketOpen, setIsBudgetBasketOpen] = useState(false);
  const [isNutritionAdvisorOpen, setIsNutritionAdvisorOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch products & orders from server API with Firestore fallback
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const data = await res.json();
        if (data.success && data.data) {
          setProducts(data.data);
          return;
        }
      }
    } catch {
      // ignore API fetch error and fallback to Firestore
    }
    const fsProducts = await getProductsFromFirestore();
    if (fsProducts && fsProducts.length > 0) {
      setProducts(fsProducts);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (res.ok && isJson) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setAllOrders(data.data);
          return;
        }
      }
    } catch {
      // ignore API fetch error and fallback to Firestore
    }
    const fsOrders = await getOrdersFromFirestore();
    if (fsOrders && fsOrders.length > 0) {
      setAllOrders(fsOrders);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleReorderItems = (order: Order) => {
    const itemsToAdd = (order.items || []).map((item) => {
      const existingProd = products.find((p) => p.id === item.productId || p.name === item.name);
      const prod: Product = existingProd || {
        id: item.productId || `prod_${Math.random()}`,
        name: item.name,
        category: 'fresh_produce',
        categoryName: 'Fresh Produce',
        price: item.price,
        unit: item.unit || '1 pack',
        image: item.image,
        rating: 5.0,
        reviewsCount: 10,
        stock: 20,
        dietaryTags: ['Fresh'],
        calories: 100,
        description: 'Re-ordered grocery item.',
      };
      return { product: prod, quantity: item.quantity };
    });

    handleAddMultipleToCart(itemsToAdd);
    setIsOrderHistoryOpen(false);
    setIsCartOpen(true);
    showToast(`Added items from order ${order.id} back to basket!`);
  };

  // Cart Operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`Added 1x ${product.name} to cart`);
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleAddMultipleToCart = (itemsToAdd: Array<{ product: Product; quantity: number }>) => {
    setCart((prev) => {
      const newCart = [...prev];
      itemsToAdd.forEach(({ product, quantity }) => {
        const existingIdx = newCart.findIndex((i) => i.product.id === product.id);
        if (existingIdx > -1) {
          newCart[existingIdx].quantity += quantity;
        } else {
          newCart.push({ product, quantity });
        }
      });
      return newCart;
    });
    showToast(`Added ${itemsToAdd.length} AI suggested items to cart!`);
    setIsCartOpen(true);
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      (p.dietaryTags || []).some((t) => t.toLowerCase().includes(q));

    // When actively searching, search across all products regardless of selected category
    if (q) {
      return matchesSearch;
    }

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesCategory;
  });

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartDiscount = appliedCoupon === 'INSTA20' ? Math.round(cartSubtotal * 0.20) : 0;
  const cartDeliveryFee = cartSubtotal === 0 ? 0 : (cartSubtotal >= 299 ? 0 : 29);
  const cartTax = Math.round(cartSubtotal * 0.05);
  const cartTotalAmount = Math.max(0, cartSubtotal - cartDiscount + cartDeliveryFee + cartTax + tipAmount);

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    localStorage.setItem('instacart_user_role', 'guest');
    localStorage.removeItem('instacart_customer_user');
    showToast('Signed out of customer account successfully');
  };

  const handleCustomerSuccessAuth = (user: UserProfile | CustomerUser) => {
    localStorage.setItem('instacart_user_role', 'customer');
    localStorage.setItem('instacart_customer_user', JSON.stringify(user));
    setCurrentCustomer(user as CustomerUser);
    showToast(`Signed in successfully as ${user.name}`);
  };

  const handleDeliverySuccessAuth = (agent: any) => {
    localStorage.setItem('instacart_user_role', 'driver');
    if (agent && agent.id) {
      localStorage.setItem('instacart_active_agent_id', agent.id);
    }
    showToast(`Signed in successfully as Delivery Partner ${agent.name || ''}`);
  };

  const handleAdminSuccessAuth = (adminUser: any) => {
    localStorage.setItem('instacart_user_role', 'admin');
    showToast(`Signed in successfully as Admin`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Routes Definition */}
      <Routes>
        {/* Landing Page with 3 Cards */}
        <Route path="/" element={<RoleSelectionLanding />} />

        {/* Independent Auth Routes */}
        <Route
          path="/customer/auth"
          element={
            <CustomerAuthPage
              currentCustomer={currentCustomer}
              onCustomerLogout={handleCustomerLogout}
              onSuccessLogin={handleCustomerSuccessAuth}
            />
          }
        />
        <Route
          path="/delivery/auth"
          element={<DeliveryAuthPage onSuccessLogin={handleDeliverySuccessAuth} />}
        />
        <Route
          path="/admin/login"
          element={<AdminLoginPage onSuccessLogin={handleAdminSuccessAuth} />}
        />

        {/* Dashboard Routes */}
        <Route
          path="/customer/dashboard"
          element={
            <div>
              <Navbar
                activeRole="customer"
                setActiveRole={setActiveRole}
                cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
                cartTotal={cartTotalAmount}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                currentCustomer={currentCustomer}
                onCustomerLogout={handleCustomerLogout}
                onOpenAuthModal={() => navigate('/customer/auth')}
                onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
                onOpenEventRecommendations={() => setIsEventsRecommendationOpen(true)}
                onOpenShoppingChatbot={() => setIsShoppingChatbotOpen(true)}
              />

              <main className="max-w-7xl mx-auto px-4 pt-4">
                {activeOrder ? (
                  <OrderTrackingView
                    order={activeOrder}
                    onBackToShop={() => setActiveOrder(null)}
                    onReorderItems={handleReorderItems}
                  />
                ) : (
                  <>
                    <BuyAgainRestockBanner
                      currentCustomer={currentCustomer}
                      onAddToCart={handleAddToCart}
                      products={products}
                      onOpenCart={() => setIsCartOpen(true)}
                      allOrders={allOrders}
                    />

                    <HeroBanner
                      onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
                      onOpenSnapAndRestock={() => setIsSnapAndRestockOpen(true)}
                      onOpenRecipeModal={() => setIsRecipeModalOpen(true)}
                      onOpenNutritionModal={() => setIsNutritionAdvisorOpen(true)}
                      onOpenBudgetBasket={() => setIsBudgetBasketOpen(true)}
                      onSelectCategory={setSelectedCategory}
                    />

                    <AIFeaturesHubBar
                      onOpenGroceryGenerator={() => setIsAIGeneratorOpen(true)}
                      onOpenSnapAndRestock={() => setIsSnapAndRestockOpen(true)}
                      onOpenRecipeModal={() => setIsRecipeModalOpen(true)}
                      onOpenCart={() => setIsCartOpen(true)}
                      onOpenAdmin={() => navigate('/admin/login')}
                      onOpenShoppingChatbot={() => setIsShoppingChatbotOpen(true)}
                      onOpenBudgetBasket={() => setIsBudgetBasketOpen(true)}
                      onOpenEventRecommendations={() => setIsEventsRecommendationOpen(true)}
                      onOpenNutritionAdvisor={() => setIsNutritionAdvisorOpen(true)}
                    />

                    <CategoryFilter
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                          Fresh Grocery Items ({filteredProducts.length})
                        </h2>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="text-xs text-rose-600 font-bold hover:underline"
                          >
                            Clear search filter
                          </button>
                        )}
                      </div>

                      {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                          <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                          <h3 className="text-sm font-bold text-slate-800">No items match your query</h3>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Try clearing search terms or ask our AI Grocery Assistant to match items!
                          </p>
                          <button
                            onClick={() => setIsAIGeneratorOpen(true)}
                            className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs"
                          >
                            ⚡ Ask AI Assistant
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {(filteredProducts || []).map((product) => {
                            const cartItem = cart.find((i) => i.product.id === product.id);
                            return (
                              <ProductCard
                                key={product.id}
                                product={product}
                                quantityInCart={cartItem ? cartItem.quantity : 0}
                                onAddToCart={handleAddToCart}
                                onUpdateQuantity={handleUpdateQuantity}
                                onQuickView={(p) => setQuickViewProduct(p)}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </main>
            </div>
          }
        />

        <Route
          path="/delivery/dashboard"
          element={
            <div>
              <Navbar
                activeRole="delivery"
                setActiveRole={setActiveRole}
                cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
                cartTotal={cartTotalAmount}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                currentCustomer={currentCustomer}
                onCustomerLogout={handleCustomerLogout}
                onOpenAuthModal={() => navigate('/delivery/auth')}
                onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
                onOpenEventRecommendations={() => setIsEventsRecommendationOpen(true)}
              />
              <main className="max-w-7xl mx-auto px-4 pt-4">
                <DeliveryAgentPortal />
              </main>
            </div>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <div>
              <Navbar
                activeRole="admin"
                setActiveRole={setActiveRole}
                cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
                cartTotal={cartTotalAmount}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenAIGenerator={() => setIsAIGeneratorOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                currentCustomer={currentCustomer}
                onCustomerLogout={handleCustomerLogout}
                onOpenAuthModal={() => navigate('/admin/login')}
                onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
                onOpenEventRecommendations={() => setIsEventsRecommendationOpen(true)}
              />
              <main className="max-w-7xl mx-auto px-4 pt-4">
                <AdminDashboard products={products} onRefreshData={fetchProducts} />
              </main>
            </div>
          }
        />

        {/* Alias / Fallback Routes */}
        <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="/delivery" element={<Navigate to="/delivery/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          if (!currentCustomer) {
            navigate('/customer/auth');
            showToast('Please sign in first to proceed to payment');
            return;
          }
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        tipAmount={tipAmount}
        setTipAmount={setTipAmount}
        onOpenNutritionAdvisor={() => setIsNutritionAdvisorOpen(true)}
        currentCustomer={currentCustomer}
        onOpenAuthModal={() => navigate('/customer/auth')}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        subtotal={cartSubtotal}
        discount={cartDiscount}
        deliveryFee={cartDeliveryFee}
        tip={tipAmount}
        totalAmount={cartTotalAmount}
        onOrderPlaced={(newOrder) => {
          setIsCheckoutOpen(false);
          setCart([]);
          setActiveOrder(newOrder);
          setAllOrders((prev) => [newOrder, ...prev]);
          showToast(`Order ${newOrder.id} placed! Tracking live...`);
        }}
        currentCustomer={currentCustomer}
      />

      {/* Legacy/Modal Auth component for quick profile view if needed */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentCustomer={currentCustomer}
        onCustomerLogout={handleCustomerLogout}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onSuccessLogin={(user, role) => {
          setCurrentCustomer(user);
          if (role) setActiveRole(role === 'picker' ? 'admin' : role);
          showToast(`Signed in as ${user.name}`);
        }}
      />

      {/* Customer Order History Modal */}
      <CustomerOrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={
          currentCustomer && currentCustomer.email && !currentCustomer.isGuest && currentCustomer.email !== 'guest@demo.com'
            ? allOrders.filter(
                (ord) =>
                  ord.customerEmail &&
                  ord.customerEmail.trim().toLowerCase() === currentCustomer.email.trim().toLowerCase()
              )
            : []
        }
        onTrackOrder={(order) => {
          setActiveOrder(order);
          setIsOrderHistoryOpen(false);
        }}
        onReorderItems={(order) => handleReorderItems(order)}
        customerName={
          currentCustomer && currentCustomer.name && !currentCustomer.isGuest && currentCustomer.email !== 'guest@demo.com'
            ? currentCustomer.name
            : 'Guest'
        }
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        quantityInCart={
          quickViewProduct ? cart.find((i) => i.product.id === quickViewProduct.id)?.quantity || 0 : 0
        }
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateQuantity}
      />

      {/* AI Grocery Generator Modal */}
      <AIGroceryGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        products={products}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      {/* AI Recipe Converter Modal */}
      <AIRecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        recipes={recipes}
        products={products}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      {/* AI Shopping Chatbot Modal */}
      <AIShoppingChatbotModal
        isOpen={isShoppingChatbotOpen}
        onClose={() => setIsShoppingChatbotOpen(false)}
        products={products}
        cart={cart}
        onAddToCart={handleAddToCart}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      {/* AI Budget Basket Modal */}
      <AIBudgetBasketModal
        isOpen={isBudgetBasketOpen}
        onClose={() => setIsBudgetBasketOpen(false)}
        products={products}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      {/* AI Events & Occasions Personalization Modal */}
      <AIEventsRecommendationModal
        isOpen={isEventsRecommendationOpen}
        onClose={() => setIsEventsRecommendationOpen(false)}
        products={products}
        onAddMultipleToCart={handleAddMultipleToCart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* AI Diet & Nutrition Advisor Modal */}
      <AINutritionAdvisorModal
        isOpen={isNutritionAdvisorOpen}
        onClose={() => setIsNutritionAdvisorOpen(false)}
        cart={cart}
        products={products}
        onAddToCart={handleAddToCart}
        onAddMultipleToCart={handleAddMultipleToCart}
      />

      {/* Multimodal Snap & Restock Visual Search Modal */}
      <SnapAndRestockModal
        isOpen={isSnapAndRestockOpen}
        onClose={() => setIsSnapAndRestockOpen(false)}
        products={products}
        onAddMultipleToCart={handleAddMultipleToCart}
        onShowToast={showToast}
      />
    </div>
  );
}
