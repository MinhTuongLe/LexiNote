import { IsOptional, IsString, MaxLength } from 'class-validator';

export class DeckQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
