import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMaintenanceMode?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRegistrationOpen?: boolean;

  @ApiPropertyOptional({ minimum: 1, maximum: 10000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  rateLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  corsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  debugMode?: boolean;
}
