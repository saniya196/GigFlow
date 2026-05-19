import { LeadSource, LeadStatus } from '../../types';
import clsx from 'clsx';

interface BadgeProps {
  value: LeadStatus | LeadSource | string;
  className?: string;
}

const statusConfig: Record<LeadStatus, string> = {
  New: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  Contacted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  Qualified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  Lost: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

const sourceConfig: Record<LeadSource, string> = {
  Website: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  Instagram: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
  Referral: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
};

export const StatusBadge = ({ value, className }: BadgeProps) => {
  const styles = statusConfig[value as LeadStatus] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide', styles, className)}>
      {value}
    </span>
  );
};

export const SourceBadge = ({ value, className }: BadgeProps) => {
  const styles = sourceConfig[value as LeadSource] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide', styles, className)}>
      {value}
    </span>
  );
};
