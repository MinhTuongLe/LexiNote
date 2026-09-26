import { dashboardApi } from './dashboardApi';

export interface HardestWord {
  id: number;
  word: string;
  meaningVi: string;
  type: string;
  correctCount: number;
  wrongCount: number;
  easeFactor: number;
}

export interface SrsStats {
  totalCorrect: number;
  totalWrong: number;
  retentionRate: number;
  avgEaseFactor: number;
  hardestWords: HardestWord[];
}

export interface AnalyticsSummary {
  totalUsers?: number;
  totalWords?: number;
  activeUsers?: number;
  activeSessions?: number;
  totalReviews?: number;
  userChange?: string;
  wordChange?: string;
  retentionRate?: number;
  srsStats?: SrsStats;
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
    getChartData: builder.query<ChartDataPoint[], { range?: string } | void>({
      query: (params) => ({
        url: '/analytics/chart',
        params: params || undefined,
      }),
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
