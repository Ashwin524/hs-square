import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantModuleGuard } from '../common/guards/tenant-module.guard';
import { RequireModule } from '../common/decorators/require-module.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

// This is a deliberately minimal stub — its only job right now is to
// prove the auth + entitlement guard chain actually works end to end:
// a tenant user without "crm" enabled gets a real 403 from the API,
// not just a hidden sidebar link. Real CRM entities (customers, leads,
// opportunities, pipeline) come in the next build slice, matching the
// schema you supplied.
@UseGuards(JwtAuthGuard, TenantModuleGuard)
@Controller('crm')
export class CrmController {
  @Get('ping')
  @RequireModule('crm')
  ping(@CurrentUser() user: JwtPayload) {
    return { ok: true, message: 'CRM module is enabled for your tenant.', tenantId: user.tenantId };
  }
}

@Module({
  controllers: [CrmController],
})
export class CrmModule {}
