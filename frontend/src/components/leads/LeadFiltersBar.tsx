import { Search, SlidersHorizontal } from 'lucide-react';
import type { LeadFilters, SortOrder } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface LeadFiltersBarProps {
  filters: LeadFilters;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (key: keyof LeadFilters, value: string) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export const LeadFiltersBar = ({
  filters,
  searchValue,
  onSearchChange,
  onFilterChange,
  onReset,
}: LeadFiltersBarProps) => {
  const hasActiveFilters = filters.status || filters.source || filters.search || filters.sort !== 'latest';

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex flex-wrap gap-3 sm:items-center">
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <Select
            options={STATUS_OPTIONS}
            placeholder="All statuses"
            value={filters.status ?? ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="min-w-[140px]"
          />
          <Select
            options={SOURCE_OPTIONS}
            placeholder="All sources"
            value={filters.source ?? ''}
            onChange={(e) => onFilterChange('source', e.target.value)}
            className="min-w-[140px]"
          />
          <Select
            options={SORT_OPTIONS}
            value={filters.sort}
            onChange={(e) => onFilterChange('sort', e.target.value as SortOrder)}
            className="min-w-[130px]"
          />
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
