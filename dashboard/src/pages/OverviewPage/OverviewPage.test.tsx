import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OverviewPage from './OverviewPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ToastProvider } from '@/components/ui/Toast';

// Mocking recharts because it doesn't work well in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  defs: () => <div />,
  linearGradient: () => <div />,
  stop: () => <div />,
}));

// Mock useOverview hook
vi.mock('./useOverview', () => ({
  useOverview: vi.fn(() => ({
    kpis: [
      { label: 'Total Users', value: '1,000', change: '+12.5%', icon: () => null, bg: '#fff', theme: '#000' },
      { label: 'Word Count', value: '5,000', change: '+5.2%', icon: () => null, bg: '#fff', theme: '#000' },
    ],
    srsStats: undefined,
    chartData: [],
    isLoading: false,
    error: null,
  })),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  </Provider>
);

describe('OverviewPage', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('renders correctly and shows heading', () => {
    render(<OverviewPage />, { wrapper });
    expect(screen.getByText('System Overview')).toBeInTheDocument();
  });

  it('displays loading state or initial stats', () => {
    render(<OverviewPage />, { wrapper });
    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('5,000')).toBeInTheDocument();
  });
});
