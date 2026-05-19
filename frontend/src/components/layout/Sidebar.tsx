import { Sparkles, Users, LayoutDashboard, LogOut, Moon, Sun, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

interface SidebarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
];

export const Sidebar = ({ darkMode, onToggleDarkMode }: SidebarProps) => {
  const { user, clearAuth } = useAuthStore();

  return (
    <aside className="flex h-full w-[18rem] flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="border-b border-slate-200/80 p-6 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">GigFlow</h1>
            <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 capitalize">
              {user?.role} panel
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-4 border-t border-slate-200/80 p-4 dark:border-slate-800">
        <button
          onClick={onToggleDarkMode}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {darkMode ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/40 dark:to-indigo-900/40">
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={clearAuth}
            className="p-1 text-slate-400 transition-colors hover:text-rose-500"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
