import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/lib/auth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SkinSight — AI 护肤成分分析',
  description: '基于 AI 的智能护肤成分分析工具，拍照测肤质、产品推荐、成分安全评估',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans bg-background text-foreground min-h-screen antialiased`}>
        {/* Ambient tech gradient — soft, fixed behind all content */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-sky-50 via-background to-background" />
          <div className="absolute -top-40 left-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-indigo-200/30 blur-[150px]" />
          <div className="absolute top-10 right-0 h-[32rem] w-[32rem] translate-x-1/3 rounded-full bg-violet-200/25 blur-[150px]" />
        </div>
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
