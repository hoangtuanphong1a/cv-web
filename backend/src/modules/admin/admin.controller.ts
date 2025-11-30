import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleName } from '../common/entities/role.entity';

@ApiTags('Admin Dashboard')
@Controller('admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles(RoleName.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===== DASHBOARD OVERVIEW =====
  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get admin dashboard overview statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview statistics',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active: { type: 'number' },
            newToday: { type: 'number' },
          },
        },
        jobs: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active: { type: 'number' },
            newToday: { type: 'number' },
          },
        },
        companies: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            active: { type: 'number' },
            newToday: { type: 'number' },
          },
        },
        applications: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            pending: { type: 'number' },
            newToday: { type: 'number' },
          },
        },
        revenue: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            thisMonth: { type: 'number' },
            growth: { type: 'number' },
          },
        },
        system: {
          type: 'object',
          properties: {
            uptime: { type: 'number' },
            memoryUsage: { type: 'number' },
            diskUsage: { type: 'number' },
          },
        },
      },
    },
  })
  async getDashboardOverview() {
    return this.adminService.getDashboardOverview();
  }

  @Get('dashboard/charts')
  @ApiOperation({ summary: 'Get dashboard charts data' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['7d', '30d', '90d', '1y'],
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard charts data for analytics',
  })
  async getDashboardCharts(@Query('period') period: string = '30d') {
    return this.adminService.getDashboardCharts(period);
  }

  // ===== USER MANAGEMENT =====
  @Get('users')
  @ApiOperation({ summary: 'Get all users with admin controls' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: RoleName })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'banned'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of users with admin information',
  })
  async getAllUsers(@Query() query: any) {
    return this.adminService.getAllUsers(query);
  }

  @Get('users/:id/details')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Get detailed user information for admin' })
  @ApiResponse({ status: 200, description: 'Detailed user information' })
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Put('users/:id/status')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Update user status (activate/deactivate/ban)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive', 'banned'] },
        reason: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.adminService.updateUserStatus(id, body.status, body.reason);
  }

  @Put('users/:id/role')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Update user role' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: Object.values(RoleName) },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: RoleName },
  ) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Delete('users/:id')
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    await this.adminService.deleteUser(id);
  }

  // ===== JOB MANAGEMENT =====
  @Get('jobs')
  @ApiOperation({ summary: 'Get all jobs for admin management' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['draft', 'published', 'closed', 'expired'],
  })
  @ApiQuery({ name: 'company', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of jobs with admin controls' })
  async getAllJobs(@Query() query: any) {
    return this.adminService.getAllJobs(query);
  }

  @Put('jobs/:id/status')
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiOperation({ summary: 'Update job status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'published', 'closed', 'expired'],
        },
        reason: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Job status updated successfully' })
  async updateJobStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.adminService.updateJobStatus(id, body.status, body.reason);
  }

  @Delete('jobs/:id')
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiOperation({ summary: 'Delete job (admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Job deleted successfully' })
  async deleteJob(@Param('id') id: string) {
    await this.adminService.deleteJob(id);
  }

  // ===== COMPANY MANAGEMENT =====
  @Get('companies')
  @ApiOperation({ summary: 'Get all companies for admin management' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of companies with admin controls',
  })
  async getAllCompanies(@Query() query: any) {
    return this.adminService.getAllCompanies(query);
  }

  @Put('companies/:id/status')
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiOperation({ summary: 'Update company status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
        reason: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Company status updated successfully',
  })
  async updateCompanyStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reason?: string },
  ) {
    return this.adminService.updateCompanyStatus(id, body.status, body.reason);
  }

  @Delete('companies/:id')
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiOperation({ summary: 'Delete company (admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Company deleted successfully' })
  async deleteCompany(@Param('id') id: string) {
    await this.adminService.deleteCompany(id);
  }

  // ===== APPLICATION MANAGEMENT =====
  @Get('applications')
  @ApiOperation({ summary: 'Get all applications for admin review' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'pending',
      'reviewing',
      'shortlisted',
      'interviewed',
      'offered',
      'hired',
      'rejected',
    ],
  })
  @ApiQuery({ name: 'jobId', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of applications with admin controls',
  })
  async getAllApplications(@Query() query: any) {
    return this.adminService.getAllApplications(query);
  }

  @Put('applications/:id/status')
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiOperation({ summary: 'Update application status (admin override)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: [
            'pending',
            'reviewing',
            'shortlisted',
            'interviewed',
            'offered',
            'hired',
            'rejected',
          ],
        },
        notes: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
  })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.adminService.updateApplicationStatus(
      id,
      body.status,
      body.notes,
    );
  }

  // ===== CONTENT MANAGEMENT =====
  @Get('content/skills')
  @ApiOperation({ summary: 'Get all skills for admin management' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of skills with usage statistics',
  })
  async getAllSkills(@Query() query: any) {
    return this.adminService.getAllSkills(query);
  }

  @Post('content/skills')
  @ApiOperation({ summary: 'Create new skill' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  async createSkill(
    @Body() body: { name: string; description?: string; category?: string },
  ) {
    return this.adminService.createSkill(body);
  }

  @Put('content/skills/:id')
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiOperation({ summary: 'Update skill' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Skill updated successfully' })
  async updateSkill(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; category?: string },
  ) {
    return this.adminService.updateSkill(id, body);
  }

  @Delete('content/skills/:id')
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiOperation({ summary: 'Delete skill' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Skill deleted successfully' })
  async deleteSkill(@Param('id') id: string) {
    await this.adminService.deleteSkill(id);
  }

  @Get('content/job-categories')
  @ApiOperation({ summary: 'Get all job categories for admin management' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of job categories with statistics',
  })
  async getAllJobCategories(@Query() query: any) {
    return this.adminService.getAllJobCategories(query);
  }

  // ===== SYSTEM MANAGEMENT =====
  @Get('system/info')
  @ApiOperation({ summary: 'Get system information and health status' })
  @ApiResponse({
    status: 200,
    description: 'System information and health status',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string' },
        uptime: { type: 'number' },
        memory: { type: 'object' },
        database: { type: 'object' },
        environment: { type: 'string' },
      },
    },
  })
  async getSystemInfo() {
    return this.adminService.getSystemInfo();
  }

  @Post('system/maintenance')
  @ApiOperation({ summary: 'Run system maintenance tasks' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          enum: [
            'cleanup-expired-jobs',
            'cleanup-old-notifications',
            'reindex-database',
            'backup-database',
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance task executed successfully',
  })
  async runMaintenance(@Body() body: { task: string }) {
    return this.adminService.runMaintenanceTask(body.task);
  }

  @Get('system/logs')
  @ApiOperation({ summary: 'Get system logs' })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: ['error', 'warn', 'info', 'debug'],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 100 })
  @ApiResponse({
    status: 200,
    description: 'System logs retrieved successfully',
  })
  async getSystemLogs(@Query() query: { level?: string; limit?: number }) {
    return this.adminService.getSystemLogs(query);
  }

  // ===== ANALYTICS & REPORTS =====
  @Get('reports/user-activity')
  @ApiOperation({ summary: 'Get user activity report' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'User activity report data' })
  async getUserActivityReport(
    @Query() query: { startDate?: string; endDate?: string },
  ) {
    return this.adminService.getUserActivityReport(query);
  }

  @Get('reports/job-market')
  @ApiOperation({ summary: 'Get job market analysis report' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Job market analysis data' })
  async getJobMarketReport(
    @Query() query: { startDate?: string; endDate?: string },
  ) {
    return this.adminService.getJobMarketReport(query);
  }

  @Get('reports/revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({
    name: 'groupBy',
    required: false,
    enum: ['day', 'week', 'month'],
  })
  @ApiResponse({ status: 200, description: 'Revenue report data' })
  async getRevenueReport(
    @Query() query: { startDate?: string; endDate?: string; groupBy?: string },
  ) {
    return this.adminService.getRevenueReport(query);
  }
}
