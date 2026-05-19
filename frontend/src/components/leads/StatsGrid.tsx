import { Users, TrendingUp, Target, XCircle } from 'lucide-react';
import { LeadStats } from '../../types';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard = ({ label, value, icon, colorClass }: StatCardProps) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', colorClass)}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
  </div>
);

interface StatsGridProps {
  stats: LeadStats;
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const getCount = (id: string) =>
    stats.statusStats.find((s) => s._id === id)?.count ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Leads"
        value={stats.totalCount}
        icon={<Users className="w-5 h-5 text-sky-700 dark:text-sky-300" />}
        colorClass="bg-sky-100 dark:bg-sky-900/20"
      />
      <StatCard
        label="Qualified"
        value={getCount('Qualified')}
        icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        colorClass="bg-emerald-100 dark:bg-emerald-900/20"
      />
      <StatCard
        label="Contacted"
        value={getCount('Contacted')}
        icon={<Target className="w-5 h-5 text-amber-600" />}
        colorClass="bg-amber-100 dark:bg-amber-900/20"
      />
      <StatCard
        label="Lost"
        value={getCount('Lost')}
        icon={<XCircle className="w-5 h-5 text-red-600" />}
        colorClass="bg-rose-100 dark:bg-rose-900/20"
      />
    </div>
  );
};
