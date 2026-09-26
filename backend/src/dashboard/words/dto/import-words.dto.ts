import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class ImportWordsDto {
  @IsString()
  @MinLength(1)
  rawWords!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  autoEnrich?: boolean;
}
