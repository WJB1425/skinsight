'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, Plus, ScanLine, Package, LogIn, Cloud, HardDrive } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useShelf } from '@/lib/shelf';
import { analyzeShelf, type RoutineProduct } from '@/lib/routine';
import { AddProductModal } from '@/components/shelf/add-product-modal';
import { ShelfCard } from '@/components/shelf/shelf-card';
import { ShelfAnalysisView } from '@/components/shelf/shelf-analysis';
import { RoutinePanel } from '@/components/shelf/routine-panel';
import { IngredientDetail } from '@/components/ingredient-detail';
import { MedicalDisclaimer } from '@/components/medical-disclaimer';
import type { Ingredient } from '@/lib/mock-data';

export default function ShelfPage() {
  const { user, configured } = useAuth();
  const { items, loading, persisted, addItem, removeItem } = useShelf();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const month = new Date().getMonth();

  const products: RoutineProduct[] = useMemo(
    () =>
      items.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        ingredientIds: i.ingredientIds,
      })),
    [items],
  );
  const analysis = useMemo(() => analyzeShelf(products), [products]);

  return (
    <div className="container-app py-8 sm:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-wrap items-center gap-3.5"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-primary/[0.12] ring-1 ring-inset ring-border">
          <Layers className="h-[22px] w-[22px] text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">我的护肤台</h1>
          <p className="mt-0.5 text-sm text-muted">
            把正在用的产品加进来，看成分功效、配伍冲突，按季节给出用法建议
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          添加产品
        </button>
      </motion.div>

      {/* 存储状态横幅 */}
      {persisted ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-700">
          <Cloud className="h-3.5 w-3.5 shrink-0" />
          已登录（{user?.email}），产品库云端保存、多设备同步。
        </div>
      ) : (
        <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
          <HardDrive className="h-3.5 w-3.5 shrink-0" />
          {configured ? (
            <>
              当前为本机暂存（未登录）。
              <Link href="/login" className="inline-flex items-center gap-1 font-semibold underline">
                <LogIn className="h-3 w-3" />
                登录后保存到账号
              </Link>
            </>
          ) : (
            <>本机试用模式：账号系统尚未接入，数据仅存当前浏览器（配置见 .env.example）。</>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        /* 空态 */
        <div className="rounded-3xl border border-dashed border-border px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-hover">
            <Layers className="h-6 w-6 text-muted" />
          </div>
          <h2 className="text-base font-semibold text-foreground">还没有添加产品</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">
            两种方式把你在用的产品加进来，我们帮你读懂成分、分析搭配。
          </p>
          <div className="mx-auto mt-5 grid max-w-md gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-4 text-left">
              <ScanLine className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">拍 / 贴成分表</p>
              <p className="mt-0.5 text-xs text-muted">直接从成分表读取成分功效</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 text-left">
              <Package className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">拍包装 / 选产品</p>
              <p className="mt-0.5 text-xs text-muted">从产品库反查它含哪些成分</p>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary mx-auto mt-5">
            <Plus className="h-4 w-4" />
            添加第一个产品
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 产品库 */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              我在用的产品 <span className="text-muted">({items.length})</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <ShelfCard
                  key={item.id}
                  item={item}
                  index={i}
                  onRemove={removeItem}
                  onIngredientClick={setSelected}
                />
              ))}
            </div>
          </section>

          {/* 分析 + 用法建议 */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ShelfAnalysisView analysis={analysis} itemCount={items.length} />
            <RoutinePanel products={products} month={month} />
          </div>

          <MedicalDisclaimer />
        </div>
      )}

      {modalOpen && <AddProductModal onAdd={addItem} onClose={() => setModalOpen(false)} />}
      {selected && <IngredientDetail ingredient={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
