import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VALID_WORD_TYPES } from '../word/word.constants';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: number) {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true } as any,
    })) as any;

    if (!user) throw new NotFoundException('User not found');

    const currentSettings =
      user.settings && typeof user.settings === 'object' ? user.settings : {};

    const storedWordTypes = currentSettings.wordTypes;
    const customWordTypes = Array.isArray(storedWordTypes)
      ? storedWordTypes
      : storedWordTypes && typeof storedWordTypes === 'object' && Array.isArray(storedWordTypes.custom)
        ? storedWordTypes.custom
        : [];

    return {
      preferences: {
        darkTheme: currentSettings.darkTheme ?? false,
        soundEnabled: currentSettings.soundEnabled ?? true,
        flashcardFront: currentSettings.flashcardFront ?? 'en',
        hasSeenGuide: currentSettings.hasSeenGuide ?? false,
      },
      wordTypes: {
        system: VALID_WORD_TYPES,
        custom: customWordTypes,
      },
      audio: {
        autoSpeak: currentSettings.audio?.autoSpeak ?? true,
        voiceLang: currentSettings.audio?.voiceLang ?? 'en-US',
        rate: currentSettings.audio?.rate ?? 1,
        pitch: currentSettings.audio?.pitch ?? 1,
      },
      learning: {
        monthlyGoalDays: currentSettings.learning?.monthlyGoalDays ?? 20,
      },
      profile: currentSettings.profile && typeof currentSettings.profile === 'object'
        ? currentSettings.profile
        : {},
    };
  }

  async updateSettings(userId: number, settings: any) {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true } as any,
    })) as any;

    if (!user) throw new NotFoundException('User not found');

    const currentSettings =
      user.settings && typeof user.settings === 'object' ? user.settings : {};
    const normalizedSettings = { ...settings };
    if (settings.wordTypes && !Array.isArray(settings.wordTypes)) {
      normalizedSettings.wordTypes = Array.isArray(settings.wordTypes.custom)
        ? settings.wordTypes.custom
        : [];
    }
    const newSettings = {
      ...currentSettings,
      ...normalizedSettings,
      ...(settings.audio
        ? {
            audio: {
              ...(currentSettings.audio || {}),
              ...settings.audio,
            },
          }
        : {}),
      ...(settings.learning
        ? {
            learning: {
              ...(currentSettings.learning || {}),
              ...settings.learning,
            },
          }
        : {}),
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: { settings: newSettings } as any,
    });

    return {
      settings: await this.getSettings(userId),
      message: 'Settings updated successfully! ✨',
    };
  }

  async getValidTypes(userId: number): Promise<string[]> {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true } as any,
    })) as any;
    const settings = user?.settings;
    const storedWordTypes = settings?.wordTypes;
    const customTypes = Array.isArray(storedWordTypes)
      ? storedWordTypes.map((type: any) => type.value)
      : storedWordTypes && typeof storedWordTypes === 'object' && Array.isArray(storedWordTypes.custom)
        ? storedWordTypes.custom.map((type: any) => type.value)
        : [];
    return [...VALID_WORD_TYPES, ...customTypes];
  }

  async deactivateAccount(userId: number) {
    // 1. Delete all user data
    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
      // Delete child records first to avoid foreign key constraint errors
      this.prisma.review.deleteMany({ where: { word: { ownerId: userId } } }),
      this.prisma.wordRelation.deleteMany({
        where: { word: { ownerId: userId } },
      }),
      // Now delete words
      this.prisma.word.deleteMany({ where: { ownerId: userId } }),
      // Update user status
      this.prisma.user.update({
        where: { id: userId },
        data: {
          status: 'deleted',
          settings: {},
          fullName: 'Deleted User',
          email: `deleted_${userId}_${Date.now()}@lexinote.internal`, // Free up original email
          password: 'DEACTIVATED_ACCOUNT', // Scramble password
        },
      }),
    ]);

    return { message: 'Account deactivated and data wiped successfully! 👋' };
  }
}
