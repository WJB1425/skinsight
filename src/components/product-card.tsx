'use client';

import { motion } from 'framer-motion';
import { FlaskConical, Droplets } from 'lucide-react';
import type { Product } from '@/lib/mock-data';
import { getBrandById, getIngredientById } from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const brand = getBrandById(product.brandId);
  // A real, checkable signal instead of a fabricated star rating: how many of
  // this product's key ingredients we actually have analyzed in the database.
  const analyzedCount = product.keyIngredients.filter((id) => getIngredientById(id)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="card group cursor-pointer overflow-hidden"
    >
      {/* Product Image Placeholder */}
      <div className="relative aspect-square bg-surface-hover rounded-xl mb-4 overflow-hidden ring-1 ring-inset ring-border">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100/70 via-indigo-50/60 to-violet-100/60 flex items-center justify-center">
          <Droplets className="w-10 h-10 text-primary/30" />
        </div>
        <div className="absolute top-2 left-2">
          <span className="badge bg-white/80 text-foreground border border-border backdrop-blur-md text-[10px] shadow-soft">
            {brand?.nameCn || product.brandId}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="badge bg-white/80 text-foreground border border-border backdrop-blur-md shadow-soft">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {product.nameCn}
          </h3>
          <p className="text-xs text-muted">{product.name}</p>
        </div>
        <div
          className="flex items-center gap-1 text-muted flex-shrink-0"
          title="该产品已收录分析的核心成分数量"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{analyzedCount} 种成分</span>
        </div>
      </div>

      <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
        {product.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">
          ¥{product.price}
        </span>
        <div className="flex gap-1">
          {product.keyIngredients.slice(0, 2).map((ing, i) => (
            <span
              key={i}
              className="badge bg-surface-hover text-muted text-[10px] border border-border"
            >
              {ing}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
