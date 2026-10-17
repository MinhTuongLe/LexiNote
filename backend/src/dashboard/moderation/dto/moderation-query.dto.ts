import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ModerationFlagReason } from '@prisma/client';

export class ModerationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(['ALL', ...Object.values(ModerationFlagReason)])
  reason?: 'ALL' | ModerationFlagReason;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
