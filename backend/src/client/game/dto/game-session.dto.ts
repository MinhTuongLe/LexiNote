import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { GameType } from '@prisma/client';

export class GameSessionDto {
  @IsEnum(GameType)
  gameType!: GameType;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  score!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(86400)
  timeSpentSeconds!: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(100)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  wordIds!: number[];
}
