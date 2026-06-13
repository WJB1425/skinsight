import { HeroSection, FeaturesSection, StatsSection } from '@/components/home-sections';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <StatsSection />

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted">
              © 2024 SkinSight. AI 护肤成分分析工具.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>关于我们</span>
              <span>隐私政策</span>
              <span>联系方式</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
