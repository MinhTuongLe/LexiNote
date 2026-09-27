import { ConflictException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import type { AuditService } from '../audit/audit.service';
import { DashboardWordsService } from './words.service';

describe('DashboardWordsService ownership', () => {
  const findWord = jest.fn();
  const updateWord = jest.fn();
  const findUser = jest.fn();
  const logAction = jest.fn();

  const prisma = {
    word: { findUnique: findWord, update: updateWord },
    user: { findUnique: findUser },
  } as unknown as PrismaService;
  const auditService = { logAction } as unknown as AuditService;

  let service: DashboardWordsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DashboardWordsService(prisma, auditService);
  });

  it('transfers a word and audits both owners', async () => {
    findWord.mockResolvedValue({ id: 4, word: 'hello', ownerId: 1 });
    findUser.mockResolvedValue({
      id: 2,
      fullName: 'New Owner',
      email: 'new-owner@example.com',
    });

    const result = await service.transferOwnership(4, 2);

    expect(updateWord).toHaveBeenCalledWith({
      where: { id: 4 },
      data: { ownerId: 2 },
    });
    expect(logAction).toHaveBeenCalledWith({
      action: 'WORD_TRANSFER_OWNERSHIP',
      targetType: 'WORD',
      targetId: '4',
      details: { word: 'hello', previousOwnerId: 1, newOwnerId: 2 },
    });
    expect(result).toEqual(
      expect.objectContaining({
        wordId: 4,
        newOwner: expect.objectContaining({ id: 2 }),
      }),
    );
  });

  it('validates the word, user, and duplicate ownership cases', async () => {
    findWord.mockResolvedValueOnce(null);
    await expect(service.transferOwnership(99, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    findWord.mockResolvedValueOnce({ id: 4, word: 'hello', ownerId: 1 });
    findUser.mockResolvedValueOnce(null);
    await expect(service.transferOwnership(4, 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    findWord.mockResolvedValueOnce({ id: 4, word: 'hello', ownerId: 2 });
    findUser.mockResolvedValueOnce({ id: 2 });
    await expect(service.transferOwnership(4, 2)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
