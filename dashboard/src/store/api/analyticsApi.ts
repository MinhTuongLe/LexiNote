import { dashboardApi } from './dashboardApi';

export interface AnalyticsSummary {
  totalUsers?: number;
  totalWords?: number;
  activeUsers?: number;
  activeSessions?: number;
  totalReviews?: number;
  userChange?: string;
  wordChange?: string;
  retentionRate?: number;
  [key: string]: unknown;
}

export interface ChartDataPoint {
  date: string;
  count: number;
  [key: string]: unknown;
}

export interface ActivityItem {
  id: number;
  description: string;
  createdAt: string;
  [key: string]: unknown;
}

export const analyticsApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query<AnalyticsSummary, void>({
      query: () => '/analytics/summary',
      providesTags: ['Stats'],
    }),
    getChartData: builder.query<ChartDataPoint[], void>({
      query: () => '/analytics/chart',
      providesTags: ['Stats'],
    }),
    getRecentActivity: builder.query<ActivityItem[], void>({
      query: () => '/analytics/activity',
      providesTags: ['Stats'],
    }),
  }),
});

export const { 
  useGetSummaryQuery, 
  useGetChartDataQuery, 
  useGetRecentActivityQuery 
} = analyticsApi;
