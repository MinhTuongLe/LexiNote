import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SystemConfigPage from './SystemConfigPage';

const updateConfig = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
const purgeExpiredTokens = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ deletedCount: 3 }) });
const cleanOrphanedRecords = vi.fn().mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ cleanedRelationsCount: 1, cleanedReviewsCount: 2 }) });

vi.mock('@/store/api/configApi', () => ({
  useGetConfigQuery: () => ({
    data: {
      isMaintenanceMode: false,
      isRegistrationOpen: true,
      config: { rateLimit: 100, corsEnabled: true },
      environment: { platform: 'Node.js', version: '22' },
      security: { cors: [] },
    },
    isLoading: false,
  }),
  useUpdateConfigMutation: () => [updateConfig],
  usePurgeExpiredTokensMutation: () => [purgeExpiredTokens],
  useCleanOrphanedRecordsMutation: () => [cleanOrphanedRecords],
}));

vi.mock('@/store/api/analyticsApi', () => ({
  useGetServerHealthQuery: () => ({
    data: {
      data: {
        memory: { heapUsedMB: 10, heapTotalMB: 20, rssMB: 30, usagePercentage: 50 },
        uptimeFormatted: '1d 0h 0m 0s',
      },
    },
  }),
}));

describe('SystemConfigPage', () => {
  it('renders maintenance and registration controls', () => {
    render(<SystemConfigPage />);

    expect(screen.getByLabelText('Maintenance mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Registration open')).toBeInTheDocument();
    expect(screen.getByText('Server Health')).toBeInTheDocument();
  });

  it('renders infrastructure cleaner actions', () => {
    render(<SystemConfigPage />);

    expect(screen.getByRole('button', { name: 'Purge expired tokens' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clean orphaned records' })).toBeInTheDocument();
  });
});
