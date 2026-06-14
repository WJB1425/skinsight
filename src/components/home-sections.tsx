'use client';

import { motion } from 'framer-motion';
import { Camera, FlaskConical, ShoppingCart, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ingredients, brands, conflictRules } from '@/lib/mock-data';

const features = [
  {
    icon: Camera,
    title: 'AI 肤质测试',
    description: '上传自拍，AI 智能分析你的肤质类型，获取个性化护肤建议。',
    href: '/skin-test',
    tint: 'from-sky-500/15 to-blue-500/15',
    iconColor: 'text-sky-600',
  },
  {
    icon: FlaskConical,
    title: '成分深度分析',
    description: '查询护肤品成分，查看安全评分、功效说明和化学结构。',
    href: '/ingredients',
    tint: 'from-violet-500/15 to-fuchsia-500/15',
    iconColor: 'text-violet-600',
  },
  {
    icon: ShoppingCart,
    title: '智能产品推荐',
    description: '基于你的肤质和需求，推荐最适合的护肤产品组合。',
    href: '/products',
    tint: 'from-amber-500/15 to-orange-500/15',
    iconColor: 'text-amber-600',
  },
  {
    icon: ShieldCheck,
    title: '成分冲突检测',
    description: '自动检测成分搭配冲突，避免护肤不当造成的皮肤问题。',
    href: '/ingredients',
    tint: 'from-emerald-500/15 to-teal-500/15',
    iconColor: 'text-emerald-600',
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft tech gradient mesh */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12rem] h-[40rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-sky-200/50 via-indigo-200/35 to-violet-200/30 blur-[130px]" />
        <div className="absolute left-[-10rem] top-24 h-[26rem] w-[26rem] rounded-full bg-cyan-200/30 blur-[110px] animate-float" />
        <div className="absolute right-[-10rem] top-40 h-[26rem] w-[26rem] rounded-full bg-fuchsia-200/25 blur-[110px]" />
      </div>

      <div className="container-app relative pt-20 pb-16 sm:pt-32 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-border text-primary text-sm font-medium mb-7 shadow-soft"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI 驱动 · 科学护肤
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold tracking-tight mb-6 leading-[1.05]">
            <span className="text-foreground">科学护肤，</span>
            <br />
            <span className="text-gradient">从了解成分开始</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            SkinSight 使用 AI 技术分析你的肤质，深度解读护肤成分，
            为你找到真正适合的护肤方案。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/skin-test" className="btn-primary gap-3 px-8 py-3.5 text-base">
              开始肤质测试
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/ingredients" className="btn-secondary gap-3 px-8 py-3.5 text-base">
              查询成分
              <FlaskConical className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-app">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
            四大核心功能
          </h2>
          <p className="text-muted max-w-md mx-auto text-base">
            从肤质检测到产品推荐，一站式解决你的护肤困惑
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Link href={feature.href}>
                <div className="card group h-full">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.tint} flex items-center justify-center mb-4 ring-1 ring-inset ring-border`}
                  >
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {feature.description}
                  </p>
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
    <section className="py-16">
      <div className="container-app">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-white/60 backdrop-blur-xl shadow-card px-6 py-12 sm:px-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-5xl font-semibold tracking-tight text-gradient mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-dark mt-8">
            数据基于精选成分库，持续扩充中 · 化学结构经程序校验
          </p>
        </div>
      </div>
    </section>
  );
}
