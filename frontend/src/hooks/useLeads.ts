import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { leadsService } from '../services/leadsService';
import { CreateLeadFormData, LeadFilters } from '../types';

const LEADS_KEY = 'leads';
const STATS_KEY = 'leads-stats';

export const useLeads = (filters: LeadFilters) => {
  return useQuery({
    queryKey: [LEADS_KEY, filters],
    queryFn: () => leadsService.getLeads(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
};

export const useLeadStats = () => {
  return useQuery({
    queryKey: [STATS_KEY],
    queryFn: () => leadsService.getStats(),
    staleTime: 60_000,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadFormData) => leadsService.createLead(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      void queryClient.refetchQueries({ queryKey: [STATS_KEY], type: 'active' });
      toast.success('Lead created successfully');
    },
    onError: () => toast.error('Failed to create lead'),
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeadFormData> }) =>
      leadsService.updateLead(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      void queryClient.refetchQueries({ queryKey: [STATS_KEY], type: 'active' });
      toast.success('Lead updated successfully');
    },
    onError: () => toast.error('Failed to update lead'),
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [LEADS_KEY] });
      void queryClient.refetchQueries({ queryKey: [STATS_KEY], type: 'active' });
      toast.success('Lead deleted');
    },
    onError: () => toast.error('Failed to delete lead'),
  });
};

export const useExportCsv = () => {
  return useMutation({
    mutationFn: (filters: Partial<LeadFilters>) => leadsService.exportCsv(filters),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      window.setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 0);
      toast.success('CSV exported successfully');
    },
    onError: () => toast.error('Failed to export CSV'),
  });
};
