import { dashboardApi } from './dashboardApi';

export const configApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getConfig: builder.query<any, void>({
      query: () => '/config',
      providesTags: ['Config'],
    }),
    updateConfig: builder.mutation<any, any>({
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
