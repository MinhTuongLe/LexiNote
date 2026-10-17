import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BulkDeleteWordsDto {
  @IsArray()
  @ArrayMaxSize(100)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  wordIds!: number[];
}

export class ImportedWordDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  word!: string;

  @IsString()
  @MaxLength(2000)
  meaningVi!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  example?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;
}

export class BulkImportWordsDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ImportedWordDto)
  words!: ImportedWordDto[];
}
