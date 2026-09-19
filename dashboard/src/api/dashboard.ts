import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  totalUsers: number;
  totalWords: number;
}

const API_BASE_URL = 'http://localhost:1337/api/v1';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE_URL}/dashboard/analytics/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
  });
}
