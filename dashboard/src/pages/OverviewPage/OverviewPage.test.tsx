import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OverviewPage from './OverviewPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('OverviewPage', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    
    // Mock global fetch
    global.fetch = vi.fn();
  });

  it('renders correctly and shows heading', () => {
    render(<OverviewPage />, { wrapper });
    expect(screen.getByText('System Overview')).toBeInTheDocument();
  });

  it('displays loading state or initial stats', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ totalUsers: 1000, totalWords: 5000 }),
    });

    render(<OverviewPage />, { wrapper });
    
    // Check if stats are rendered after fetch (using wait since it's in useEffect now)
    // Note: The current implementation uses fetch in useEffect, 
    // we want to move it to React Query.
    await waitFor(() => {
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('5,000')).toBeInTheDocument();
    });
  });
});
