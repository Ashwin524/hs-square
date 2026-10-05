import { IsEmail, IsString, MinLength } from 'class-validator';

// A tenant user's email is only unique *within* their tenant
// (see `@@unique([tenantId, email])` in the schema), so logging in
// as a tenant user needs the tenant identified explicitly — via slug
// here. A production build would typically resolve this from a
// subdomain (acme.hsquare.app) instead of asking for it on the form.
export class TenantLoginDto {
  @IsString()
  tenantSlug: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
