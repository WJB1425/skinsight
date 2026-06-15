// Supabase 浏览器客户端（单例）。
//
// 全站为客户端渲染、无服务端取数，因此只用浏览器客户端 + 行级安全(RLS)，
// 不引入 middleware / server client。会话默认存 localStorage 并自动续期。
//
// 未配置环境变量时 `supabase` 为 null、`isSupabaseConfigured` 为 false，
// 全站自动退化为「本机试用模式」（账号系统禁用，护肤台数据仅存本机），
// 这样 npm run dev 与 Vercel 预览在没有密钥时也不会报错。

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
