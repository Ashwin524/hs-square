# HS-Square Technologies — Backend (foundation slice)

Real NestJS + Prisma + PostgreSQL API. This is the **foundation slice**:
Platform Admin auth, Tenant provisioning, module entitlements, tenant
user auth, and RBAC scaffolding. CRM/Inventory/Sales/Accounting/HR/
Projects/Helpdesk business tables come in follow-up slices, layered
onto `hs_square_software_database_schema_v1_fixed.sql`.

## Prerequisites
- Node.js 20+
- A running PostgreSQL instance (local, Docker, or hosted)

## Setup

```bash
cd backend
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres instance, set a real JWT_SECRET

npm install
npx prisma migrate dev --name init   # creates tables from prisma/schema.prisma
npx prisma db seed                   # creates the module catalog + first Platform Admin
npm run start:dev
```

The seed step prints a Platform Admin email/password to the console —
**change that password immediately**; it's a dev-only convenience, not
meant for production use as-is.

API runs on `http://localhost:4000` by default (see `PORT` in `.env`).

## What's actually implemented

- `POST /auth/admin/login` — Platform Admin sign-in
- `POST /auth/login` — tenant user sign-in (`{ tenantSlug, email, password }`)
- `GET /auth/me` — decode the current JWT
- `GET /tenants` — list tenants (Platform Admin only)
- `POST /tenants` — create a tenant + enable modules + create its first
  admin user (Platform Admin only) — the real version of the
  prototype's "+ New tenant" flow
- `PATCH /tenants/:tenantId/modules/:moduleCode` — toggle a module on/off
  for a tenant (Platform Admin only) — the real version of the
  prototype's live entitlement toggles
- `GET /modules-catalog` — list available modules (Platform Admin only)
- `GET /crm/ping` — a deliberately minimal stub that proves the
  module-entitlement guard chain works: call it as a tenant user whose
  tenant doesn't have `crm` enabled and you'll get a real `403`, not
  just a hidden sidebar link

## What's NOT implemented yet (by design, this slice)

- CRM entities (customers, leads, opportunities, pipeline)
- Inventory, Sales Orders, Accounting, HR, Projects, Helpdesk
- Customer/vendor portals
- Email delivery for invites (temp passwords are returned directly in
  the API response instead — fine for local dev, not for production)
- Row-Level Security (the schema has a starting-point example commented
  in; not wired into this app yet — the app layer currently owns tenant
  isolation via `tenantId` filtering in every query)
- Refresh tokens / token revocation (JWTs just expire after `JWT_EXPIRES_IN`)

## Security notes before this goes anywhere near production

- Rotate `JWT_SECRET` to a real secret, never commit `.env`
- Wire up real email delivery so temp passwords stop being returned
  in plaintext API responses
- Add rate limiting on the login endpoints
- Turn on Postgres Row-Level Security per the schema's commented
  starting point — don't rely on `tenantId` filtering in application
  code alone for tenant isolation
