import { dashboardApi } from './dashboardApi';

export interface AuditLogItem {
  id: number;
  actorId?: number;
  actorEmail?: string;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ArchiveRecordItem {
  id: number;
  fromModel: string;
  originalRecordId?: number | string;
  originalRecord?: Record<string, unknown>;
  createdAt?: string;
}

export interface ArchiveLogsResponse {
  data: ArchiveRecordItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RestoreArchiveResult {
  success: boolean;
  restoredModel?: string;
  restoredId?: number;
}

export const auditApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      AuditLogsResponse,
      { page?: number; limit?: number; search?: string; action?: string; targetType?: string }
    >({
      query: (params) => ({
        url: '/audit/logs',
        params,
      }),
      providesTags: ['AuditLogs'],
    }),
    getArchiveLogs: builder.query<ArchiveLogsResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/audit/archives',
        params,
      }),
      providesTags: ['AuditLogs'],
    }),
    restoreArchiveRecord: builder.mutation<RestoreArchiveResult, number>({
      query: (id) => ({
        url: `/audit/archives/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: ['AuditLogs', 'Words', 'Users', 'Stats'],
    }),
    deleteArchiveRecord: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/audit/archives/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AuditLogs'],
    }),
  }),
});

export const { 
  useGetAuditLogsQuery, 
  useGetArchiveLogsQuery,
  useRestoreArchiveRecordMutation,
  useDeleteArchiveRecordMutation,
} = auditApi;
