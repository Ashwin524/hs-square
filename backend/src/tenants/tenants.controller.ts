import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  list() {
    return this.tenantsService.list();
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Patch(':tenantId/modules/:moduleCode')
  setModule(
    @Param('tenantId') tenantId: string,
    @Param('moduleCode') moduleCode: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.tenantsService.setModuleEnabled(tenantId, moduleCode, enabled);
  }
}
