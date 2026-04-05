import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  darkTheme?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flashcardFront?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasSeenGuide?: boolean;
}
