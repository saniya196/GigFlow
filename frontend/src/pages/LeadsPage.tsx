import { useState } from 'react';
import { Plus, Download, Loader2, AlertCircle } from 'lucide-react';
import type { Lead, LeadFilters, CreateLeadFormData } from '../types';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useExportCsv, useLeadStats } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import { useAuthStore } from '../store/authStore';
import { LeadsTable } from '../components/leads/LeadsTable';
import { LeadFiltersBar } from '../components/leads/LeadFiltersBar';
import { LeadForm } from '../components/leads/LeadForm';
import { StatsGrid } from '../components/leads/StatsGrid';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Pagination } from '../components/ui/Pagination';

const DEFAULT_FILTERS: LeadFilters = {
  status: '',
  source: '',
  search: '',
  sort: 'latest',
  page: 1,
};

export const LeadsPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);
  const filtersWithSearch = { ...filters, search: debouncedSearch };

  const { data, isLoading, isError } = useLeads(filtersWithSearch);
  const { data: stats } = useLeadStats();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const exportCsv = useExportCsv();

  const handleFilterChange = (key: keyof LeadFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setSearchInput('');
    setFilters(DEFAULT_FILTERS);
  };

  const handleCreate = (formData: CreateLeadFormData) => {
    createLead.mutate(formData, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleUpdate = (formData: CreateLeadFormData) => {
    if (!editingLead) return;
    updateLead.mutate({ id: editingLead._id, data: formData }, {
      onSuccess: () => setEditingLead(null),
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteLead.mutate(id);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="absolute left-24 top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600 dark:text-sky-400">
              Lead management dashboard
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Track every lead with clarity.
            </h1>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="secondary"
                onClick={() => exportCsv.mutate(filtersWithSearch)}
                isLoading={exportCsv.isPending}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            )}
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </div>
        </div>
      </div>

      {stats && <StatsGrid stats={stats} />}

      <LeadFiltersBar
        filters={filters}
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-slate-600 dark:text-slate-400">Failed to load leads. Please try again.</p>
          </div>
        ) : !data?.leads.length ? (
          <EmptyState
            title={filtersWithSearch.search || filtersWithSearch.status || filtersWithSearch.source
              ? 'No leads match your filters'
              : 'No leads yet'}
            description={
              filtersWithSearch.search || filtersWithSearch.status || filtersWithSearch.source
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first lead.'
            }
            action={
              !filtersWithSearch.search && !filtersWithSearch.status && !filtersWithSearch.source ? (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Add your first lead
                </Button>
              ) : (
                <Button variant="secondary" onClick={handleReset}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <>
            <LeadsTable
              leads={data.leads}
              onEdit={setEditingLead}
              onDelete={handleDelete}
              onView={setViewingLead}
              isDeleting={deleteLead.isPending}
            />
            {data.meta && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  meta={data.meta}
                  onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Lead"
      >
        <LeadForm
          onSubmit={handleCreate}
          isLoading={createLead.isPending}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        title="Edit Lead"
      >
        {editingLead && (
          <LeadForm
            lead={editingLead}
            onSubmit={handleUpdate}
            isLoading={updateLead.isPending}
            onCancel={() => setEditingLead(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        title="Lead Details"
        size="sm"
      >
        {viewingLead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs mb-1 text-slate-500 dark:text-slate-400">Name</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{viewingLead.name}</p>
              </div>
              <div>
                <p className="text-xs mb-1 text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{viewingLead.email}</p>
              </div>
              <div>
                <p className="text-xs mb-1 text-slate-500 dark:text-slate-400">Status</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{viewingLead.status}</p>
              </div>
              <div>
                <p className="text-xs mb-1 text-slate-500 dark:text-slate-400">Source</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{viewingLead.source}</p>
              </div>
            </div>
            {viewingLead.notes && (
              <div>
                <p className="text-xs mb-1 text-slate-500 dark:text-slate-400">Notes</p>
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {viewingLead.notes}
                </p>
              </div>
            )}
            <div className="pt-2">
              <Button
                className="w-full"
                onClick={() => {
                  setViewingLead(null);
                  setEditingLead(viewingLead);
                }}
              >
                Edit Lead
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
