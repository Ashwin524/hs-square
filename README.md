# HS-Square Technologies

The real application, foundation slice: NestJS + Prisma + PostgreSQL
backend, Next.js frontend. This replaces the click-through HTML
prototype's Tenants console with something that actually talks to a
real API and a real database.

## Run order

```bash
# 1. Backend
cd backend
copy .env.example .env 	# edit DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate dev --name init
npx prisma db seed          # prints your Platform Admin login
npm run start:dev           # http://localhost:4000

# 2. Frontend (separate terminal)
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

Open `http://localhost:3000`, sign in with the Platform Admin
credentials the seed step printed, and you land on a **real** Tenants
console: creating a tenant actually inserts rows in Postgres, and
toggling a module actually flips a row in `tenant_modules` — no more
in-memory JavaScript pretending.

## What this foundation slice covers

- Multi-tenant data model (Prisma schema mirrors your SQL schema,
  with the two FK fixes applied)
- Platform Admin auth, separate from tenant-user auth (JWT-based)
- Tenant provisioning: create tenant → enable modules → create first
  admin user, matching the prototype's flow
- **Real, server-enforced entitlements**: `/crm/ping` is gated by
  `@RequireModule('crm')` — a tenant without CRM enabled gets an
  actual `403` from the API, not just a hidden sidebar link
- A gap fixed along the way: the original schema had no concept of
  platform staff separate from tenant users; added a `PlatformAdmin`
  model for that

## What's intentionally not built yet

This is one slice of the roadmap we laid out, not the whole system:

- CRM entities (customers, leads, opportunities) — next slice
- Inventory, Sales Orders, Accounting, HR, Projects, Helpdesk
- Customer/vendor self-service portals
- Real email delivery (temp passwords are returned directly in the
  API response for now — fine for local dev, not for production)
- The four-tier role dashboards (Super Admin/Admin/Manager/Employee)
  from your SRS doc
- Postgres Row-Level Security (schema has the starting point
  commented in; app-layer `tenantId` filtering is what's actually
  enforcing isolation right now)

See `backend/README.md` for full API details and security notes to
address before any of this goes near production.

## Files in this package

```
hs-square/
├── backend/            NestJS API + Prisma schema
│   ├── prisma/schema.prisma
│   ├── src/auth/        Platform Admin + tenant user login, JWT
│   ├── src/tenants/      tenant provisioning + module entitlements
│   ├── src/common/       guards & decorators (PlatformAdminGuard,
│   │                     TenantModuleGuard, @RequireModule)
│   └── src/crm/          minimal stub proving the guard chain works
└── frontend/            Next.js app
    └── src/app/login, src/app/tenants
```

