import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { GameType } from '@prisma/client';

export class LeaderboardQueryDto {
  @IsOptional()
  @IsEnum(GameType)
  gameType?: GameType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;
}
