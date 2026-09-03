export type CategoryId = 
  | 'all' 
  | 'fruits_vegetables'
  | 'dairy_bread_eggs'
  | 'atta_rice_pulses'
  | 'oils_spices'
  | 'snacks_biscuits'
  | 'beverages'
  | 'instant_food'
  | 'breakfast_cereals'
  | 'frozen_food'
  | 'bakery_desserts'
  | 'personal_care'
  | 'baby_care'
  | 'home_cleaning'
  | 'kitchen_essentials'
  | 'pet_care'
  | 'stationery'
  | 'health_wellness'
  | 'organic_products'
  | 'sweets_chocolates'
  | 'seasonal_specials';

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: CategoryId;
  categoryName: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  unit: string;
  weight?: string;
  image: string;
  images?: string[];
  rating: number;
  reviewsCount: number;
  stock: number;
  dietaryTags: string[];
  calories?: number;
  nutritionalInfo?: string;
  description: string;
  deliveryTime?: string;
  isFlashDeal?: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'gpay' | 'phonepe' | 'stripe_card' | 'saved_card' | 'cod';

export type OrderStatus = 'placed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  addressType: 'Home' | 'Work' | 'Other';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'cod_pending' | 'failed';
  paymentId?: string;
  orderStatus: OrderStatus;
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
  deliveryAgentVehicle?: string;
  estimatedDeliveryTime: string; // e.g., "12 mins"
  createdAt: string;
  updatedAt: string;
  otp: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  cancellationReason?: string;
  rejectionReason?: string;
  rating?: {
    stars: number;
    comment?: string;
    tags?: string[];
    createdAt?: string;
  };
  tipAmount?: number;
  messages?: Array<{
    id: string;
    sender: 'customer' | 'agent' | 'system';
    text: string;
    timestamp: string;
  }>;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  avatar?: string;
  vehicle: string;
  vehicleType?: 'Bike' | 'Scooter' | 'EV Scooter' | 'Bicycle';
  city?: string;
  rating: number;
  ratingsCount?: number;
  status: 'online' | 'offline';
  isSuspended?: boolean;
  documentsVerified: boolean;
  documents?: {
    drivingLicense?: { number: string; verified: boolean };
    aadhaarNumber?: { number: string; verified: boolean };
    vehicleRC?: { number: string; verified: boolean };
  };
  completedDeliveries: number;
  cancelledDeliveries?: number;
  totalEarnings: number;
  walletBalance: number;
  incentivesEarned?: number;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    lastUpdated?: string;
  };
  joinedDate?: string;
}

export interface WithdrawalRequest {
  id: string;
  agentId: string;
  agentName: string;
  amount: number;
  method: 'UPI' | 'Bank Transfer';
  targetAccount: string;
  status: 'pending' | 'processed' | 'rejected';
  requestedAt: string;
}

export interface DeliveryNotification {
  id: string;
  agentId: string;
  title: string;
  message: string;
  type: 'order' | 'payout' | 'incentive' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  calories: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Chef Level';
  image: string;
  category: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    productId?: string;
  }>;
}

export interface AIGroceryListResult {
  title: string;
  reasoning: string;
  suggestedItems: Array<{
    productId: string;
    productName: string;
    qty: number;
    reason: string;
  }>;
}

export interface AIRecipeToCartResult {
  recipeName: string;
  matchedItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  summary: string;
}

export interface AIDemandForecastResult {
  summary: string;
  topInsights: string[];
  stockRecommendations: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    recommendedOrder: number;
    urgency: 'high' | 'medium' | 'low';
    reason: string;
  }>;
}

export type AppRole = 'customer' | 'admin' | 'delivery';
export type UserRole = 'customer' | 'driver' | 'admin';
export type UserStatus = 'active' | 'pending_approval' | 'rejected';

export interface UserProfile {
  uid: string;
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phone?: string;
  address?: string;
  avatar?: string;
  vehicle?: string;
  city?: string;
  provider?: 'email' | 'google';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  provider?: 'email' | 'google';
  role?: UserRole;
  status?: UserStatus;
  isGuest?: boolean;
  createdAt?: string;
}
