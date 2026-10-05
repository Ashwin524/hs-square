import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // userId or platformAdminId, as string (BigInt-safe)
  kind: 'platform' | 'tenant';
  tenantId?: string;
  roles?: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async loginPlatformAdmin(email: string, password: string) {
    const admin = await this.prisma.platformAdmin.findUnique({ where: { email } });
    if (!admin || admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.platformAdmin.update({
      where: { platformAdminId: admin.platformAdminId },
      data: { lastLoginAt: new Date() },
    });

    const payload: JwtPayload = { sub: admin.platformAdminId.toString(), kind: 'platform' };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: admin.platformAdminId.toString(),
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        kind: 'platform' as const,
      },
    };
  }

  async loginTenantUser(tenantSlug: string, email: string, password: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant || tenant.deletedAt) throw new UnauthorizedException('Invalid credentials');
    if (tenant.status === 'SUSPENDED' || tenant.status === 'CANCELLED') {
      throw new UnauthorizedException('This account is not active. Contact your administrator.');
    }

    const user = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.tenantId, email } },
      include: { roles: { include: { role: true } } },
    });
    if (!user || user.deletedAt || user.status !== 'ACTIVE' || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: { lastLoginAt: new Date() },
    });

    const roleCodes = user.roles.map((ur) => ur.role.code);
    const payload: JwtPayload = {
      sub: user.userId.toString(),
      kind: 'tenant',
      tenantId: tenant.tenantId.toString(),
      roles: roleCodes,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.userId.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        kind: 'tenant' as const,
        tenantId: tenant.tenantId.toString(),
        tenantSlug: tenant.slug,
        tenantName: tenant.displayName,
        roles: roleCodes,
      },
    };
  }
}
