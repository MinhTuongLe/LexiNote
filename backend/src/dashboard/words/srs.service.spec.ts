import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import type { AuditService } from '../audit/audit.service';
import { DashboardWordsService } from './words.service';

describe('DashboardWordsService SRS controls', () => {
  const findUnique = jest.fn();
  const findMany = jest.fn();
  const upsert = jest.fn();
  const logAction = jest.fn();

  const prisma = {
    word: { findUnique, findMany },
    review: { upsert },
  } as unknown as PrismaService;
  const auditService = { logAction } as unknown as AuditService;

  let service: DashboardWordsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DashboardWordsService(prisma, auditService);
  });

  it('resets an existing word review and writes an audit event', async () => {
    findUnique.mockResolvedValue({ id: 8, word: 'serendipity' });
    upsert.mockResolvedValue({
      wordId: 8,
      interval: 0,
      easeFactor: 2.5,
      correctCount: 0,
      wrongCount: 0,
      lastReviewed: null,
      nextReview: 1727450000000n,
    });

    const result = await service.resetWordSrs(8, 99, 'admin@example.com');

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { wordId: 8 },
        update: expect.objectContaining({
          interval: 0,
          easeFactor: 2.5,
          correctCount: 0,
          wrongCount: 0,
          lastReviewed: null,
        }),
      }),
    );
    expect(logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 99,
        actorEmail: 'admin@example.com',
        action: 'WORD_RESET_SRS',
        targetType: 'Word',
        targetId: '8',
        details: { wordId: 8, word: 'serendipity' },
      }),
    );
    expect(result.review).toEqual(
      expect.objectContaining({ wordId: 8, nextReview: '1727450000000' }),
    );
  });

  it('rejects resetting a word that does not exist', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.resetWordSrs(404)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(upsert).not.toHaveBeenCalled();
  });

  it('returns sorted distinct non-empty word types', async () => {
    findMany.mockResolvedValue([
      { type: 'verb' },
      { type: 'noun' },
      { type: 'verb' },
      { type: ' noun ' },
      { type: ' ' },
    ]);

    await expect(service.getDistinctWordTypes()).resolves.toEqual([
      'noun',
      'verb',
    ]);
  });
});
