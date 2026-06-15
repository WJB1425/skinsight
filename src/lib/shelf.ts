'use client';

// 「我的护肤台」存储。登录 → 读写 Supabase（按 user_id，RLS 隔离）；
// 未登录 / 未配置 → localStorage 本机暂存（试用）。登录瞬间若本机有试用数据，
// 自动合并进账号再清空本机，实现「先试用、登录后保存」。

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

export interface ShelfItem {
  id: string;
  source: 'product' | 'scan';
  productId?: string;
  name: string;
  brandCn?: string;
  category?: string;
  ingredientIds: string[];
  thumbnail?: string;
  createdAt: number;
}

export type NewShelfItem = Omit<ShelfItem, 'id' | 'createdAt'>;

const GUEST_KEY = 'skinsight.shelf.guest.v1';

function readGuest(): ShelfItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as ShelfItem[]) : [];
  } catch {
    return [];
  }
}
function writeGuest(items: ShelfItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    /* 隐私模式等：忽略 */
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToItem(r: any): ShelfItem {
  return {
    id: r.id,
    source: r.source,
    productId: r.product_id ?? undefined,
    name: r.name,
    brandCn: r.brand_cn ?? undefined,
    category: r.category ?? undefined,
    ingredientIds: r.ingredient_ids ?? [],
    thumbnail: r.thumbnail ?? undefined,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  };
}
function itemToInsert(i: ShelfItem | NewShelfItem) {
  return {
    source: i.source,
    product_id: i.productId ?? null,
    name: i.name,
    brand_cn: i.brandCn ?? null,
    category: i.category ?? null,
    ingredient_ids: i.ingredientIds,
    thumbnail: i.thumbnail ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface UseShelf {
  items: ShelfItem[];
  loading: boolean;
  /** 当前是否云端持久化（已登录且已接入 Supabase）。 */
  persisted: boolean;
  addItem: (item: NewShelfItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export function useShelf(): UseShelf {
  const { user } = useAuth();
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const persisted = Boolean(user && supabase);
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      if (user && supabase) {
        // 登录后只合并一次本机试用数据
        const guest = readGuest();
        if (guest.length && mergedFor.current !== user.id) {
          mergedFor.current = user.id;
          await supabase.from('shelf_items').insert(guest.map(itemToInsert));
          writeGuest([]);
        }
        const { data, error } = await supabase
          .from('shelf_items')
          .select('*')
          .order('created_at', { ascending: false });
        if (!active) return;
        setItems(error ? [] : (data ?? []).map(rowToItem));
      } else {
        if (!active) return;
        setItems(readGuest().sort((a, b) => b.createdAt - a.createdAt));
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const addItem = useCallback(
    async (partial: NewShelfItem) => {
      if (user && supabase) {
        const { data, error } = await supabase
          .from('shelf_items')
          .insert(itemToInsert(partial))
          .select('*')
          .single();
        if (!error && data) setItems((prev) => [rowToItem(data), ...prev]);
      } else {
        const item: ShelfItem = { ...partial, id: newId(), createdAt: Date.now() };
        setItems((prev) => {
          const next = [item, ...prev];
          writeGuest(next);
          return next;
        });
      }
    },
    [user],
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (user && supabase) {
        await supabase.from('shelf_items').delete().eq('id', id);
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setItems((prev) => {
          const next = prev.filter((i) => i.id !== id);
          writeGuest(next);
          return next;
        });
      }
    },
    [user],
  );

  const clear = useCallback(async () => {
    if (user && supabase) {
      await supabase
        .from('shelf_items')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      setItems([]);
    } else {
      writeGuest([]);
      setItems([]);
    }
  }, [user]);

  return { items, loading, persisted, addItem, removeItem, clear };
}
