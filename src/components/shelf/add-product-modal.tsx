'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ScanLine,
  Package,
  Search,
  Sparkles,
  Info,
  Check,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageUpload } from '@/components/image-upload';
import { parseIngredientText } from '@/lib/ingredient-match';
import { products, getBrandById, getIngredientById } from '@/lib/mock-data';
import type { NewShelfItem } from '@/lib/shelf';

interface AddProductModalProps {
  onAdd: (item: NewShelfItem) => Promise<void> | void;
  onClose: () => void;
}

type Tab = 'scan' | 'product';

const SAMPLE_INCI =
  '水、甘油、烟酰胺、透明质酸钠、角鲨烷、泛醇、神经酰胺NP、生育酚乙酸酯、苯氧乙醇、香精';

const nameOf = (id: string) => getIngredientById(id)?.nameCn ?? id;

export function AddProductModal({ onAdd, onClose }: AddProductModalProps) {
  const [tab, setTab] = useState<Tab>('scan');

  // —— 拍成分表 ——
  const [text, setText] = useState('');
  const [thumbnail, setThumbnail] = useState<string | undefined>();
  const [scanName, setScanName] = useState('');
  const parsed = useMemo(() => (text.trim() ? parseIngredientText(text) : null), [text]);

  // —— 选产品 ——
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const brand = getBrandById(p.brandId);
      return (
        p.nameCn.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (brand?.nameCn ?? '').toLowerCase().includes(q) ||
        (brand?.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [query]);
  const pickedProduct = picked ? products.find((p) => p.id === picked) : null;

  const [submitting, setSubmitting] = useState(false);

  // —— AI 按名查（参考）——
  const [aiName, setAiName] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState(false);

  async function runAiLookup() {
    const name = aiName.trim();
    if (!name) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await fetch('/api/lookup-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!data.configured) {
        setAiError('AI 按名查暂未接入（需配置 LLM_API_KEY）。可改用「拍 / 贴成分表」手动录入。');
        return;
      }
      if (!data.found || !data.ingredientsText) {
        setAiError(data.note || 'AI 没把握识别这个产品，建议改用「拍 / 贴成分表」手动录入。');
        return;
      }
      // 把 AI 结果灌入「拍成分表」流程，供核对 / 编辑后再添加
      setText(data.ingredientsText);
      setScanName(data.product || name);
      setAiNote(true);
      setTab('scan');
    } catch {
      setAiError('查询出错，请稍后重试。');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAddScan() {
    if (!parsed || parsed.matched.length === 0) return;
    setSubmitting(true);
    await onAdd({
      source: 'scan',
      name: scanName.trim() || '识别的产品',
      ingredientIds: parsed.matched.map((m) => m.id),
      thumbnail,
    });
    onClose();
  }

  async function handleAddProduct() {
    if (!pickedProduct) return;
    setSubmitting(true);
    const brand = getBrandById(pickedProduct.brandId);
    await onAdd({
      source: 'product',
      productId: pickedProduct.id,
      name: pickedProduct.nameCn,
      brandCn: brand?.nameCn,
      category: pickedProduct.category,
      ingredientIds: pickedProduct.keyIngredients,
    });
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card-hover"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="text-lg font-bold text-foreground">添加我在用的产品</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-surface-hover"
            >
              <X className="h-4 w-4 text-muted" />
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 border-b border-border bg-surface px-5 pt-4">
            {([
              { id: 'scan', label: '拍 / 贴成分表', Icon: ScanLine },
              { id: 'product', label: '拍包装 / 选产品', Icon: Package },
            ] as const).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-t-lg border-b-2 pb-2.5 pt-1 text-sm font-medium transition-colors',
                  tab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4 overflow-y-auto p-5">
            {/* 演示诚实横幅 */}
            <div className="flex items-start gap-2 rounded-xl border border-sky-200/80 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-800">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>
                图像识别为<strong>演示功能</strong>：接入视觉模型后可自动读取照片。当前请
                {tab === 'scan' ? '粘贴/核对成分表文字（识别结果可编辑）' : '从产品库选择产品'}
                ——这部分是真实可用的。
              </span>
            </div>

            {tab === 'scan' ? (
              <>
                <ImageUpload onImageSelect={(_f, preview) => setThumbnail(preview)} />

                {aiNote && (
                  <div className="flex items-start gap-2 rounded-xl border border-violet-200/80 bg-violet-50 px-3.5 py-2.5 text-xs text-violet-800">
                    <Sparkles className="mt-px h-3.5 w-3.5 shrink-0" />
                    <span>
                      以下成分由 <strong>AI 按名整理</strong>，仅供参考——请核对 / 编辑后再添加，以实物成分表为准。
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">成分表文字</label>
                    <button
                      type="button"
                      onClick={() => setText(SAMPLE_INCI)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      填入示例
                    </button>
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder="粘贴或输入成分表，用顿号 / 逗号 / 换行分隔，例如：水、甘油、烟酰胺…"
                    className="input-base resize-none"
                  />
                </div>

                {parsed && (
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1.5 text-xs font-semibold text-foreground">
                        已识别 {parsed.matched.length} 种成分
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsed.matched.map((ing) => (
                          <span
                            key={ing.id}
                            className="badge border border-primary/20 bg-primary/10 text-primary"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            {ing.nameCn}
                            {ing.functions[0] && (
                              <span className="ml-1 text-primary/60">· {ing.functions[0]}</span>
                            )}
                          </span>
                        ))}
                        {parsed.matched.length === 0 && (
                          <span className="text-xs leading-relaxed text-muted">
                            未识别到我们收录的<strong>功效成分</strong>。目前成分库以功效 / 活性成分为主（如烟酰胺、视黄醇、透明质酸等），
                            洁面、卸妆等以水、表活、基础油脂为主的产品可能识别较少——这通常不代表成分表有问题。
                          </span>
                        )}
                      </div>
                    </div>
                    {parsed.unmatched.length > 0 && (
                      <div>
                        <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-dark">
                          <HelpCircle className="h-3 w-3" />
                          未收录 {parsed.unmatched.length} 项（不影响添加）
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {parsed.unmatched.map((t, i) => (
                            <span
                              key={i}
                              className="badge border border-border bg-surface-hover text-muted-dark"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <input
                  type="text"
                  value={scanName}
                  onChange={(e) => setScanName(e.target.value)}
                  placeholder="产品名称（可选，例如：某某舒缓精华）"
                  className="input-base"
                />

                <button
                  onClick={handleAddScan}
                  disabled={!parsed || parsed.matched.length === 0 || submitting}
                  className="btn-primary w-full"
                >
                  <Sparkles className="h-4 w-4" />
                  加入我的护肤台
                </button>
                {(!parsed || parsed.matched.length === 0) && (
                  <p className="text-center text-xs leading-relaxed text-muted-dark">
                    在上方「成分表文字」里粘贴或识别到成分后才能添加；
                    「产品名称」只是备注，不参与识别。
                  </p>
                )}
              </>
            ) : (
              <>
                <ImageUpload onImageSelect={() => undefined} />

                {/* AI 按名识别：任意产品（含我们产品库没有的，如神仙水） */}
                <div className="rounded-xl border border-violet-200/70 bg-violet-50/50 p-3.5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI 按名识别（任意产品 · 参考）
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') runAiLookup();
                      }}
                      placeholder="输入产品名，如：SK-II 神仙水"
                      className="input-base flex-1"
                    />
                    <button
                      onClick={runAiLookup}
                      disabled={!aiName.trim() || aiLoading}
                      className="btn-secondary shrink-0"
                    >
                      {aiLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted/40 border-t-foreground" />
                      ) : (
                        '查成分'
                      )}
                    </button>
                  </div>
                  {aiError && <p className="mt-2 text-xs text-red-600">{aiError}</p>}
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-dark">
                    用 AI 按产品名整理成分，结果可能不准、请以实物成分表为准；查到后会带你去「拍 / 贴成分表」核对再添加。
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="shrink-0 text-[11px] text-muted-dark">或从产品库选择</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPicked(null);
                    }}
                    placeholder="搜索产品 / 品牌（中英文）..."
                    className="input-base pl-10"
                  />
                </div>

                <div className="max-h-56 space-y-1.5 overflow-y-auto">
                  {filtered.map((p) => {
                    const brand = getBrandById(p.brandId);
                    const active = picked === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPicked(p.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                          active
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-border-hover hover:bg-surface-hover',
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {p.nameCn}
                          </p>
                          <p className="truncate text-[11px] text-muted">
                            {brand?.nameCn} · {p.category}
                          </p>
                        </div>
                        {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="px-1 py-6 text-center text-xs text-muted">
                      没找到？切到「拍 / 贴成分表」手动录入即可。
                    </p>
                  )}
                </div>

                {pickedProduct && (
                  <div className="rounded-xl border border-border bg-surface-hover p-3">
                    <p className="mb-1.5 text-xs font-semibold text-foreground">核心成分</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pickedProduct.keyIngredients.map((id) => (
                        <span
                          key={id}
                          className="badge border border-primary/20 bg-primary/10 text-primary"
                        >
                          {nameOf(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddProduct}
                  disabled={!pickedProduct || submitting}
                  className="btn-primary w-full"
                >
                  <Sparkles className="h-4 w-4" />
                  加入我的护肤台
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
