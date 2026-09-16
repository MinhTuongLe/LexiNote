import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ManagementService } from './management.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dashboard Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination and search' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.managementService.getAllUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user' })
  async createUser(@Body() body: any) {
    return this.managementService.createUser(body);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.findOne(id);
  }

  @Get('users/:id/details')
  @ApiOperation({ summary: 'Get full user details including owned words and SRS progress' })
  async getUserDetails(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.getUserDetails(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user data' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.managementService.update(id, body);
  }

  @Post('users/:id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active/inactive status' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.toggleStatus(id);
  }

  @Post('users/:id/toggle-verify')
  @ApiOperation({ summary: 'Toggle user email verification status' })
  async toggleVerify(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.toggleEmailVerified(id);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user account and related records' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.deleteUser(id);
  }
}
