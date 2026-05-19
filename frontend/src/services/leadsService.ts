import { apiClient } from './apiClient';
import {
  ApiResponse,
  CreateLeadFormData,
  Lead,
  LeadFilters,
  LeadStats,
  LeadsResponse,
  PaginationMeta,
} from '../types';

interface GetLeadsResult {
  leads: Lead[];
  meta: PaginationMeta;
}

export const leadsService = {
  async getLeads(filters: LeadFilters): Promise<GetLeadsResult> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    params.set('sort', filters.sort);
    params.set('page', String(filters.page));
    params.set('limit', '10');

    const { data } = await apiClient.get<ApiResponse<LeadsResponse>>(
      `/leads?${params.toString()}`
    );
    return {
      leads: data.data?.leads ?? [],
      meta: data.meta ?? { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false },
    };
  },

  async getLeadById(id: string): Promise<Lead> {
    const { data } = await apiClient.get<ApiResponse<{ lead: Lead }>>(`/leads/${id}`);
    if (!data.data?.lead) throw new Error('Lead not found');
    return data.data.lead;
  },

  async createLead(leadData: CreateLeadFormData): Promise<Lead> {
    const { data } = await apiClient.post<ApiResponse<{ lead: Lead }>>('/leads', leadData);
    if (!data.data?.lead) throw new Error('Failed to create lead');
    return data.data.lead;
  },

  async updateLead(id: string, leadData: Partial<CreateLeadFormData>): Promise<Lead> {
    const { data } = await apiClient.put<ApiResponse<{ lead: Lead }>>(`/leads/${id}`, leadData);
    if (!data.data?.lead) throw new Error('Failed to update lead');
    return data.data.lead;
  },

  async deleteLead(id: string): Promise<void> {
    await apiClient.delete(`/leads/${id}`);
  },

  async getStats(): Promise<LeadStats> {
    const { data } = await apiClient.get<ApiResponse<LeadStats>>('/leads/stats');
    if (!data.data) throw new Error('Failed to fetch stats');
    return data.data;
  },

  async exportCsv(filters: Partial<LeadFilters>): Promise<Blob> {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);

    const response = await apiClient.get(`/leads/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
