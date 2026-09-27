import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { MailService } from '../../common/mail/mail.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { AuditService } from '../audit/audit.service';
import { ModerationService } from './moderation.service';

describe('ModerationService decisions', () => {
  const findUnique = jest.fn();
  const update = jest.fn();
  const logAction = jest.fn();
  const sendWordModerationNotification = jest.fn();

  const prisma = { word: { findUnique, update } } as unknown as PrismaService;
  const auditService = { logAction } as unknown as AuditService;
  const mailService = {
    sendWordModerationNotification,
  } as unknown as MailService;

  let service: ModerationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ModerationService(prisma, auditService, mailService);
  });

  it('rejects a word, audits the reason, and notifies its owner', async () => {
    findUnique.mockResolvedValue({
      id: 12,
      word: 'spammy',
      owner: { email: 'owner@example.com', fullName: 'Word Owner' },
    });

    const result = await service.reject(12, '  Not appropriate  ');

    expect(update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: {
        moderationStatus: 'REJECTED',
        rejectReason: 'Not appropriate',
      },
    });
    expect(logAction).toHaveBeenCalledWith({
      action: 'WORD_MODERATION_REJECT',
      targetType: 'WORD',
      targetId: '12',
      details: { reason: 'Not appropriate' },
    });
    expect(sendWordModerationNotification).toHaveBeenCalledWith(
      'owner@example.com',
      'Word Owner',
      'REJECTED',
      'Not appropriate',
    );
    expect(result).toEqual(
      expect.objectContaining({
        wordId: 12,
        moderationStatus: 'REJECTED',
      }),
    );
  });

  it('requests an edit and stores the note as the rejection reason', async () => {
    findUnique.mockResolvedValue({
      id: 12,
      owner: { email: 'owner@example.com', fullName: 'Word Owner' },
    });

    await service.requestEdit(12, '  Add an example sentence  ');

    expect(update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: {
        moderationStatus: 'NEEDS_EDIT',
        rejectReason: 'Add an example sentence',
      },
    });
    expect(logAction).toHaveBeenCalledWith({
      action: 'WORD_MODERATION_REQUEST_EDIT',
      targetType: 'WORD',
      targetId: '12',
      details: { note: 'Add an example sentence' },
    });
  });

  it('rejects missing words and blank decisions', async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(service.reject(999, 'Invalid')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    await expect(service.requestEdit(12, '   ')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
