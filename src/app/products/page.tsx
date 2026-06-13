'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Filter } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { mockProducts, mockSkinResults } from '@/lib/mock-data';
import type { Product } from '@/lib/mock-data';

const categories = ['全部', '精华', '面霜', '洁面', '防晒'];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [showRecommendations, setShowRecommendations] = useState(false);

  const filteredProducts = useMemo(() => {
    let products = mockProducts;
    if (selectedCategory !== '全部') {
      products = products.filter((p) => p.category === selectedCategory);
    }
    return products;
  }, [selectedCategory]);

  const recommendedProducts = useMemo(() => {
    if (!showRecommendations) return [];
    const skinType = mockSkinResults.skinType;
    return mockProducts.filter((p) => p.skinTypes.includes(skinType));
  }, [showRecommendations]);

  return (
    <div className="container-app py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 mb-4">
          <ShoppingCart className="w-6 h-6 text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">产品推荐</h1>
        <p className="text-muted max-w-md mx-auto">
          基于你的肤质和需求，精选最适合的护肤产品
        </p>
      </motion.div>

      {/* Skin Type Match Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-8"
      >
        <div
          className="card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 cursor-pointer"
          onClick={() => setShowRecommendations(!showRecommendations)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {showRecommendations ? '隐藏推荐' : '查看个性化推荐'}
                </h3>
                <p className="text-xs text-muted">
                  基于你的肤质：{mockSkinResults.skinTypeCn}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showRecommendations ? 180 : 0 }}
              className="text-muted"
            >
              ▼
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Recommended Products */}
      {showRecommendations && recommendedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-5xl mx-auto mb-10"
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            为你推荐
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-5xl mx-auto mb-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
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
              {cat}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted">
            {filteredProducts.length} 个产品
          </span>
        </div>
      </motion.div>

      {/* All Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {filteredProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted">该分类下暂无产品</p>
        </div>
      )}
    </div>
  );
}
