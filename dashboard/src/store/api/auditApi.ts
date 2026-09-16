import { dashboardApi } from './dashboardApi';

export const auditApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      any,
      { page?: number; limit?: number; search?: string; action?: string; targetType?: string }
    >({
      query: (params) => ({
        url: '/audit/logs',
        params,
      }),
      providesTags: ['AuditLogs'],
    }),
    getArchiveLogs: builder.query<any, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/audit/archives',
        params,
      }),
      providesTags: ['AuditLogs'],
    }),
    restoreArchiveRecord: builder.mutation<any, number>({
      query: (id) => ({
        url: `/audit/archives/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: ['AuditLogs', 'Words', 'Users', 'Stats'],
    }),
    deleteArchiveRecord: builder.mutation<any, number>({
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
