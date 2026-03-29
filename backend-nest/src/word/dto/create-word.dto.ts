import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWordDto {
  @ApiProperty()
  @IsString()
  word: string;

  @ApiProperty()
  @IsString()
  meaningVi: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  example?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  antonyms?: string[];
}
