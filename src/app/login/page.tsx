'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 已登录（含登录成功后 onAuthStateChange 触发）→ 回护肤台
  useEffect(() => {
    if (!loading && user) router.replace('/shelf');
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }
    if (password.length < 6) {
      setError('密码至少 6 位');
      return;
    }
    setSubmitting(true);
    if (mode === 'signup') {
      const { error: e1 } = await signUp(email, password);
      if (e1) {
        setError(e1);
        setSubmitting(false);
        return;
      }
      // 关闭邮箱验证时 signUp 会直接建立会话；否则尝试直接登录
      const { error: e2 } = await signIn(email, password);
      if (e2) {
        setNote(
          '注册成功。若在 Supabase 后台开启了「邮箱验证」，请先到邮箱完成验证后再登录。',
        );
        setSubmitting(false);
        return;
      }
    } else {
      const { error: e1 } = await signIn(email, password);
      if (e1) {
        setError(e1);
        setSubmitting(false);
        return;
      }
    }
    // 成功后由上面的 useEffect 跳转
  }

  return (
    <div className="container-app flex min-h-[calc(100vh-64px)] items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-[0_4px_12px_-2px_rgba(0,113,227,0.45)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'signin' ? '登录 SkinSight' : '注册 SkinSight'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            登录后即可把正在用的产品保存到「我的护肤台」，多设备同步
          </p>
        </div>

        {!configured && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-3 text-xs text-amber-700">
            <Info className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>
              账号系统尚未接入（未配置 Supabase）。可先在「我的护肤台」本机试用；
              接入后即可云端保存。配置方法见项目 <span className="font-mono">.env.example</span>。
            </span>
          </div>
        )}

        <div className="card">
          {/* 切换 */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-hover p-1">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setNote(null);
                }}
                className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                  mode === m ? 'bg-white text-foreground shadow-soft' : 'text-muted'
                }`}
              >
                {m === 'signin' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="email"
                autoComplete="email"
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base pl-10"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="password"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                placeholder="密码（至少 6 位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base pl-10"
              />
            </div>

            {error && (
              <p className="flex items-start gap-1.5 text-xs text-red-600">
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}
            {note && (
              <p className="flex items-start gap-1.5 text-xs text-emerald-700">
                <Info className="mt-px h-3.5 w-3.5 shrink-0" />
                {note}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  处理中...
                </>
              ) : mode === 'signin' ? (
                '登录'
              ) : (
                '注册并登录'
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          想先看看？
          <Link href="/shelf" className="ml-1 font-medium text-primary hover:underline">
            直接进入护肤台试用
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
