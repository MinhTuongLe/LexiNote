import { Test, TestingModule } from '@nestjs/testing';
import { WordService } from './word.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { ReviewService } from '../review/review.service';

describe('WordService', () => {
  let service: WordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: SettingsService,
          useValue: { getValidTypes: jest.fn() },
        },
        {
          provide: ReviewService,
          useValue: { getStudyStats: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WordService>(WordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
