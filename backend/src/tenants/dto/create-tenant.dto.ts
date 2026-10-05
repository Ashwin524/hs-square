import { ArrayNotEmpty, IsArray, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  legalName: string;

  @IsString()
  @MinLength(2)
  displayName: string;

  @IsOptional()
  @IsString()
  industry?: string;

  // Module codes to enable, e.g. ['crm', 'inventory', 'accounting']
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  moduleCodes: string[];

  @IsEmail()
  adminEmail: string;

  @IsString()
  adminFirstName: string;
}
