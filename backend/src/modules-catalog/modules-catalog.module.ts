import { Module } from '@nestjs/common';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PlatformAdminGuard } from '../common/guards/platform-admin.guard';

@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@Controller('modules-catalog')
class ModulesCatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const modules = await this.prisma.module.findMany({ where: { isActive: true } });
    return modules.map((m) => ({
      code: m.code,
      name: m.name,
      description: m.description,
      isCore: m.isCore,
    }));
  }
}

@Module({
  controllers: [ModulesCatalogController],
})
export class ModulesCatalogModule {}
