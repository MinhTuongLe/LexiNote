import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ModerationFlagReason } from '@prisma/client';

export class ModerationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 20;

  @IsOptional()
  @IsIn(['ALL', ...Object.values(ModerationFlagReason)])
  reason?: 'ALL' | ModerationFlagReason;

  @IsOptional()
  @IsString()
  search?: string;
}
