import { IsIn, IsISO8601, IsOptional } from 'class-validator';

export const ANALYTICS_RANGES = ['7d', '30d', '90d', '1y'] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export class AnalyticsQueryDto {
  @IsOptional()
  @IsIn(ANALYTICS_RANGES)
  range?: AnalyticsRange;

  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @IsOptional()
  @IsISO8601()
  endDate?: string;
}
