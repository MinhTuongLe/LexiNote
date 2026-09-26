import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { ManagementService } from './management.service';
import { JwtAuthGuard } from '../../client/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { toCsv } from '../../common/export/csv.util';
import { ExportUsersQueryDto } from './dto/export-users-query.dto';

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

  @Get('users/export')
  @ApiOperation({ summary: 'Export users and learning statistics' })
  async exportUsers(
    @Query() query: ExportUsersQueryDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const users = await this.managementService.exportUsers(
      query.isActive,
      query.role,
    );
    response.header('Content-Type', 'text/csv; charset=utf-8');
    response.header(
      'Content-Disposition',
      `attachment; filename="lexinote_export_users_${Date.now()}.csv"`,
    );
    return toCsv(
      [
        'id',
        'email',
        'fullName',
        'role',
        'isActive',
        'isEmailVerified',
        'createdAt',
        'wordCount',
        'reviewsCount',
      ],
      users,
    );
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user' })
  async createUser(
    @Body()
    body: {
      fullName: string;
      email: string;
      password?: string;
      role?: Role;
    },
  ) {
    return this.managementService.createUser(body);
  }

  @Post('users/:id/reset-password')
  @ApiOperation({
    summary:
      'Reset user password to default (123456) and revoke active sessions',
  })
  async resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.resetPassword(id);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.findOne(id);
  }

  @Get('users/:id/details')
  @ApiOperation({
    summary: 'Get full user details including owned words and SRS progress',
  })
  async getUserDetails(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.getUserDetails(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user data' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      fullName?: string;
      email?: string;
      role?: Role;
      isActive?: boolean;
    },
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

  @Get('users/:id/sessions')
  @ApiOperation({ summary: 'Get active login sessions for user' })
  async getUserSessions(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.getUserSessions(id);
  }

  @Delete('users/:id/sessions')
  @ApiOperation({ summary: 'Revoke all sessions for user (Force logout)' })
  async revokeAllUserSessions(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.revokeAllUserSessions(id);
  }

  @Delete('users/sessions/:sessionId')
  @ApiOperation({ summary: 'Revoke specific refresh token session' })
  async revokeSession(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.managementService.revokeSession(sessionId);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role (ADMIN or MEMBER)' })
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: Role },
  ) {
    return this.managementService.updateUserRole(id, body.role);
  }

  @Get('mail-preview')
  @ApiOperation({ summary: 'Get rendered HTML preview of email templates' })
  getMailPreview(
    @Query('type') type?: string,
    @Query('fullName') fullName?: string,
    @Query('code') code?: string,
  ) {
    return this.managementService.getMailPreview(
      type || 'admin_reset',
      fullName,
      code,
    );
  }
}
