import { Edit2, Trash2, Eye } from 'lucide-react';
import { Lead } from '../../types';
import { StatusBadge, SourceBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onView: (lead: Lead) => void;
  isDeleting?: boolean;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const LeadsTable = ({ leads, onEdit, onDelete, onView, isDeleting }: LeadsTableProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Name
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:table-cell">
              Source
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 md:table-cell">
              Created
            </th>
            {isAdmin && (
              <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 lg:table-cell">
                Created By
              </th>
            )}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {leads.map((lead) => (
            <tr
              key={lead._id}
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <td className="py-3.5 px-4">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{lead.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{lead.email}</p>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <StatusBadge value={lead.status} />
              </td>
              <td className="py-3.5 px-4 hidden sm:table-cell">
                <SourceBadge value={lead.source} />
              </td>
              <td className="hidden px-4 py-3.5 text-slate-500 dark:text-slate-400 md:table-cell">
                {formatDate(lead.createdAt)}
              </td>
              {isAdmin && (
                <td className="hidden px-4 py-3.5 text-slate-500 dark:text-slate-400 lg:table-cell">
                  {lead.createdBy.name}
                </td>
              )}
              <td className="py-3.5 px-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(lead)}
                    aria-label={`View ${lead.name}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lead)}
                    aria-label={`Edit ${lead.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(lead._id)}
                    isLoading={isDeleting}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label={`Delete ${lead.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
