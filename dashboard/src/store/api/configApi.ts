import { dashboardApi } from './dashboardApi';

export interface SystemConfig {
  isMaintenanceMode?: boolean;
  isRegistrationOpen?: boolean;
  config?: {
    isMaintenanceMode: boolean;
    isRegistrationOpen: boolean;
    rateLimit: number;
    corsEnabled: boolean;
  };
  environment?: {
    platform?: string;
    version?: string;
    [key: string]: unknown;
  };
  security?: {
    cors?: string[];
    rateLimit?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface UpdateConfigPayload {
  isMaintenanceMode?: boolean;
  isRegistrationOpen?: boolean;
  rateLimit?: number;
  corsEnabled?: boolean;
  autoBackup?: boolean;
  debugMode?: boolean;
  timestamp?: number;
  [key: string]: unknown;
}

export const configApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getConfig: builder.query<SystemConfig, void>({
      query: () => '/config',
      providesTags: ['Config'],
    }),
    updateConfig: builder.mutation<SystemConfig, UpdateConfigPayload>({
      query: (data) => ({
        url: '/config',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Config'],
    }),
    purgeExpiredTokens: builder.mutation<{ success: boolean; deletedCount: number; message: string }, void>({
      query: () => ({ url: '/cleaners/expired-tokens', method: 'POST' }),
    }),
    cleanOrphanedRecords: builder.mutation<{ success: boolean; cleanedRelationsCount: number; cleanedReviewsCount: number; message: string }, void>({
      query: () => ({ url: '/cleaners/orphaned-records', method: 'POST' }),
    }),
  }),
});

export const { useGetConfigQuery, useUpdateConfigMutation, usePurgeExpiredTokensMutation, useCleanOrphanedRecordsMutation } = configApi;
