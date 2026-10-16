import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectWordDto {
  @ApiProperty({ example: 'Meaning is inaccurate or violates content policy' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class RequestEditDto {
  @ApiProperty({ example: 'Please add an example sentence and correct the translation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  note!: string;
}
