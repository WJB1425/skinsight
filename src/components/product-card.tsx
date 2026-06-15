'use client';

import { motion } from 'framer-motion';
import { Image as ImageIcon, ShieldCheck, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/mock-data';
import {
  getBrandById,
  getIngredientById,
  getPriceCompare,
  getProductMatches,
} from '@/lib/mock-data';

interface ProductCardProps {
  product: Product;
  /** 当前肤质所需成分（ID）；命中的会被高亮为推荐依据。 */
  recommendedIngredientIds?: string[];
  index?: number;
}

// Per-category color tag — distinct from the brand's white pill.
const CAT_STYLE: Record<string, string> = {
  精华: 'bg-sky-500/10 text-sky-700 border-sky-500/25',
  乳液: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25',
  面霜: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
};
const CAT_DEFAULT = 'bg-violet-500/10 text-violet-700 border-violet-500/25';

const nameOf = (id: string) => getIngredientById(id)?.nameCn ?? id;

export function ProductCard({
  product,
  recommendedIngredientIds = [],
  index = 0,
}: ProductCardProps) {
  const brand = getBrandById(product.brandId);
  const prices = getPriceCompare(product);
  const matchIds = getProductMatches(product, recommendedIngredientIds);
  const matchNames = matchIds.map(nameOf);
  const allNames = product.keyIngredients.map(nameOf);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all duration-300 hover:border-border-hover hover:shadow-card-hover"
    >
      {/* Official-screenshot slot (drop the brand's own product shot here later) */}
      <div className="relative flex h-[78px] items-center justify-center gap-1.5 border-b border-border bg-surface-hover text-muted-dark">
        <ImageIcon className="h-[15px] w-[15px]" />
        <span className="font-mono text-[11px]">官网截图</span>

        <span className="glass absolute left-2 top-2 rounded-full border border-border px-2 py-[3px] text-[10px] font-semibold text-foreground shadow-soft">
          {brand?.nameCn || product.brandId}
        </span>

        {product.ad ? (
          <span className="absolute right-2 top-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-[3px] text-[10px] font-bold tracking-wide text-amber-700">
            AD
          </span>
        ) : (
          <span className="glass absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-border px-2 py-[3px] text-[10px] font-medium text-muted shadow-soft">
            <ShieldCheck className="h-2.5 w-2.5" />
            无广告
          </span>
        )}

        <span
          className={cn(
            'absolute bottom-2 left-2 rounded-md border px-2 py-0.5 text-[10px] font-semibold',
            CAT_STYLE[product.category] ?? CAT_DEFAULT,
          )}
        >
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {product.nameCn}
        </h3>
        <p className="truncate text-[11px] text-muted">{product.name}</p>

        {/* Why it's recommended — the visible criterion */}
        <div className="mt-2.5">
          {matchNames.length > 0 ? (
            <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-[3px] text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />含 {matchNames.join(' · ')}
            </span>
          ) : (
            <span className="block max-w-full truncate text-xs text-muted-dark">
              含 {allNames.join(' · ')}
            </span>
          )}
        </div>

        {/* Live price compare (示例数据) */}
        <div className="mt-auto pt-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10.5px] font-medium text-muted">实时比价</span>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-[10px] border border-border">
            {prices.map((pf, i) => (
              <div
                key={pf.key}
                className={cn(
                  'px-1 py-1.5 text-center',
                  i > 0 && 'border-l border-border',
                  pf.isLowest && 'bg-primary/[0.06]',
                )}
              >
                <div className="mb-0.5 flex items-center justify-center gap-0.5 text-[10px] text-muted">
                  <span className="h-[5px] w-[5px] rounded-full" style={{ background: pf.dot }} />
                  {pf.label}
                </div>
                <div
                  className={cn(
                    'text-[13px] font-bold',
                    pf.isLowest ? 'text-primary' : 'text-foreground',
                  )}
                >
                  ¥{pf.price}
                </div>
                <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[9.5px] text-muted">
                  {pf.rating != null ? (
                    <>
                      <Star className="h-[9px] w-[9px] text-amber-500" />
                      <span className="font-semibold text-foreground">{pf.rating}</span>
                    </>
                  ) : (
                    <span className="text-muted-dark">正品</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
