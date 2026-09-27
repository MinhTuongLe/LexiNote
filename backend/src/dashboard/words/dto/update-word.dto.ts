import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDashboardWordDto {
  @ApiPropertyOptional({ example: 'sự tình cờ may mắn' })
  @IsOptional()
  @IsString()
  meaningVi?: string;

  @ApiPropertyOptional({ example: 'noun' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @ApiPropertyOptional({ example: 'They met by serendipity.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  example?: string;

  @ApiPropertyOptional({ example: '/ˌser.ənˈdip.ə.ti/' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  phonetic?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/audio/serendipity.mp3' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  audioUrl?: string;
}
