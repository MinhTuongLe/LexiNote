import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsJWT()
  refreshToken!: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  @IsJWT()
  refreshToken?: string;
}
