import { Test, TestingModule } from '@nestjs/testing';
import { MetaController } from './meta.controller';
import { WordService } from '../client/word/word.service';

describe('MetaController', () => {
  let controller: MetaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetaController],
      providers: [
        {
          provide: WordService,
          useValue: { getDashboardStats: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<MetaController>(MetaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
