import { IsIn, IsOptional } from 'class-validator';
import { AnalyticsQueryDto } from './analytics-query.dto';

export class AnalyticsExportQueryDto extends AnalyticsQueryDto {
  @IsOptional()
  @IsIn(['csv'])
  format?: 'csv';
}
