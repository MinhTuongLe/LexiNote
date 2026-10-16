import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import type { AuditService } from '../audit/audit.service';
import type { MailService } from '../../common/mail/mail.service';
import { ManagementService } from './management.service';

describe('ManagementService SRS controls', () => {
  const findUser = jest.fn();
  const findWords = jest.fn();
  const findReviews = jest.fn();
  const updateMany = jest.fn();
  const createMany = jest.fn();
  const transaction = jest.fn();
  const logAction = jest.fn();

  const prisma = {
    user: { findUnique: findUser },
    word: { findMany: findWords },
    review: { findMany: findReviews, updateMany, createMany },
    $transaction: transaction,
  } as unknown as PrismaService;
  const auditService = { logAction } as unknown as AuditService;
  const mailService = {} as MailService;

  let service: ManagementService;

  beforeEach(() => {
    jest.clearAllMocks();
    transaction.mockResolvedValue([]);
    service = new ManagementService(prisma, auditService, mailService);
  });

  it('resets existing and missing reviews for every word owned by a user', async () => {
    findUser.mockResolvedValue({ id: 5 });
    findWords.mockResolvedValue([{ id: 10 }, { id: 11 }, { id: 12 }]);
    findReviews.mockResolvedValue([{ wordId: 10 }, { wordId: 12 }]);

    const result = await service.resetUserSrs(5, 99, 'admin@example.com');

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(transaction.mock.calls[0][0]).toHaveLength(2);
    expect(logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 99,
        actorEmail: 'admin@example.com',
        action: 'USER_RESET_SRS',
        targetType: 'User',
        targetId: '5',
        details: { userId: 5, wordsCount: 3 },
      }),
    );
    expect(result).toEqual({
      success: true,
      message: 'Reset SRS progress for 3 words belonging to user #5',
      resetCount: 3,
    });
  });

  it('returns zero when the user owns no words', async () => {
    findUser.mockResolvedValue({ id: 5 });
    findWords.mockResolvedValue([]);

    await expect(service.resetUserSrs(5)).resolves.toEqual(
      expect.objectContaining({ resetCount: 0 }),
    );
    expect(transaction).not.toHaveBeenCalled();
  });

  it('rejects resetting progress for a missing user', async () => {
    findUser.mockResolvedValue(null);

    await expect(service.resetUserSrs(404)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(findWords).not.toHaveBeenCalled();
  });
});
