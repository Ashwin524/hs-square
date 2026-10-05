import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../../auth/auth.service';
import { REQUIRE_MODULE_KEY } from '../decorators/require-module.decorator';

@Injectable()
export class TenantModuleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredModule = this.reflector.get<string>(REQUIRE_MODULE_KEY, context.getHandler());
    if (!requiredModule) return true; // route isn't gated by a module

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    // Platform admins aren't scoped to a tenant's entitlements.
    if (user.kind === 'platform') return true;
    if (!user.tenantId) throw new ForbiddenException('No tenant context');

    const entitlement = await this.prisma.tenantModule.findFirst({
      where: {
        tenantId: BigInt(user.tenantId),
        enabled: true,
        module: { code: requiredModule },
      },
    });

    if (!entitlement) {
      throw new ForbiddenException(`Your plan does not include the "${requiredModule}" module`);
    }
    return true;
  }
}
