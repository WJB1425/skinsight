'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { ConflictRule } from '@/lib/mock-data';

interface ConflictAlertProps extends ConflictRule {}

const severityConfig = {
  safe: {
    icon: CheckCircle,
    className: 'border-emerald-500/30 bg-emerald-500/5',
    iconClass: 'text-emerald-400',
    label: '可搭配',
    labelClass: 'text-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-amber-500/30 bg-amber-500/5',
    iconClass: 'text-amber-400',
    label: '注意',
    labelClass: 'text-amber-400',
  },
  danger: {
    icon: XCircle,
    className: 'border-red-500/30 bg-red-500/5',
    iconClass: 'text-red-400',
    label: '冲突',
    labelClass: 'text-red-400',
  },
};

export function ConflictAlert({ ingredients, severity, message }: ConflictAlertProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className={cn('rounded-lg border p-4', config.className)}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconClass)} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('text-xs font-semibold', config.labelClass)}>
                {config.label}
              </span>
              <span className="text-xs text-muted">
                {ingredients.join(' + ')}
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">{message}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
