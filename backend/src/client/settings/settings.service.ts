import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VALID_WORD_TYPES } from '../word/word.constants';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true } as any,
    }) as any;

    if (!user) throw new NotFoundException('User not found');

    const currentSettings = typeof user.settings === 'object' ? user.settings : {};

    return {
      preferences: {
        darkTheme: currentSettings.darkTheme ?? false,
        soundEnabled: currentSettings.soundEnabled ?? true,
        flashcardFront: currentSettings.flashcardFront ?? 'en',
        hasSeenGuide: currentSettings.hasSeenGuide ?? false,
      },
      wordTypes: {
        system: VALID_WORD_TYPES,
        custom: currentSettings.wordTypes || [],
      },
    };
  }

  async updateSettings(userId: number, settings: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true } as any,
    }) as any;

    if (!user) throw new NotFoundException('User not found');

    const currentSettings = typeof user.settings === 'object' ? user.settings : {};
    const newSettings = { ...currentSettings, ...settings };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { settings: newSettings } as any,
    }) as any;

    return {
      settings: await this.getSettings(userId),
      message: 'Settings updated successfully! ✨',
    };
  }

  async getValidTypes(userId: number): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true } as any,
    }) as any;
    const settings = user?.settings;
    const customTypes = settings?.wordTypes?.map((t: any) => t.value) || [];
    return [...VALID_WORD_TYPES, ...customTypes];
  }
}
