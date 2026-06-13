'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FlaskConical } from 'lucide-react';
import { IngredientCard } from '@/components/ingredient-card';
import { IngredientDetail } from '@/components/ingredient-detail';
import { ConflictAlert } from '@/components/conflict-alert';
import { ingredients, conflictRules } from '@/lib/mock-data';
import type { Ingredient } from '@/lib/mock-data';

export default function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [activeConflicts] = useState(conflictRules);

  const categories = useMemo(() => {
    const cats = new Set(ingredients.map((i) => i.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch =
        ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.nameCn.includes(searchQuery);
      const matchesCategory =
        selectedCategory === 'all' || ing.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="container-app py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
          <FlaskConical className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">成分分析</h1>
        <p className="text-muted max-w-md mx-auto">
          查询护肤品成分的安全性和功效，做出更明智的护肤选择
        </p>
      </motion.div>

      {/* Conflict Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-8 space-y-3"
      >
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          常见成分冲突提醒
        </h3>
        {activeConflicts.map((rule, i) => (
          <ConflictAlert key={i} {...rule} />
        ))}
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto mb-8"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="搜索成分名称（支持中英文）..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base pl-10 pr-4"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface text-muted border border-border hover:border-border-hover hover:text-white'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results Count */}
      <div className="max-w-5xl mx-auto mb-4">
        <p className="text-sm text-muted">
          找到 <span className="text-white font-medium">{filteredIngredients.length}</span> 个成分
        </p>
      </div>

      {/* Ingredient Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {filteredIngredients.map((ingredient, index) => (
          <div key={ingredient.id} onClick={() => setSelectedIngredient(ingredient)}>
            <IngredientCard ingredient={ingredient} index={index} />
          </div>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted">没有找到匹配的成分，试试其他关键词</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedIngredient && (
        <IngredientDetail
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
        />
      )}
    </div>
  );
}
