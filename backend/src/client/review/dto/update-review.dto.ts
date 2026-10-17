import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reviewId!: number;

  @ApiProperty({ minimum: 0, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  quality!: number;
}
