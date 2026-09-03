import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  PartyPopper,
  Check,
  ShoppingBag,
  RefreshCw,
  Users,
  IndianRupee,
  Sliders,
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  Tag,
  Filter
} from 'lucide-react';
import { Product } from '../types';

interface AIEventsRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddMultipleToCart: (items: { product: Product; quantity: number }[]) => void;
  onOpenCart: () => void;
}

export interface EventPreset {
  id: string;
  title: string;
  icon: string;
  badge: string;
  bgGradient: string;
  description: string;
  defaultGuestCount: number;
  defaultBudget: number;
  itemsList: string[];
  recommendedSearchTerms: string[];
}

export const EVENT_PRESETS: EventPreset[] = [
  {
    id: 'birthday',
    title: 'Birthday Party',
    icon: '🎂',
    badge: 'Party Bash',
    bgGradient: 'from-pink-500 to-rose-600',
    description: 'Cakes, Candles, Balloons, Chocolates, Chips, Soft Drinks, Juices, Ice Cream, Paper Plates, Paper Cups, Gift Packs',
    defaultGuestCount: 10,
    defaultBudget: 2500,
    itemsList: ['Cakes', 'Candles', 'Balloons', 'Chocolates', 'Chips', 'Soft Drinks', 'Juices', 'Ice Cream', 'Paper Plates', 'Paper Cups', 'Gift Packs'],
    recommendedSearchTerms: ['cake', 'snack', 'drink', 'chocolate', 'chips', 'candy', 'ice cream', 'juice'],
  },
  {
    id: 'puja',
    title: 'Puja',
    icon: '🪔',
    badge: 'Traditional & Holy',
    bgGradient: 'from-amber-500 to-orange-600',
    description: 'Agarbatti, Diyas, Cotton Wicks, Ghee, Camphor, Flowers, Coconut, Fruits, Milk, Curd, Honey, Sugar, Dry Fruits, Thali Items',
    defaultGuestCount: 6,
    defaultBudget: 1500,
    itemsList: ['Agarbatti', 'Diyas', 'Cotton Wicks', 'Ghee', 'Camphor', 'Flowers', 'Coconut', 'Fruits', 'Milk', 'Curd', 'Honey', 'Sugar', 'Dry Fruits', 'Thali Items'],
    recommendedSearchTerms: ['ghee', 'sweet', 'fruit', 'dry fruits', 'milk', 'coconut', 'honey', 'sugar'],
  },
  {
    id: 'festive',
    title: 'Festive Celebration',
    icon: '🎊',
    badge: 'Festive Special',
    bgGradient: 'from-red-500 to-amber-600',
    description: 'Sweets, Dry Fruits, Chocolates, Gift Packs, Namkeen, Fruits, Decorative Lights, Candles, Rangoli Colors, Cold Drinks',
    defaultGuestCount: 12,
    defaultBudget: 3000,
    itemsList: ['Sweets', 'Dry Fruits', 'Chocolates', 'Gift Packs', 'Namkeen', 'Fruits', 'Decorative Lights', 'Candles', 'Rangoli Colors', 'Cold Drinks'],
    recommendedSearchTerms: ['sweet', 'dry fruits', 'chocolate', 'namkeen', 'fruit', 'drink'],
  },
  {
    id: 'friday_gathering',
    title: 'Friday Gathering',
    icon: '🕌',
    badge: 'Blessed Reunion',
    bgGradient: 'from-emerald-600 to-teal-700',
    description: 'Dates, Fruits, Juice, Dry Fruits, Milk, Tea, Snacks, Biscuits, Sweets',
    defaultGuestCount: 8,
    defaultBudget: 1800,
    itemsList: ['Dates', 'Fruits', 'Juice', 'Dry Fruits', 'Milk', 'Tea', 'Snacks', 'Biscuits', 'Sweets'],
    recommendedSearchTerms: ['dates', 'fruit', 'juice', 'dry fruits', 'milk', 'tea', 'biscuits', 'sweet'],
  },
  {
    id: 'house_party',
    title: 'House Party',
    icon: '🥳',
    badge: 'Weekend Chill',
    bgGradient: 'from-purple-600 to-indigo-600',
    description: 'Pizza Base, Pasta, Cheese, Frozen Snacks, Chips, Nachos, Dips, Soft Drinks, Juice, Ice Cream, Paper Plates, Glasses',
    defaultGuestCount: 10,
    defaultBudget: 2200,
    itemsList: ['Pizza Base', 'Pasta', 'Cheese', 'Frozen Snacks', 'Chips', 'Nachos', 'Dips', 'Soft Drinks', 'Juice', 'Ice Cream', 'Paper Plates', 'Glasses'],
    recommendedSearchTerms: ['pizza', 'pasta', 'cheese', 'chips', 'nachos', 'drink', 'beverage', 'ice cream'],
  },
  {
    id: 'movie_night',
    title: 'Movie & Game Night',
    icon: '🎬',
    badge: 'Fun Binge',
    bgGradient: 'from-cyan-600 to-blue-600',
    description: 'Popcorn, Chips, Nachos, Dips, Chocolates, Cookies, Soft Drinks, Energy Drinks, Ice Cream, Pizza',
    defaultGuestCount: 5,
    defaultBudget: 1200,
    itemsList: ['Popcorn', 'Chips', 'Nachos', 'Dips', 'Chocolates', 'Cookies', 'Soft Drinks', 'Energy Drinks', 'Ice Cream', 'Pizza'],
    recommendedSearchTerms: ['popcorn', 'chips', 'nachos', 'chocolate', 'cookies', 'drink', 'ice cream', 'pizza'],
  },
  {
    id: 'bbq',
    title: 'Weekend BBQ',
    icon: '🔥',
    badge: 'Grill & Chill',
    bgGradient: 'from-orange-600 to-red-700',
    description: 'Paneer/Chicken, BBQ Sauce, Marinade, Vegetables, Burger Buns, Cheese, Corn, Soft Drinks, Paper Plates',
    defaultGuestCount: 8,
    defaultBudget: 2800,
    itemsList: ['Paneer/Chicken', 'BBQ Sauce', 'Marinade', 'Vegetables', 'Burger Buns', 'Cheese', 'Corn', 'Soft Drinks', 'Paper Plates'],
    recommendedSearchTerms: ['paneer', 'sauce', 'vegetable', 'bun', 'cheese', 'corn', 'drink'],
  },
  {
    id: 'breakfast_bed',
    title: 'Breakfast in Bed',
    icon: '🍳',
    badge: 'Cozy Morning',
    bgGradient: 'from-amber-400 to-yellow-600',
    description: 'Bread, Butter, Jam, Eggs, Milk, Coffee, Tea, Juice, Pancake Mix, Honey, Fruits, Croissants',
    defaultGuestCount: 4,
    defaultBudget: 800,
    itemsList: ['Bread', 'Butter', 'Jam', 'Eggs', 'Milk', 'Coffee', 'Tea', 'Juice', 'Pancake Mix', 'Honey', 'Fruits', 'Croissants'],
    recommendedSearchTerms: ['bread', 'butter', 'jam', 'egg', 'milk', 'coffee', 'tea', 'juice', 'fruit'],
  },
  {
    id: 'anniversary',
    title: 'Marriage Anniversary',
    icon: '💍',
    badge: 'Romantic Dinner',
    bgGradient: 'from-rose-500 to-pink-700',
    description: 'Cake, Chocolates, Premium Juice, Fruits, Cheese, Pasta, Garlic Bread, Dessert, Candles, Gift Hamper',
    defaultGuestCount: 4,
    defaultBudget: 2000,
    itemsList: ['Cake', 'Chocolates', 'Premium Juice', 'Fruits', 'Cheese', 'Pasta', 'Garlic Bread', 'Dessert', 'Candles', 'Gift Hamper'],
    recommendedSearchTerms: ['cake', 'chocolate', 'juice', 'fruit', 'cheese', 'pasta', 'dessert'],
  },
  {
    id: 'monthly_grocery',
    title: 'Monthly Grocery',
    icon: '🛒',
    badge: 'Household Stockup',
    bgGradient: 'from-slate-700 to-emerald-800',
    description: 'Rice, Wheat Flour, Pulses, Cooking Oil, Sugar, Salt, Tea, Coffee, Spices, Vegetables, Soap, Detergent',
    defaultGuestCount: 4,
    defaultBudget: 4000,
    itemsList: ['Rice', 'Wheat Flour', 'Pulses', 'Cooking Oil', 'Sugar', 'Salt', 'Tea', 'Coffee', 'Spices', 'Vegetables', 'Soap', 'Detergent'],
    recommendedSearchTerms: ['rice', 'flour', 'dal', 'oil', 'sugar', 'salt', 'tea', 'spices', 'vegetable', 'fruit'],
  },
];

