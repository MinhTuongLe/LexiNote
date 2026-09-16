import { useGetSummaryQuery, useGetChartDataQuery } from '@/store/api/analyticsApi';
import { 
  Users, 
  BookOpen, 
  Activity, 
  TrendingUp 
} from 'lucide-react';
import { useMemo } from 'react';

export function useOverview() {
  const { data: stats, isLoading: isSummaryLoading, error: summaryError } = useGetSummaryQuery();
  const { data: chartData, isLoading: isChartLoading, error: chartError } = useGetChartDataQuery();

  const formatNumber = (num?: number | string | null) => {
    if (num == null) return '0';
    return new Intl.NumberFormat().format(Number(num));
  };

  const kpis = useMemo(() => [
    { 
      label: 'Total Users', 
      value: stats ? formatNumber(stats.totalUsers) : '...', 
      change: String(stats?.userChange || '+12.5%'), 
      icon: Users, 
      theme: '#f43f5e', 
      bg: 'rgba(244, 63, 94, 0.12)',
      textColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-500/10'
    },
    { 
      label: 'Word Count', 
      value: stats ? formatNumber(stats.totalWords) : '...', 
      change: String(stats?.wordChange || '+5.2%'), 
      icon: BookOpen, 
      theme: '#10b981', 
      bg: 'rgba(168, 85, 247, 0.12)',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Active Sessions', 
      value: stats ? formatNumber(stats.activeSessions) : '...', 
      change: '-2.1%', 
      icon: Activity, 
      theme: '#a855f7', 
      bg: 'rgba(168, 85, 247, 0.12)',
      textColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    { 
      label: 'Learning Points', 
      value: stats ? formatNumber(stats.totalReviews) : '...', 
      change: '+3.4%', 
      icon: TrendingUp, 
      theme: '#f59e0b', 
      bg: 'rgba(245, 158, 11, 0.12)',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
  ], [stats]);

  return {
    kpis,
    chartData: chartData || [],
    isLoading: isSummaryLoading || isChartLoading,
    error: summaryError || chartError
  };
}
