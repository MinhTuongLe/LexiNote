import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class ImportDeckDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  words?: string[];
}
