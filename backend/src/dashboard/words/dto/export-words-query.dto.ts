import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class ExportWordsQueryDto {
  @IsOptional()
  @IsIn(['csv', 'json'])
  format?: 'csv' | 'json';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Transform((params) =>
    params.value !== undefined && params.value !== null && params.value !== ''
      ? Number(params.value)
      : undefined,
  )
  @IsInt()
  ownerId?: number;
}
