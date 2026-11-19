import { AlertOctagon, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  label: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'ai';
}

export function inferTone(label: string): NonNullable<StatusBadgeProps['tone']> {
  const lower = label.toLowerCase();
  if (
    lower.includes('critical') ||
    lower.includes('blocked') ||
    lower.includes('aml flagged') ||
    lower.includes('declined') ||
    lower.includes('expired')
  ) {
    return 'danger';
  }
  if (
    lower.includes('high') ||
    lower.includes('flagged') ||
    lower.includes('unmatched') ||
    lower.includes('elevated') ||
    lower.includes('warning') ||
    lower.includes('review') ||
    lower.includes('escalated') ||
    lower.includes('duplicate')
  ) {
    return 'warning';
  }
  if (
    lower.includes('normal') ||
    lower.includes('verified') ||
    lower.includes('matched') ||
    lower.includes('resolved') ||
    lower.includes('cleared') ||
    lower.includes('approved') ||
    lower.includes('positive') ||
    lower.includes('active') ||
    lower.includes('connected') ||
    lower.includes('completed') ||
    lower.includes('contained') ||
    lower.includes('low') ||
    lower.includes('settled') ||
    lower.includes('deployed')
  ) {
    return 'success';
  }
  if (lower.includes('processing') || lower.includes('syncing') || lower.includes('investigating')) {
    return 'info';
  }
  if (lower.includes('ai') || lower.includes('advisory')) {
    return 'ai';
  }
  return 'neutral';
}

const TONE_CLASSES: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  neutral:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70',
  warning:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70',
  danger:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/70',
  info:
    'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/70',
  ai:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/70',
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const resolved = tone ?? inferTone(label);
  const Icon =
    resolved === 'danger'
      ? AlertOctagon
      : resolved === 'warning'
        ? AlertTriangle
        : resolved === 'success'
          ? CheckCircle2
          : resolved === 'info'
            ? Clock
            : ShieldAlert;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${TONE_CLASSES[resolved]}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
