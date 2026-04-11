import { Controller, Get } from '@nestjs/common';
import { ManagementService } from './management.service';

@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Get('users')
  async getUsers() {
    return this.managementService.getAllUsers();
  }
}
