import { dashboardApi } from './dashboardApi';

export interface SystemConfig {
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
  }),
});

export const { useGetConfigQuery, useUpdateConfigMutation } = configApi;
