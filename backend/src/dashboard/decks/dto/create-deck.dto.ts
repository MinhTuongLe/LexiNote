import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateDeckWordDto {
  @IsString()
  @MaxLength(100)
  word!: string;

  @IsString()
  meaningVi!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  phonetic?: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;
}

export class CreateDeckDto {
  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  level?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeckWordDto)
  words!: CreateDeckWordDto[];
}
