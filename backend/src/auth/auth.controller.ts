import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TenantLoginDto } from './dto/tenant-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Platform Admin sign-in — email is globally unique.
  @Post('admin/login')
  loginAdmin(@Body() dto: LoginDto) {
    return this.authService.loginPlatformAdmin(dto.email, dto.password);
  }

  // Tenant user sign-in — needs the tenant slug since email is only
  // unique within a tenant, not globally.
  @Post('login')
  loginTenant(@Body() dto: TenantLoginDto) {
    return this.authService.loginTenantUser(dto.tenantSlug, dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }
}
