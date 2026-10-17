import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportAuditQueryDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsIn(['csv'])
  format?: 'csv';
}
