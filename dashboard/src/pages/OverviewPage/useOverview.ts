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
      theme: '#009ef7', 
      bg: '#f1faff' 
    },
    { 
      label: 'Word Count', 
      value: stats ? formatNumber(stats.totalWords) : '...', 
      change: stats?.wordChange || '+5.2%', 
      icon: BookOpen, 
      theme: '#50cd89', 
      bg: '#e8fff3' 
    },
    { 
      label: 'Active Sessions', 
      value: stats ? formatNumber(stats.activeSessions) : '...', 
      change: '-2.1%', 
      icon: Activity, 
      theme: '#7239ea', 
      bg: '#f8f5ff' 
    },
    { 
      label: 'Learning Points', 
      value: stats ? formatNumber(stats.totalReviews) : '...', 
      change: '+3.4%', 
      icon: TrendingUp, 
      theme: '#ffc700', 
      bg: '#fff8dd' 
    },
  ], [stats]);

  return {
    kpis,
    chartData: chartData || [],
    isLoading: isSummaryLoading || isChartLoading,
    error: summaryError || chartError
  };
}
