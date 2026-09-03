import React from 'react';
import { Category, CategoryId } from '../types';
import { Apple, Milk, Croissant, Coffee, Wheat, Cookie, Fish, Leaf, Sparkles } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Apple':
      return <Apple className="w-4 h-4" />;
    case 'Milk':
      return <Milk className="w-4 h-4" />;
    case 'Bread':
    case 'Croissant':
      return <Croissant className="w-4 h-4" />;
    case 'Coffee':
      return <Coffee className="w-4 h-4" />;
    case 'Wheat':
      return <Wheat className="w-4 h-4" />;
    case 'Cookie':
      return <Cookie className="w-4 h-4" />;
    case 'Fish':
      return <Fish className="w-4 h-4" />;
    case 'Leaf':
      return <Leaf className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Explore Grocery Aisles
        </h2>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs text-emerald-700 font-bold hover:underline"
        >
          View All Items
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {/* All Products Pill */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>All Items</span>
        </button>

        {/* Categories */}
        {(categories || []).map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-emerald-600'}>
                {getCategoryIcon(cat.iconName)}
              </span>
              <span>{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cat.itemCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
