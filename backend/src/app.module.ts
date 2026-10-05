import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ModulesCatalogModule } from './modules-catalog/modules-catalog.module';
import { CrmModule } from './crm/crm.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    ModulesCatalogModule,
    CrmModule,
  ],
})
export class AppModule {}
