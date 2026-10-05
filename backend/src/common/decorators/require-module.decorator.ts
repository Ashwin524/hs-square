import { SetMetadata } from '@nestjs/common';

export const REQUIRE_MODULE_KEY = 'requireModule';

// Marks a controller/route as gated behind a module entitlement, e.g.
// @RequireModule('inventory') on InventoryController. This is the
// real, server-enforced version of the "module toggle" we prototyped
// in the HTML mock — a tenant without Inventory enabled gets a 403
// from the API itself, not just a hidden sidebar link.
export const RequireModule = (moduleCode: string) => SetMetadata(REQUIRE_MODULE_KEY, moduleCode);
