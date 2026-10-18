import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AudioSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoSpeak?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  voiceLang?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(3)
  rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  pitch?: number;
}

export class LearningSettingsDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 31 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  monthlyGoalDays?: number;
}

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

  @ApiPropertyOptional()
  @IsOptional()
  wordTypes?: any[] | { custom?: any[] };

  @ApiPropertyOptional({ type: AudioSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AudioSettingsDto)
  audio?: AudioSettingsDto;

  @ApiPropertyOptional({ type: LearningSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => LearningSettingsDto)
  learning?: LearningSettingsDto;
}
