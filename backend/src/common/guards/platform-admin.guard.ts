import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../auth/auth.service';

// Use together with JwtAuthGuard: JwtAuthGuard checks the token is
// valid, this checks the token belongs to platform staff, not a
// tenant user. A tenant user's token should never be able to touch
// platform-admin-only routes (e.g. creating/suspending tenants),
// no matter what role they hold inside their own tenant.
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    if (!user || user.kind !== 'platform') {
      throw new ForbiddenException('Platform admin access required');
    }
    return true;
  }
}
