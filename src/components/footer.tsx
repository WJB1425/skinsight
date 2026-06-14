import { MedicalDisclaimer } from '@/components/medical-disclaimer';

/**
 * Global site footer (rendered once in layout.tsx). Carries the medical
 * disclaimer on every page, a dynamic copyright year, and honest dataset
 * framing. No dead links — pages that don't exist yet are simply omitted.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-8 border-t border-border">
      <div className="container-app space-y-4">
        <MedicalDisclaimer variant="footer" className="max-w-2xl mx-auto" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-border/50">
          <p className="text-sm text-muted">© {year} SkinSight · AI 护肤成分分析工具</p>
          <p className="text-xs text-muted-dark">精选成分库 · 持续扩充</p>
        </div>
      </div>
    </footer>
  );
}
