import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let prisma: PrismaService;

  const mockPrisma = {
    word: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getStudyStats', () => {
    it('should return mock fallback if no words exist', async () => {
      mockPrisma.word.count.mockResolvedValue(0);
      mockPrisma.review.findMany.mockResolvedValue([]);
      
      const stats = await service.getStudyStats(1);
      
      expect(stats.streak).toBe(12); // Fallback value
      expect(stats.totalReviewed).toBe(208); // Fallback value
    });

    it('should calculate correct mastery breakdown', async () => {
      mockPrisma.word.count.mockResolvedValue(3);
      mockPrisma.review.findMany.mockResolvedValue([
        { 
          correctCount: 10, 
          interval: 30, 
          easeFactor: 2.5, 
          lastReviewed: BigInt(Date.now()),
          word: { type: 'noun' } 
        },
        { 
          correctCount: 2, 
          interval: 5, 
          easeFactor: 2.3, 
          lastReviewed: BigInt(Date.now()),
          word: { type: 'verb' } 
        },
        { 
          correctCount: 0, 
          interval: 0, 
          easeFactor: 2.5, 
          lastReviewed: null,
          word: { type: 'adj' } 
        },
      ]);
      
      // Mock streak and activity to avoid nested complexity in this unit test
      jest.spyOn(service, 'getStreak').mockResolvedValue(5);
      jest.spyOn(service, 'getActivityData').mockResolvedValue([]);

      const stats = await service.getStudyStats(1);

      expect(stats.masteredCount).toBe(1);
      expect(stats.learningCount).toBe(1);
      expect(stats.newCount).toBe(1);
      expect(stats.totalReviewed).toBe(2);
    });
  });

  describe('getStreak', () => {
    it('should return 0 if no reviews exist', async () => {
      mockPrisma.review.findMany.mockResolvedValue([]);
      const streak = await service.getStreak(1);
      expect(streak).toBe(0);
    });

    it('should calculate correct streak for consecutive days', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 86400000);
      const dayBefore = new Date(today.getTime() - 86400000 * 2);

      mockPrisma.review.findMany.mockResolvedValue([
        { lastReviewed: BigInt(today.getTime()) },
        { lastReviewed: BigInt(yesterday.getTime()) },
        { lastReviewed: BigInt(dayBefore.getTime()) },
      ]);

      const streak = await service.getStreak(1);
      expect(streak).toBe(3);
    });

    it('should return 0 if last review was long ago', async () => {
      const longAgo = new Date(Date.now() - 86400000 * 3);
      mockPrisma.review.findMany.mockResolvedValue([
        { lastReviewed: BigInt(longAgo.getTime()) },
      ]);

      const streak = await service.getStreak(1);
      expect(streak).toBe(0);
    });
  });

  describe('getActivityData', () => {
    it('should group reviews by date correctly', async () => {
      // Use UTC dates to be timezone-independent
      const jan1 = Date.UTC(2025, 0, 1);
      const jan2 = Date.UTC(2025, 0, 2);

      mockPrisma.review.findMany.mockResolvedValue([
        { lastReviewed: BigInt(jan1) },
        { lastReviewed: BigInt(jan1) },
        { lastReviewed: BigInt(jan2) },
      ]);

      const activity = await service.getActivityData(1, 2025, 0);
      
      const day1 = activity.find(a => a.date === '2025-01-01');
      const day2 = activity.find(a => a.date === '2025-01-02');

      expect(day1?.count).toBe(2);
      expect(day2?.count).toBe(1);
    });
  });
});
