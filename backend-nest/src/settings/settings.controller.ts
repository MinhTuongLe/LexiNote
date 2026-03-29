import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user settings' })
  async getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user settings' })
  async updateSettings(@Request() req: any, @Body() body: UpdateSettingsDto) {
    return this.settingsService.updateSettings(req.user.userId, body);
  }
}
