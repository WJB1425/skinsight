'use client';

import { motion } from 'framer-motion';
import { Star, Droplets } from 'lucide-react';
import type { Product } from '@/lib/mock-data';
import { getBrandById } from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const brand = getBrandById(product.brandId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="card group cursor-pointer overflow-hidden"
    >
      {/* Product Image Placeholder */}
      <div className="relative aspect-square bg-surface-hover rounded-lg mb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <Droplets className="w-10 h-10 text-muted/30" />
        </div>
        <div className="absolute top-2 left-2">
          <span className="badge bg-surface-hover/80 text-white/90 border border-white/10 backdrop-blur-sm text-[10px]">
            {brand?.nameCn || product.brandId}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="badge bg-white/10 text-white border border-white/10 backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
            {product.nameCn}
          </h3>
          <p className="text-xs text-muted">{product.name}</p>
        </div>
        <div className="flex items-center gap-1 text-amber-400 flex-shrink-0">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span className="text-xs font-medium">{product.rating}</span>
        </div>
      </div>

      <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
        {product.description}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-white">
          ¥{product.price}
        </span>
        <div className="flex gap-1">
          {product.keyIngredients.slice(0, 2).map((ing, i) => (
            <span
              key={i}
              className="badge bg-surface-hover text-muted text-[10px]"
            >
              {ing}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
