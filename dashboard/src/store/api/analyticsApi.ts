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
  activeUsers?: number;
  newUsers?: number;
  newWords?: number;
  reviewsCount?: number;
  [key: string]: unknown;
}

export interface ServerHealth {
  success: boolean;
  data: {
    memory: {
      heapUsedMB: number;
      heapTotalMB: number;
      rssMB: number;
      usagePercentage: number;
    };
    uptimeSeconds: number;
    uptimeFormatted: string;
    nodeVersion: string;
    platform: string;
    timestamp: number;
  };
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
        url: '/analytics/traffic',
        params: params || undefined,
      }),
      providesTags: ['Stats'],
    }),
    getRecentActivity: builder.query<ActivityItem[], void>({
      query: () => '/analytics/activity',
      providesTags: ['Stats'],
    }),
    getServerHealth: builder.query<ServerHealth, void>({
      query: () => '/analytics/server-health',
      providesTags: ['Health'],
    }),
  }),
});

export const { 
  useGetSummaryQuery, 
  useGetChartDataQuery, 
  useGetRecentActivityQuery,
  useGetServerHealthQuery,
} = analyticsApi;
