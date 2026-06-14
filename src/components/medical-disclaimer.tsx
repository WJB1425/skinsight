import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const DISCLAIMER =
  '本工具的成分信息与安全分级仅供参考，不构成医疗建议。如有皮肤问题或孕期用药疑问，请咨询专业皮肤科医生。';

interface MedicalDisclaimerProps {
  variant?: 'footer' | 'inline';
  className?: string;
}

/** Reusable medical/legal disclaimer. Renders the same copy in two styles. */
export function MedicalDisclaimer({ variant = 'inline', className }: MedicalDisclaimerProps) {
  return (
    <p
      className={cn(
        'flex items-start gap-2 text-xs leading-relaxed',
        variant === 'footer' ? 'text-muted-dark justify-center text-center' : 'text-muted',
        className,
      )}
    >
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{DISCLAIMER}</span>
    </p>
  );
}
