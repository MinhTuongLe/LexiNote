import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ImportWordsDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  rawWords!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  autoEnrich?: boolean;
}
