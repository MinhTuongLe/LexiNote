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

  const formatNumber = (num: number | string) => {
    return new Intl.NumberFormat().format(Number(num));
  };

  const kpis = useMemo(() => [
    { 
      label: 'Total Users', 
      value: stats ? formatNumber(stats.totalUsers) : '...', 
      change: stats?.userChange || '+12.5%', 
      icon: Users, 
      theme: '#6366f1', 
      bg: 'rgba(99, 102, 241, 0.12)',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-500/10'
    },
    { 
      label: 'Word Count', 
      value: stats ? formatNumber(stats.totalWords) : '...', 
      change: stats?.wordChange || '+5.2%', 
      icon: BookOpen, 
      theme: '#10b981', 
      bg: 'rgba(16, 185, 129, 0.12)',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    { 
      label: 'Active Sessions', 
      value: stats ? formatNumber(stats.activeSessions) : '...', 
      change: '-2.1%', 
      icon: Activity, 
      theme: '#8b5cf6', 
      bg: 'rgba(139, 92, 246, 0.12)',
      textColor: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-500/10'
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
