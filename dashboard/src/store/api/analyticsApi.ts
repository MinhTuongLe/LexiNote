import { dashboardApi } from './dashboardApi';

export const analyticsApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query<any, void>({
      query: () => '/analytics/summary',
      providesTags: ['Stats'],
    }),
    getChartData: builder.query<any, void>({
      query: () => '/analytics/chart',
      providesTags: ['Stats'],
    }),
  }),
});

export const { useGetSummaryQuery, useGetChartDataQuery } = analyticsApi;
