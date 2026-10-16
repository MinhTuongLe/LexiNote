import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ManagementService } from './management.service';
import type { PrismaService } from '../../prisma/prisma.service';
import type { AuditService } from '../audit/audit.service';
import type { MailService } from '../../common/mail/mail.service';

describe('ManagementService account bans', () => {
  const findUnique = jest.fn();
  const update = jest.fn();
  const deleteMany = jest.fn();
  const logAction = jest.fn();
  const sendAccountStatusChangedNotification = jest.fn();

  const prisma = {
    user: { findUnique, update },
    refreshToken: { deleteMany },
  } as unknown as PrismaService;
  const auditService = { logAction } as unknown as AuditService;
  const mailService = {
    sendAccountStatusChangedNotification,
  } as unknown as MailService;

  let service: ManagementService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ManagementService(prisma, auditService, mailService);
  });

  it('bans a user, revokes sessions, audits the reason, and sends a notice', async () => {
    findUnique.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      fullName: 'Lexi User',
    });
    update.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      fullName: 'Lexi User',
      avatar: null,
      role: 'MEMBER',
      isActive: false,
      status: 'banned',
      banReason: 'Spam activity',
      isEmailVerified: true,
      createdAt: 1n,
      updatedAt: 2n,
    });
    deleteMany.mockResolvedValue({ count: 3 });

    const result = await service.banUser(7, '  Spam activity  ');

    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 7 },
      data: { isActive: false, status: 'banned', banReason: 'Spam activity' },
    }));
    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: 7 } });
    expect(logAction).toHaveBeenCalledWith(expect.objectContaining({
      action: 'USER_BAN',
      targetId: '7',
      details: expect.objectContaining({ reason: 'Spam activity', revokedSessionsCount: 3 }),
    }));
    expect(sendAccountStatusChangedNotification).toHaveBeenCalledWith(
      'user@example.com',
      'Lexi User',
      false,
    );
    expect(result).toEqual(expect.objectContaining({ status: 'banned', revokedSessionsCount: 3 }));
  });

  it('unbans a user and clears the ban reason', async () => {
    findUnique.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      fullName: 'Lexi User',
    });
    update.mockResolvedValue({
      id: 7,
      email: 'user@example.com',
      fullName: 'Lexi User',
      avatar: null,
      role: 'MEMBER',
      isActive: true,
      status: 'active',
      banReason: null,
      isEmailVerified: true,
      createdAt: 1n,
      updatedAt: 2n,
    });

    const result = await service.unbanUser(7);

    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 7 },
      data: { isActive: true, status: 'active', banReason: null },
    }));
    expect(logAction).toHaveBeenCalledWith(expect.objectContaining({
      action: 'USER_UNBAN',
      targetId: '7',
    }));
    expect(sendAccountStatusChangedNotification).toHaveBeenCalledWith(
      'user@example.com',
      'Lexi User',
      true,
    );
    expect(result).toEqual(expect.objectContaining({ status: 'active', banReason: null }));
  });

  it('rejects missing users and blank ban reasons', async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(service.banUser(99, 'Spam')).rejects.toBeInstanceOf(NotFoundException);

    findUnique.mockResolvedValueOnce({
      id: 7,
      email: 'user@example.com',
      fullName: 'Lexi User',
    });
    await expect(service.banUser(7, '   ')).rejects.toBeInstanceOf(BadRequestException);
  });
});
