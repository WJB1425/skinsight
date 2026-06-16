'use client';

import { motion } from 'framer-motion';
import { Camera, FlaskConical, ShoppingCart, ShieldCheck, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ingredients, brands, conflictRules } from '@/lib/mock-data';

const features = [
  {
    icon: Camera,
    title: 'AI 肤质测试',
    description: '上传自拍，智能分析肤质类型。',
    href: '/skin-test',
    tint: 'from-sky-500/15 to-blue-500/15',
    iconColor: 'text-sky-600',
  },
  {
    icon: FlaskConical,
    title: '成分深度分析',
    description: '安全评分、功效与化学结构。',
    href: '/ingredients',
    tint: 'from-violet-500/15 to-fuchsia-500/15',
    iconColor: 'text-violet-600',
  },
  {
    icon: ShoppingCart,
    title: '智能产品推荐',
    description: '按肤质推荐合适的护肤组合。',
    href: '/products',
    tint: 'from-amber-500/15 to-orange-500/15',
    iconColor: 'text-amber-600',
  },
  {
    icon: ShieldCheck,
    title: '成分冲突检测',
    description: '自动检测搭配冲突，避免风险。',
    href: '/ingredients',
    tint: 'from-emerald-500/15 to-teal-500/15',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Layers,
    title: '我的护肤台',
    description: '拍产品识别成分，分析搭配用法。',
    href: '/shelf',
    tint: 'from-rose-500/15 to-pink-500/15',
    iconColor: 'text-rose-600',
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft tech gradient mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-15rem] h-[32rem] w-[45rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-200/50 via-indigo-200/35 to-violet-200/30 blur-[120px]" />
        <div className="absolute right-[-8rem] top-10 h-[24rem] w-[24rem] rounded-full bg-fuchsia-200/25 blur-[110px] animate-float" />
      </div>

      <div className="container-app relative pb-4 pt-12 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-primary shadow-soft"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            AI 驱动 · 科学护肤
          </motion.div>

          <h1 className="mb-3.5 text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-foreground">科学护肤，</span>
            <span className="text-gradient">从了解成分开始</span>
          </h1>

          <p className="mx-auto mb-6 max-w-md text-base leading-relaxed text-muted">
            用 AI 分析你的肤质，深度解读护肤成分，找到真正适合你的护肤方案。
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/skin-test" className="btn-primary">
              开始肤质测试
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/ingredients" className="btn-secondary">
              查询成分
              <FlaskConical className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="pt-6">
      <div className="container-app">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Link href={feature.href}>
                <div className="card group h-full p-[18px]">
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[13px] bg-gradient-to-br ${feature.tint} ring-1 ring-inset ring-border`}
                  >
                    <feature.icon className={`h-[19px] w-[19px] ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-1.5 text-[15px] font-semibold text-foreground transition-colors group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] leading-snug text-muted">{feature.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  // Counts computed from the actual dataset, so the numbers can never overstate
  // what the app really contains.
  const structureCount = ingredients.filter((i) => i.smiles && i.smiles.trim()).length;
  const stats = [
    { value: String(ingredients.length), label: '精选成分' },
    { value: String(structureCount), label: '真实化学结构图' },
    { value: String(brands.length), label: '收录品牌' },
    { value: String(conflictRules.length), label: '成分冲突规则' },
  ];

  return (
    <section className="py-8">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-6 rounded-3xl border border-border px-7 py-5 shadow-card"
        >
          <div className="flex flex-1 items-center justify-around gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-gradient text-3xl font-semibold leading-tight tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[13px] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="flex-[0_1_200px] text-right text-xs leading-snug text-muted-dark">
            数据基于精选成分库，持续扩充中 · 化学结构经程序校验
          </p>
        </motion.div>
      </div>
    </section>
  );
}
