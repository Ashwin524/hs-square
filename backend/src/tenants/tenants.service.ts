import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const tenants = await this.prisma.tenant.findMany({
      where: { deletedAt: null },
      include: { modules: { include: { module: true } }, plan: true },
      orderBy: { createdAt: 'desc' },
    });

    // BigInt doesn't serialize to JSON by default — map to a plain shape.
    return tenants.map((t) => ({
      tenantId: t.tenantId.toString(),
      legalName: t.legalName,
      displayName: t.displayName,
      slug: t.slug,
      industry: t.industry,
      status: t.status,
      plan: t.plan?.name ?? null,
      modules: t.modules.filter((m) => m.enabled).map((m) => m.module.code),
      createdAt: t.createdAt,
    }));
  }

  // Creates the tenant, enables the chosen modules, and creates the
  // tenant's first admin user with a one-time temporary password.
  // A production build would email an invite/set-password link
  // instead of returning a temp password directly — there's no email
  // service wired into this foundation slice yet.
  async create(dto: CreateTenantDto) {
    const modules = await this.prisma.module.findMany({
      where: { code: { in: dto.moduleCodes }, isActive: true },
    });
    if (modules.length !== dto.moduleCodes.length) {
      const found = modules.map((m) => m.code);
      const missing = dto.moduleCodes.filter((c) => !found.includes(c));
      throw new BadRequestException(`Unknown module code(s): ${missing.join(', ')}`);
    }

    const baseSlug = slugify(dto.displayName);
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.tenant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const tempPassword = crypto.randomBytes(9).toString('base64url'); // e.g. "kQ3f9zL2mN1p"
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const tenant = await this.prisma.tenant.create({
      data: {
        legalName: dto.legalName,
        displayName: dto.displayName,
        slug,
        industry: dto.industry,
        status: 'TRIAL',
        modules: {
          create: modules.map((m) => ({ moduleId: m.moduleId, enabled: true })),
        },
        users: {
          create: {
            email: dto.adminEmail,
            firstName: dto.adminFirstName,
            passwordHash,
            status: 'ACTIVE', // ACTIVE here since we're issuing a usable temp password directly
          },
        },
      },
      include: { modules: { include: { module: true } }, users: true },
    });

    return {
      tenantId: tenant.tenantId.toString(),
      slug: tenant.slug,
      displayName: tenant.displayName,
      modules: tenant.modules.map((m) => m.module.code),
      admin: {
        email: tenant.users[0].email,
        temporaryPassword: tempPassword, // shown once; not retrievable again
      },
    };
  }

  async setModuleEnabled(tenantId: string, moduleCode: string, enabled: boolean) {
    const tenant = await this.prisma.tenant.findUnique({ where: { tenantId: BigInt(tenantId) } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const module = await this.prisma.module.findUnique({ where: { code: moduleCode } });
    if (!module) throw new NotFoundException('Module not found');

    await this.prisma.tenantModule.upsert({
      where: { tenantId_moduleId: { tenantId: tenant.tenantId, moduleId: module.moduleId } },
      update: { enabled },
      create: { tenantId: tenant.tenantId, moduleId: module.moduleId, enabled },
    });

    return { tenantId, moduleCode, enabled };
  }
}