export const PRESET_DEFAULT_PRODUCTS: Record<
  string,
  { name: string; price: number; unit: string; image: string; defaultQty: number; reason: string }[]
> = {
  birthday: [
    { name: 'Fresh Chocolate Fudge Birthday Cake', price: 450, unit: '500g', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', defaultQty: 1, reason: 'Centerpiece birthday cake' },
    { name: 'Sparkling Birthday Candles (Pack of 12)', price: 49, unit: '1 pack', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80', defaultQty: 1, reason: 'Candles for cake lighting' },
    { name: 'Multicolor Party Balloons (Pack of 20)', price: 89, unit: '1 pack', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=500&q=80', defaultQty: 1, reason: 'Party hall decoration' },
    { name: 'Cadbury Celebrations Chocolate Box', price: 175, unit: '130g', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80', defaultQty: 2, reason: 'Delicious party treats' },
    { name: 'Lays Classic Salted Potato Chips', price: 35, unit: '82g bag', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80', defaultQty: 3, reason: 'Crunchy party munchies' },
    { name: 'Coca-Cola Soft Drink Bottle (1.25L)', price: 65, unit: '1.25L bottle', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', defaultQty: 2, reason: 'Chilled party beverage' },
    { name: 'Real Fruit Power Mixed Fruit Juices', price: 110, unit: '1L pack', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80', defaultQty: 2, reason: 'Fresh fruit juice' },
    { name: 'Amul Vanilla Gold Ice Cream Tub', price: 210, unit: '1L tub', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80', defaultQty: 1, reason: 'Ice cream treat' },
    { name: 'Eco-Friendly Paper Plates (Pack of 25)', price: 60, unit: '25 plates', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80', defaultQty: 1, reason: 'Food serving plates' },
    { name: 'Printed Party Paper Cups (Pack of 20)', price: 40, unit: '20 cups', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80', defaultQty: 1, reason: 'Beverage cups' },
    { name: 'Birthday Return Gift Packs (Set of 5)', price: 299, unit: '5 packs', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&q=80', defaultQty: 1, reason: 'Return party gifts' },
  ],
  puja: [
    { name: 'Cycle Pure Agarbatti Incense Sticks', price: 60, unit: '1 pack', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80', defaultQty: 1, reason: 'Fragrant incense' },
    { name: 'Clay Handcrafted Diyas (Set of 6)', price: 85, unit: '6 pcs', image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=500&q=80', defaultQty: 1, reason: 'Traditional oil lamps' },
    { name: 'Cotton Wicks (Phool Batti)', price: 30, unit: '1 pack', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80', defaultQty: 1, reason: 'Wicks for diya lighting' },
    { name: 'Amul Pure Cow Ghee', price: 325, unit: '500g jar', image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&q=80', defaultQty: 1, reason: 'Pure cow ghee for offerings' },
    { name: 'Bhimseni Pure Camphor (Kapur)', price: 75, unit: '1 box', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80', defaultQty: 1, reason: 'Holy camphor for aarti' },
    { name: 'Fresh Marigold & Rose Flowers', price: 90, unit: '250g pack', image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&q=80', defaultQty: 1, reason: 'Fresh flowers for deity' },
    { name: 'Fresh Sacred Puja Coconut', price: 35, unit: '1 pc', image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=500&q=80', defaultQty: 1, reason: 'Auspicious coconut offering' },
    { name: 'Fresh Fruits Prashad (Apple & Banana)', price: 140, unit: '1 kg', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80', defaultQty: 1, reason: 'Holy prashad offering' },
    { name: 'Amul Taaza Pure Farm Milk', price: 66, unit: '1L pouch', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80', defaultQty: 1, reason: 'Panchamrit preparation' },
    { name: 'Fresh Farm Curd (Dahi)', price: 45, unit: '400g tub', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&q=80', defaultQty: 1, reason: 'Panchamrit curd' },
    { name: 'Dabur 100% Pure Raw Honey', price: 130, unit: '250g jar', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80', defaultQty: 1, reason: 'Holy honey offering' },
    { name: 'Refined White Sugar', price: 48, unit: '1 kg', image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&q=80', defaultQty: 1, reason: 'Sweet prashad offering' },
    { name: 'Royal Premium Dry Fruits Mix', price: 280, unit: '200g pack', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80', defaultQty: 1, reason: 'Almond & cashew prashad' },
    { name: 'Puja Thali Items Essentials Set', price: 199, unit: '1 set', image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=500&q=80', defaultQty: 1, reason: 'Kumkum, akshat, haldi & thread' },
  ],
  festive: [
    { name: 'Haldiram Kaju Katli Sweets', price: 320, unit: '500g box', image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80', defaultQty: 1, reason: 'Festive traditional sweet' },
    { name: 'Royal Festive Dry Fruits Gift Box', price: 499, unit: '400g box', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80', defaultQty: 1, reason: 'Festive dry fruit box' },
    { name: 'Cadbury Celebrations Gift Pack', price: 220, unit: '180g box', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80', defaultQty: 2, reason: 'Chocolate gift pack' },
    { name: 'Haldiram All-in-One Namkeen', price: 95, unit: '350g pack', image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500&q=80', defaultQty: 2, reason: 'Savory festive snack' },
    { name: 'Fresh Pomegranate & Red Apple Fruits', price: 180, unit: '1 kg', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80', defaultQty: 1, reason: 'Festive fresh fruits' },
    { name: 'Decorative LED Lights String', price: 199, unit: '1 set', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&q=80', defaultQty: 1, reason: 'Festive home lighting' },
    { name: 'Scented Festive Wax Candles (4 Pcs)', price: 120, unit: '4 pcs', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80', defaultQty: 1, reason: 'Festive candle lighting' },
    { name: 'Organic Herbal Rangoli Colors', price: 99, unit: '5 shades', image: 'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=500&q=80', defaultQty: 1, reason: 'Rangoli color powder' },
    { name: 'Thums Up Cold Drinks (1.25L)', price: 65, unit: '1.25L bottle', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', defaultQty: 2, reason: 'Refreshing cold drink' },
  ],
  friday_gathering: [
    { name: 'Royal Medjool Dates', price: 180, unit: '250g box', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80', defaultQty: 2, reason: 'Welcome date offering' },
    { name: 'Fresh Seasonal Fruits (Grapes & Apples)', price: 160, unit: '1.5 kg', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80', defaultQty: 1, reason: 'Fresh fruit refreshment' },
    { name: 'Real Mango Fruit Juice', price: 110, unit: '1L pack', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80', defaultQty: 2, reason: 'Fruit juice beverage' },
    { name: 'Premium Roasted Dry Fruits Mix', price: 350, unit: '250g pack', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80', defaultQty: 1, reason: 'Dry fruit snack' },
    { name: 'Amul Taaza Toned Milk', price: 66, unit: '1L pouch', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80', defaultQty: 1, reason: 'Tea preparation milk' },
    { name: 'Taj Mahal Premium Assam Tea', price: 185, unit: '250g pack', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', defaultQty: 1, reason: 'Chai tea for gathering' },
    { name: 'Crispy Samosa & Kachori Snacks', price: 120, unit: '6 pcs', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80', defaultQty: 1, reason: 'Savory tea snack' },
    { name: 'Britannia Marie Gold Biscuits', price: 45, unit: '300g pack', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80', defaultQty: 2, reason: 'Crispy tea biscuits' },
    { name: 'Assorted Gulab Jamun Sweets', price: 250, unit: '400g tin', image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&q=80', defaultQty: 1, reason: 'Traditional sweets' },
  ],
  house_party: [
    { name: 'Gourmet Artisan Pizza Base (Pack of 2)', price: 65, unit: '2 bases', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', defaultQty: 2, reason: 'Party pizza baking' },
    { name: 'Borges Italian Penne Pasta', price: 140, unit: '500g pack', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', defaultQty: 1, reason: 'Cheesy party pasta' },
    { name: 'Amul Processed Cheese Block', price: 135, unit: '200g pack', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80', defaultQty: 2, reason: 'Melting cheese block' },
    { name: 'McCain Crispy Frozen Snacks (Fries/Nuggets)', price: 180, unit: '450g pack', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80', defaultQty: 2, reason: 'Quick frozen snacks' },
    { name: 'Doritos Cheese Corn Chips', price: 50, unit: '150g pack', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80', defaultQty: 3, reason: 'Crunchy party chips' },
    { name: 'Mexitos Cheesy Nachos', price: 65, unit: '150g pack', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80', defaultQty: 2, reason: 'Nacho munchies' },
    { name: 'Veeba Cheesy Salsa Dips', price: 99, unit: '200g jar', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&q=80', defaultQty: 1, reason: 'Dip for nachos & chips' },
    { name: 'Coca-Cola Soft Drinks (1.25L)', price: 65, unit: '1.25L bottle', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', defaultQty: 2, reason: 'Chilled party soda' },
    { name: 'Real Guava Juice', price: 110, unit: '1L pack', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80', defaultQty: 1, reason: 'Fruit juice' },
    { name: 'Amul Chocolate Ice Cream Tub', price: 220, unit: '1L tub', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80', defaultQty: 1, reason: 'Dessert tub' },
    { name: 'Party Disposable Paper Plates', price: 60, unit: '25 plates', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80', defaultQty: 1, reason: 'Party paper plates' },
    { name: 'Disposable Drink Glasses', price: 45, unit: '25 glasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80', defaultQty: 1, reason: 'Disposable glasses' },
  ],
  movie_night: [
    { name: 'Act II Butter Movie Popcorn (Pack of 3)', price: 85, unit: '3 bags', image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80', defaultQty: 1, reason: 'Movie night popcorn' },
    { name: 'Lays Potato Chips Pack', price: 35, unit: '85g bag', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80', defaultQty: 2, reason: 'Movie potato chips' },
    { name: 'Mexitos Mexican Nachos', price: 60, unit: '150g pack', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80', defaultQty: 2, reason: 'Movie binge nachos' },
    { name: 'Creamy Cheese & Jalapeno Dips', price: 89, unit: '150g jar', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&q=80', defaultQty: 1, reason: 'Dips for nachos' },
    { name: 'Cadbury Dairy Milk Silk Chocolates', price: 175, unit: '150g bar', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80', defaultQty: 2, reason: 'Sweet chocolate bar' },
    { name: 'Dark Choco Chip Cookies', price: 65, unit: '150g pack', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80', defaultQty: 1, reason: 'Cookie munchies' },
    { name: 'Pepsi Soft Drinks (1.25L)', price: 65, unit: '1.25L bottle', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', defaultQty: 1, reason: 'Chilled movie soda' },
    { name: 'Red Bull Energy Drinks', price: 125, unit: '250ml can', image: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=500&q=80', defaultQty: 2, reason: 'Late night energy booster' },
    { name: 'Amul Butterscotch Ice Cream', price: 210, unit: '1L tub', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80', defaultQty: 1, reason: 'Ice cream treat' },
    { name: 'Frozen Mini Cheese Pizza', price: 160, unit: '2 pcs', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80', defaultQty: 1, reason: 'Midnight pizza slice' },
  ],
  bbq: [
    { name: 'Fresh Paneer / Chicken Pack', price: 220, unit: '400g pack', image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&q=80', defaultQty: 2, reason: 'BBQ paneer or chicken' },
    { name: 'Smokey BBQ Sauce (Veeba)', price: 115, unit: '300g bottle', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&q=80', defaultQty: 1, reason: 'Smokey BBQ glaze' },
    { name: 'Tandoori Tikka Marinade Mix', price: 60, unit: '100g pack', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80', defaultQty: 1, reason: 'Spicy marinade mix' },
    { name: 'Fresh Bell Peppers & Vegetables', price: 85, unit: '1 kg', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80', defaultQty: 1, reason: 'BBQ veggie skewers' },
    { name: 'Fresh Soft Burger Buns (Pack of 4)', price: 45, unit: '4 buns', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80', defaultQty: 2, reason: 'Grilled burger buns' },
    { name: 'Amul Cheese Slices (Pack of 10)', price: 140, unit: '10 slices', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80', defaultQty: 1, reason: 'Burger cheese slices' },
    { name: 'Fresh Sweet Corn Cobs (Pack of 2)', price: 60, unit: '2 cobs', image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500&q=80', defaultQty: 2, reason: 'Grilled sweet corn' },
    { name: 'Sprite Soft Drinks (1.25L)', price: 65, unit: '1.25L bottle', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80', defaultQty: 2, reason: 'Chilled BBQ drink' },
    { name: 'Eco-Friendly Paper Plates', price: 80, unit: '25 plates', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80', defaultQty: 1, reason: 'BBQ paper plates' },
  ],
  breakfast_bed: [
    { name: 'Freshly Baked White Bread Loaf', price: 45, unit: '400g loaf', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', defaultQty: 1, reason: 'Fresh sandwich bread' },
    { name: 'Amul Salted Butter Block', price: 58, unit: '100g pack', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80', defaultQty: 1, reason: 'Butter spread' },
    { name: 'Kissan Mixed Fruit Jam', price: 75, unit: '200g jar', image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&q=80', defaultQty: 1, reason: 'Fruit jam spread' },
    { name: 'Farm Fresh Eggs (Box of 6)', price: 65, unit: '6 eggs', image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&q=80', defaultQty: 1, reason: 'Morning eggs' },
    { name: 'Amul Taaza Toned Milk', price: 66, unit: '1L pouch', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80', defaultQty: 1, reason: 'Coffee & tea milk' },
    { name: 'Nescafe Classic Instant Coffee', price: 170, unit: '50g jar', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', defaultQty: 1, reason: 'Hot morning coffee' },
    { name: 'Taj Mahal Premium Tea Bags', price: 110, unit: '25 tea bags', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', defaultQty: 1, reason: 'Steeped hot tea' },
    { name: 'Real 100% Orange Juice', price: 120, unit: '1L carton', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80', defaultQty: 1, reason: 'Fresh orange juice' },
    { name: 'Fluffy Pancake Mix Box', price: 145, unit: '300g box', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500&q=80', defaultQty: 1, reason: 'Pancake breakfast' },
    { name: 'Dabur Wildflower Honey', price: 140, unit: '250g jar', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80', defaultQty: 1, reason: 'Pure honey drizzler' },
    { name: 'Fresh Strawberries & Fruits', price: 150, unit: '500g box', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&q=80', defaultQty: 1, reason: 'Fresh fruit toppings' },
    { name: 'French Bakery Butter Croissants', price: 110, unit: '2 pcs', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80', defaultQty: 1, reason: 'Warm bakery croissants' },
  ],
  anniversary: [
    { name: 'Deluxe Red Velvet Heart Cake', price: 550, unit: '500g cake', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80', defaultQty: 1, reason: 'Romantic anniversary cake' },
    { name: 'Ferrero Rocher Chocolates Box', price: 499, unit: '16 pcs box', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&q=80', defaultQty: 1, reason: 'Luxury chocolates' },
    { name: 'Sparkling Premium Juice Bottle', price: 240, unit: '750ml bottle', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&q=80', defaultQty: 1, reason: 'Celebratory toast drink' },
    { name: 'Fresh Exotic Kiwis & Strawberries', price: 220, unit: '500g box', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&q=80', defaultQty: 1, reason: 'Fresh dessert fruits' },
    { name: 'Gourmet Cheese Slices Set', price: 280, unit: '1 set', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&q=80', defaultQty: 1, reason: 'Evening cheese appetizer' },
    { name: 'Italian Spaghetti Pasta & Sauce', price: 195, unit: '1 set', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&q=80', defaultQty: 1, reason: 'Candlelight dinner pasta' },
    { name: 'Freshly Baked Garlic Bread', price: 95, unit: '1 loaf', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', defaultQty: 1, reason: 'Garlic bread side' },
    { name: 'Choco Molten Lava Dessert', price: 140, unit: '2 pcs', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80', defaultQty: 1, reason: 'Warm chocolate lava dessert' },
    { name: 'Romantic Rose Pillar Candles', price: 150, unit: '2 pcs', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80', defaultQty: 1, reason: 'Scented candles' },
    { name: 'Luxury Gourmet Gift Hamper', price: 799, unit: '1 hamper', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500&q=80', defaultQty: 1, reason: 'Special anniversary surprise hamper' },
  ],
  monthly_grocery: [
    { name: 'India Gate Royal Basmati Rice', price: 480, unit: '5 kg bag', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', defaultQty: 1, reason: 'Monthly basmati rice stock' },
    { name: 'Aashirvaad Whole Wheat Atta', price: 260, unit: '5 kg bag', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80', defaultQty: 1, reason: 'Chakki whole wheat flour' },
    { name: 'Toor Dal & Chana Dal Pulses Combo', price: 240, unit: '2 kg combo', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80', defaultQty: 1, reason: 'Essential daily protein lentils' },
    { name: 'Fortune Cooking Oil', price: 145, unit: '1L pouch', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80', defaultQty: 2, reason: 'Daily cooking sunflower oil' },
    { name: 'Pure Refined White Sugar', price: 48, unit: '1 kg bag', image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&q=80', defaultQty: 2, reason: 'Monthly sugar supply' },
    { name: 'Tata Iodized Salt', price: 28, unit: '1 kg bag', image: 'https://images.unsplash.com/photo-1518110168401-f2877ee2c88c?w=500&q=80', defaultQty: 1, reason: 'Kitchen table salt' },
    { name: 'Society Tea Leaves', price: 280, unit: '500g pack', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80', defaultQty: 1, reason: 'Daily tea leaves' },
    { name: 'Nescafe Classic Coffee Jar', price: 310, unit: '100g jar', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80', defaultQty: 1, reason: 'Monthly instant coffee' },
    { name: 'Whole Spices Pack (Turmeric & Chilli)', price: 180, unit: '300g combo', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80', defaultQty: 1, reason: 'Cooking spices' },
    { name: 'Fresh Vegetables Combo (Potato, Onion, Tomato)', price: 120, unit: '3 kg combo', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80', defaultQty: 1, reason: 'Fresh kitchen vegetables' },
    { name: 'Dove Beauty Bathing Soap (Pack of 3)', price: 165, unit: '3 bars', image: 'https://images.unsplash.com/photo-1607006482182-3d89167520e5?w=500&q=80', defaultQty: 1, reason: 'Personal bathing soap' },
    { name: 'Surf Excel Detergent Powder', price: 140, unit: '1 kg pack', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80', defaultQty: 1, reason: 'Laundry detergent powder' },
  ],
};

export const DIETARY_OPTIONS = [
  'Organic',
  'Sugar Free',
  'Gluten Free',
  'Dairy Free',
  'Low Fat',
];

export const BRAND_OPTIONS = [
  'Amul',
  'Britannia',
  'Nandini',
  'Haldiram',
  'Organic India',
  'Cadbury',
  'Aashirvaad',
  'Nestle',
];

export const AIEventsRecommendationModal: React.FC<AIEventsRecommendationModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddMultipleToCart,
  onOpenCart,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('birthday');
  const [guestCount, setGuestCount] = useState<number>(10);
  const [userBudget, setUserBudget] = useState<number>(2500);
  const [dietType] = useState<string>('General');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [customEventText, setCustomEventText] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedItemsMap, setSelectedItemsMap] = useState<
    Record<string, { product: Product; quantity: number; reason?: string }>
  >({});
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isCheaperApplied, setIsCheaperApplied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Auto initial generation
      generateRecommendations('birthday', 10, 2500, 'General', [], []);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPreset = EVENT_PRESETS.find((p) => p.id === selectedEventId) || EVENT_PRESETS[0];

  const generateRecommendations = async (
    eventId: string,
    count: number,
    budgetVal: number,
    diet: string,
    dietaryList: string[],
    brandsList: string[],
    customText?: string
  ) => {
    setIsGenerating(true);
    setIsCheaperApplied(false);

    const preset = EVENT_PRESETS.find((p) => p.id === eventId) || EVENT_PRESETS[0];
    const defaultList = PRESET_DEFAULT_PRODUCTS[eventId] || PRESET_DEFAULT_PRODUCTS['birthday'];
    const scaleFactor = Math.max(1, Math.ceil(count / 8));

    try {
      const res = await fetch('/api/ai/event-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: preset.title,
          guestCount: count,
          budget: budgetVal,
          dietType: diet,
          dietaryPreferences: dietaryList,
          preferredBrands: brandsList,
          customQuery: customText || '',
        }),
      });

      const json = await res.json();

      if (json.success && json.data && Array.isArray(json.data.recommendedItems) && json.data.recommendedItems.length > 0) {
        const data = json.data;
        const itemsMap: Record<string, { product: Product; quantity: number; reason?: string }> = {};

        data.recommendedItems.forEach((rec: any, idx: number) => {
          let matchedProd = products.find((p) => p.id === rec.productId);
          if (!matchedProd) {
            matchedProd = products.find((p) =>
              p.name.toLowerCase().includes(rec.productName?.toLowerCase() || '')
            );
          }
          if (!matchedProd) {
            const fallbackDef = defaultList[idx % defaultList.length];
            matchedProd = {
              id: rec.productId || `prod_${eventId}_${idx}`,
              name: rec.productName || fallbackDef?.name || 'Event Essential',
              category: 'delhi_bites_event',
              categoryName: preset.title,
              price: rec.price || fallbackDef?.price || 120,
              unit: fallbackDef?.unit || '1 pack',
              image: fallbackDef?.image || 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?w=500&q=80',
              rating: 4.9,
              reviewsCount: 140,
              stock: 50,
              dietaryTags: [diet],
              calories: 180,
              description: rec.reason || `Handpicked for ${preset.title}`,
            };
          }

          itemsMap[matchedProd.id] = {
            product: matchedProd,
            quantity: rec.suggestedQuantity || Math.max(1, Math.ceil(count / 5)),
            reason: rec.reason || `Ideal for ${count} guests`,
          };
        });

        setSelectedItemsMap(itemsMap);
        setAiSummary(
          data.summary ||
            `Curated ${Object.keys(itemsMap).length} items tailored for ${count} guests for ${preset.title}.`
        );
      } else {
        throw new Error('Defaulting to preset catalog');
      }
    } catch (err) {
      const itemsMap: Record<string, { product: Product; quantity: number; reason?: string }> = {};

      defaultList.forEach((item, idx) => {
        const prodId = `item_${eventId}_${idx}`;
        let matched = products.find((p) => p.name.toLowerCase().includes(item.name.toLowerCase()));
        if (!matched) {
          matched = {
            id: prodId,
            name: item.name,
            category: 'delhi_bites_event',
            categoryName: preset.title,
            price: item.price,
            unit: item.unit,
            image: item.image,
            rating: 4.9,
            reviewsCount: 120,
            stock: 50,
            dietaryTags: [diet],
            calories: 150,
            description: item.reason,
          };
        }

        const qty = Math.max(1, item.defaultQty * scaleFactor);
        itemsMap[matched.id] = {
          product: matched,
          quantity: qty,
          reason: item.reason,
        };
      });

      setSelectedItemsMap(itemsMap);
      setAiSummary(`Curated ${defaultList.length} items for ${preset.title} (${count} guests).`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (preset: EventPreset) => {
    setSelectedEventId(preset.id);
    setGuestCount(preset.defaultGuestCount);
    setUserBudget(preset.defaultBudget);
    setCustomEventText('');
    generateRecommendations(
      preset.id,
      preset.defaultGuestCount,
      preset.defaultBudget,
      dietType,
      selectedDietary,
      selectedBrands
    );
  };

  const toggleDietary = (item: string) => {
    setSelectedDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleItemSelection = (productId: string) => {
    setSelectedItemsMap((prev) => {
      const next = { ...prev };
      if (next[productId]) {
        delete next[productId];
      } else {
        const prod = products.find((p) => p.id === productId);
        if (prod) next[productId] = { product: prod, quantity: 1 };
      }
      return next;
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedItemsMap((prev) => {
      if (!prev[productId]) return prev;
      const currentQty = prev[productId].quantity;
      const newQty = Math.max(1, currentQty + delta);
      return {
        ...prev,
        [productId]: { ...prev[productId], quantity: newQty },
      };
    });
  };

  const selectedList: { product: Product; quantity: number; reason?: string }[] =
    Object.values(selectedItemsMap);
  const totalAmount = selectedList.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const isOverBudget = totalAmount > userBudget;
  const overAmount = Math.max(0, totalAmount - userBudget);

  // Apply Cheaper Alternatives / Budget Saver
  const handleApplyCheaperAlternatives = () => {
    setSelectedItemsMap((prev) => {
      const updated: Record<string, { product: Product; quantity: number; reason?: string }> = {};
      Object.entries(prev).forEach(([key, val]) => {
        const itemVal = val as { product: Product; quantity: number; reason?: string };
        const newQty = Math.max(1, Math.floor(itemVal.quantity * 0.7));
        updated[key] = {
          ...itemVal,
          quantity: newQty,
          reason: 'Optimized quantity to fit budget',
        };
      });
      return updated;
    });
    setIsCheaperApplied(true);
  };

  const handleAddAllToBasket = () => {
    if (selectedList.length === 0) return;
    onAddMultipleToCart(selectedList.map((i) => ({ product: i.product, quantity: i.quantity })));
    onClose();
    onOpenCart();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex items-center justify-center min-h-screen"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200 my-auto max-h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
              <PartyPopper className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-pink-100 text-pink-800 text-[10px] font-mono font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  🎉 AI Personal Event Assistant
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                AI Event & Celebration Grocery Assistant
              </h3>
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

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5 my-3.5">
          {/* Section 1: Event Categories Grid (10 Categories) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <PartyPopper className="w-4 h-4 text-pink-600" /> 1. Select Event / Occasion (10 Categories):
              </label>
              <span className="text-[11px] text-slate-500 font-bold">
                Selected: <strong className="text-pink-600">{currentPreset.title}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {EVENT_PRESETS.map((p) => {
                const isSelected = p.id === selectedEventId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? `bg-gradient-to-br ${p.bgGradient} text-white border-transparent shadow-md ring-2 ring-pink-500/30 scale-[1.02]`
                        : `bg-slate-50 hover:bg-slate-100/90 text-slate-800 border-slate-200/80`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xl">{p.icon}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold leading-tight">{p.title}</h4>
                      <p
                        className={`text-[9px] font-medium mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-white/80' : 'text-slate-500'
                        }`}
                      >
                        {p.itemsList.slice(0, 3).join(', ')}...
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Included Event Shopping Items Banner */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center gap-1.5">
              <span className="font-extrabold text-slate-700 shrink-0">Included Checklist:</span>
              {(currentPreset.itemsList || []).map((item, idx) => (
                <span
                  key={idx}
                  className="bg-white border border-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-2xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Section 2: AI Personalization Questionnaire Panel */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" /> 2. Personalize Event Parameters:
              </h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">
                Smart Quantity & Budget Calculator
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Guests Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-600" /> Number of Guests:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value) || 1)}
                    className="w-20 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900 text-center"
                  />
                  <div className="flex gap-1 flex-1">
                    {[5, 10, 20, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGuestCount(num)}
                        className={`flex-1 py-1 text-[11px] font-extrabold rounded-lg border transition-all ${
                          guestCount === num
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget INR */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Target Budget (₹):
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-500">₹</span>
                  <input
                    type="number"
                    step={100}
                    value={userBudget}
                    onChange={(e) => setUserBudget(Number(e.target.value) || 500)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-black text-slate-900"
                  />
                  <div className="flex gap-1">
                    {[1000, 2500, 5000].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setUserBudget(b)}
                        className={`px-2 py-1 text-[10px] font-extrabold rounded-lg border transition-all ${
                          userBudget === b
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        ₹{b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dietary Restrictions & Preferred Brands */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
              {/* Dietary Preferences */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Dietary Preferences:</label>
                <div className="flex flex-wrap gap-1">
                  {DIETARY_OPTIONS.map((item) => {
                    const isChecked = selectedDietary.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleDietary(item)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all ${
                          isChecked
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked && '✓ '}
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Brands */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Preferred Brands:</label>
                <div className="flex flex-wrap gap-1">
                  {BRAND_OPTIONS.map((brand) => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked && '✓ '}
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Custom Special Requirements Bar */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customEventText}
                onChange={(e) => setCustomEventText(e.target.value)}
                placeholder="Custom notes (e.g. Sugar-free cake, extra ice cubes, eco-friendly paper plates)..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-pink-500"
              />
              <button
                type="button"
                onClick={() =>
                  generateRecommendations(
                    selectedEventId,
                    guestCount,
                    userBudget,
                    dietType,
                    selectedDietary,
                    selectedBrands,
                    customEventText
                  )
                }
                disabled={isGenerating}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Recalculate AI Basket
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: AI Recommendations & Budget Evaluation */}
          <div className="space-y-3">
            {/* AI Summary Banner & Budget Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-2xl shadow-md">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-white">
                    AI Event Shopping Basket ({selectedList.length} items)
                  </h4>
                  <p className="text-[11px] text-slate-300 font-medium">{aiSummary}</p>
                </div>
              </div>

              {/* Budget Badge */}
              <div className="flex items-center gap-2">
                {isOverBudget ? (
                  <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 text-rose-200 px-3 py-1 rounded-xl text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Over Budget by ₹{overAmount}</span>
                    {!isCheaperApplied && (
                      <button
                        type="button"
                        onClick={handleApplyCheaperAlternatives}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1"
                      >
                        <TrendingDown className="w-3 h-3" /> Apply Budget Saver
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-xl text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Within Budget (Saved ₹{userBudget - totalAmount})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Products Cards Grid */}
            {isGenerating ? (
              <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
                <RefreshCw className="w-8 h-8 text-pink-600 animate-spin mx-auto" />
                <p className="text-xs font-black text-slate-700">
                  Gemini AI is crafting personalized event grocery items for {guestCount} guests...
                </p>
              </div>
            ) : selectedList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl">
                No items selected. Click a preset above to load recommended items!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {selectedList.map((item) => {
                  const prod = item.product;
                  const isChecked = Boolean(selectedItemsMap[prod.id]);

                  return (
                    <div
                      key={prod.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between bg-white relative ${
                        isChecked
                          ? 'border-pink-300 shadow-2xs'
                          : 'border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 mb-2">
                        <button
                          type="button"
                          onClick={() => toggleItemSelection(prod.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                            isChecked
                              ? 'bg-pink-600 border-pink-600 text-white'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />

                        <div className="flex-1 truncate">
                          <h5 className="text-xs font-black text-slate-900 truncate">
                            {prod.name}
                          </h5>
                          <p className="text-[10px] text-slate-500 font-bold">
                            ₹{prod.price} <span className="font-normal">/ {prod.unit}</span>
                          </p>
                          <p className="text-[9px] text-emerald-700 font-medium line-clamp-1 mt-0.5">
                            {item.reason || `Essential for ${guestCount} guests`}
                          </p>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      {isChecked && (
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-bold">
                            Subtotal: ₹{prod.price * item.quantity}
                          </span>
                          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => updateQuantity(prod.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white text-slate-800 font-black text-xs flex items-center justify-center hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="text-xs font-black px-1 min-w-[16px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(prod.id, 1)}
                              className="w-6 h-6 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center hover:bg-pink-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Sticky Bar */}
        <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Event Basket Total ({selectedList.length} items):
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  ₹{totalAmount}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  (Target: ₹{userBudget})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddAllToBasket}
              disabled={selectedList.length === 0}
              className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-pink-600/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <ShoppingBag className="w-4.5 h-4.5" /> 1-Click Add Event Basket to Cart →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
