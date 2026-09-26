import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, Min } from 'class-validator';
import { GameType } from '@prisma/client';

export class GameSessionDto {
  @IsEnum(GameType)
  gameType!: GameType;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  score!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  timeSpentSeconds!: number;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  wordIds!: number[];
}
