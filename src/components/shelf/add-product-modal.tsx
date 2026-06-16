'use client';

import { useState, useMemo, useEffect } from 'react';
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

// 上传图片在送模型前先压缩（最长边 ~1280px，JPEG 0.8），控制请求体积与调用成本。
async function downscaleImage(dataUrl: string, maxDim = 1280, quality = 0.8): Promise<string> {
  if (typeof document === 'undefined') return dataUrl;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

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

  // —— AI 候选 / 识别（参考）——
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState(false);
  const [aiResolved, setAiResolved] = useState('');
  const [aiCandidates, setAiCandidates] = useState<{ brand: string; product: string; alias?: string }[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(true);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionError, setVisionError] = useState<string | null>(null);

  // 输入即出候选：对搜索词防抖后，让 AI 列出可能指代的产品
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setAiCandidates([]);
      return;
    }
    let active = true;
    setSuggestLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/lookup-ingredients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suggest: q }),
        });
        const data = await res.json();
        if (!active) return;
        setAiConfigured(data.configured !== false);
        setAiCandidates(Array.isArray(data.candidates) ? data.candidates : []);
      } catch {
        if (active) setAiCandidates([]);
      } finally {
        if (active) setSuggestLoading(false);
      }
    }, 450);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // 拍图识别：成分表照片 OCR / 包装识别产品 → 灌入可编辑的「拍成分表」流程
  async function recognizeImage(preview: string) {
    setVisionError(null);
    setVisionLoading(true);
    try {
      const img = await downscaleImage(preview);
      const res = await fetch('/api/lookup-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: img }),
      });
      const data = await res.json();
      if (!data.configured) {
        setVisionError('拍图识别暂未接入（需配置 LLM_API_KEY + 视觉模型）。可手动粘贴成分表或选产品。');
        return;
      }
      if (!data.found || !data.ingredientsText) {
        setVisionError(data.note || '没认出这张图，换张更清晰的（成分表 / 正面包装），或手动粘贴成分表。');
        return;
      }
      setText(data.ingredientsText);
      setScanName(data.product || scanName);
      setAiResolved([data.brand, data.product].filter(Boolean).join(' '));
      setThumbnail(preview);
      setAiNote(true);
      setTab('scan');
    } catch {
      setVisionError('识别出错，请稍后重试。');
    } finally {
      setVisionLoading(false);
    }
  }

  // 选中一个候选（或直接用输入词）→ 取其成分 → 灌入可编辑的「拍成分表」流程
  async function pickAiCandidate(brand: string, product: string) {
    const full = [brand, product].filter(Boolean).join(' ').trim();
    if (!full) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await fetch('/api/lookup-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: full }),
      });
      const data = await res.json();
      if (!data.configured) {
        setAiError('AI 识别暂未接入（需配置 LLM_API_KEY）。可从下方产品库选择，或改用「拍 / 贴成分表」。');
        return;
      }
      if (!data.found || !data.ingredientsText) {
        setAiError(data.note || '没查到该产品成分，建议改用「拍 / 贴成分表」手动录入。');
        return;
      }
      setText(data.ingredientsText);
      setScanName(data.product || product);
      setAiResolved([data.brand || brand, data.product || product].filter(Boolean).join(' '));
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
                上传 / 拍照后用 <strong>AI 自动识别</strong>（需配置模型）：成分表照片直接 OCR、拍包装识别产品；
                也可手动{tab === 'scan' ? '粘贴成分表' : '选产品'}。识别结果可编辑，请核对后再添加。
              </span>
            </div>

            {tab === 'scan' ? (
              <>
                <ImageUpload
                  onImageSelect={(_f, preview) => {
                    setThumbnail(preview);
                    recognizeImage(preview);
                  }}
                />

                {visionLoading && (
                  <p className="flex items-center gap-2 text-xs text-violet-700">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-300 border-t-violet-700" />
                    AI 正在识别图片…
                  </p>
                )}
                {visionError && <p className="text-xs text-red-600">{visionError}</p>}

                {aiNote && (
                  <div className="flex items-start gap-2 rounded-xl border border-violet-200/80 bg-violet-50 px-3.5 py-2.5 text-xs text-violet-800">
                    <Sparkles className="mt-px h-3.5 w-3.5 shrink-0" />
                    <span>
                      {aiResolved && (
                        <>
                          识别为「<strong>{aiResolved}</strong>」。{' '}
                        </>
                      )}
                      以下成分由 <strong>AI 识别 / 整理</strong>，仅供参考——请核对 / 编辑后再添加，以实物成分表为准。
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
                <ImageUpload
                  onImageSelect={(_f, preview) => recognizeImage(preview)}
                />

                {visionLoading && (
                  <p className="flex items-center gap-2 text-xs text-violet-700">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-300 border-t-violet-700" />
                    AI 正在识别图片…
                  </p>
                )}
                {visionError && <p className="text-xs text-red-600">{visionError}</p>}

                {/* 统一搜索：输入即出候选（产品库精确 + AI 识别），点选即出成分 */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPicked(null);
                      setAiError(null);
                    }}
                    placeholder="搜产品名 / 昵称，如：神仙水、小棕瓶、修丽可…"
                    className="input-base pl-10"
                  />
                </div>

                {aiError && <p className="text-xs text-red-600">{aiError}</p>}

                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {/* 产品库精确匹配 */}
                  {query.trim() && filtered.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="px-1 text-[11px] font-semibold text-muted-dark">产品库（精确）</p>
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
                            <Package className="h-4 w-4 shrink-0 text-muted" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">{p.nameCn}</p>
                              <p className="truncate text-[11px] text-muted">
                                {brand?.nameCn} · {p.category}
                              </p>
                            </div>
                            {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* AI 识别候选 */}
                  {query.trim().length >= 2 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-violet-600">
                        <Sparkles className="h-3 w-3" />
                        AI 识别（参考）
                        {suggestLoading && (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
                        )}
                      </p>
                      {aiCandidates.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => pickAiCandidate(c.brand, c.product)}
                          disabled={aiLoading}
                          className="flex w-full items-center gap-3 rounded-xl border border-violet-200/70 bg-violet-50/40 px-3 py-2.5 text-left transition-colors hover:border-violet-300 hover:bg-violet-50 disabled:opacity-60"
                        >
                          <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{c.product}</p>
                            <p className="truncate text-[11px] text-muted">
                              {c.brand}
                              {c.alias ? ` · 又名「${c.alias}」` : ''}
                            </p>
                          </div>
                        </button>
                      ))}
                      {/* 兜底：直接用输入词查 */}
                      {!suggestLoading && (
                        <button
                          onClick={() => pickAiCandidate('', query.trim())}
                          disabled={aiLoading}
                          className="flex w-full items-center gap-2 rounded-xl border border-dashed border-violet-300 px-3 py-2 text-left text-xs text-violet-700 transition-colors hover:bg-violet-50 disabled:opacity-60"
                        >
                          {aiLoading ? (
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          )}
                          直接让 AI 查「{query.trim()}」的成分
                        </button>
                      )}
                      {!suggestLoading && !aiConfigured && (
                        <p className="px-1 text-[11px] text-muted-dark">AI 识别未接入（需配置模型）。</p>
                      )}
                    </div>
                  )}

                  {!query.trim() && (
                    <p className="px-1 py-6 text-center text-xs text-muted">
                      输入产品名或昵称，下面会列出可能的产品供你选择。
                    </p>
                  )}
                </div>

                {/* 选中产品库产品 → 预览 + 加入 */}
                {pickedProduct && (
                  <>
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
                    <button
                      onClick={handleAddProduct}
                      disabled={submitting}
                      className="btn-primary w-full"
                    >
                      <Sparkles className="h-4 w-4" />
                      加入我的护肤台
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
