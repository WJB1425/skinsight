'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Filter, Sparkles, Info } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import {
  products,
  brands,
  mockSkinResults,
  getProductMatches,
  getIngredientById,
} from '@/lib/mock-data';

export default function ProductsPage() {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSkinType, setSelectedSkinType] =
    useState<keyof typeof mockSkinResults>('combination');

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats)];
  }, []);

  const skinResult = mockSkinResults[selectedSkinType];
  const recIds = skinResult.recommendedIngredients;
  const recNames = recIds.map((id) => getIngredientById(id)?.nameCn ?? id);

  // Filter, then rank by how many of the skin type's needed ingredients each
  // product contains — recommendations are always visible via the ordering,
  // never hidden behind a toggle.
  const sortedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesBrand = selectedBrand === 'all' || p.brandId === selectedBrand;
        const matchesCategory =
          selectedCategory === 'all' || p.category === selectedCategory;
        return matchesBrand && matchesCategory;
      })
      .sort(
        (a, b) =>
          getProductMatches(b, recIds).length - getProductMatches(a, recIds).length,
      );
  }, [selectedBrand, selectedCategory, recIds]);

  return (
    <div className="container-app py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 shadow-soft ring-1 ring-inset ring-border">
          <ShoppingCart className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight sm:text-4xl">产品推荐</h1>
        <p className="mx-auto max-w-md text-muted">
          按你的肤质所需成分匹配，并实时比价
        </p>
      </motion.div>

      {/* Skin-type selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-auto mb-4 flex max-w-5xl flex-wrap items-center gap-2"
      >
        <span className="shrink-0 text-xs text-muted">你的肤质：</span>
        {Object.entries(mockSkinResults).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelectedSkinType(key as keyof typeof mockSkinResults)}
            className={`chip ${selectedSkinType === key ? 'chip-active' : 'chip-idle'}`}
          >
            {value.skinTypeCn}
          </button>
        ))}
      </motion.div>

      {/* Recommendation criterion — clear at a glance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto mb-6 flex max-w-5xl flex-wrap items-center gap-3.5 rounded-3xl border border-primary/[0.18] bg-gradient-to-r from-primary/[0.06] to-accent/[0.06] px-[18px] py-3.5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-primary/20 to-accent/20">
          <Sparkles className="h-[19px] w-[19px] text-primary" />
        </div>
        <div className="min-w-[260px] flex-1">
          <div className="text-[13px] font-semibold text-foreground">
            推荐依据 · 按肤质成分匹配
          </div>
          <div className="mt-0.5 text-[12.5px] leading-snug text-muted">
            你的肤质「<span className="font-medium text-foreground">{skinResult.skinTypeCn}</span>
            」需重点补充下列成分；按成分匹配排序、
            <span className="font-medium text-foreground">非付费广告</span>，赞助内容会标注 AD
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {recNames.map((n) => (
            <span key={n} className="badge border border-primary/20 bg-primary/10 text-primary">
              {n}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-auto mb-6 max-w-5xl space-y-4"
      >
        {/* Brand Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 shrink-0 text-muted" />
          <span className="shrink-0 text-xs text-muted">品牌：</span>
          <button
            onClick={() => setSelectedBrand('all')}
            className={`chip whitespace-nowrap ${selectedBrand === 'all' ? 'chip-active' : 'chip-idle'}`}
          >
            全部
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrand(brand.id)}
              className={`chip whitespace-nowrap ${selectedBrand === brand.id ? 'chip-active' : 'chip-idle'}`}
            >
              {brand.nameCn}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 text-xs text-muted">分类：</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`chip ${selectedCategory === cat ? 'chip-active' : 'chip-idle'}`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted">{sortedProducts.length} 个产品</span>
        </div>
      </motion.div>

      {/* Products Grid — ranked by ingredient match */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            recommendedIngredientIds={recIds}
            index={index}
          />
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted">该筛选条件下暂无产品</p>
        </div>
      )}

      <p className="mx-auto mt-6 flex max-w-5xl items-center justify-center gap-1.5 text-center text-[11px] leading-snug text-muted-dark">
        <Info className="h-3 w-3 shrink-0" />
        <span>
          价格与评分为示例数据（接入电商 API 后实时更新）；排序按成分匹配、非付费广告，赞助内容标注
          AD；商品图请使用品牌官网截图。
        </span>
      </p>
    </div>
  );
}
