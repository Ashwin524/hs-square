import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // --- Module catalog (matches the entitlement chips in the prototype) ---
  const moduleDefs = [
    { code: 'crm', name: 'CRM', description: 'Contacts, pipeline, activities', isCore: true },
    { code: 'inventory', name: 'Inventory', description: 'Stock across warehouses' },
    { code: 'orders', name: 'Sales Orders', description: 'Quote-to-order-to-invoice flow' },
    { code: 'accounting', name: 'Accounting', description: 'Invoicing, AR/AP, ledger' },
    { code: 'hr', name: 'HR', description: 'Employee records, leave, attendance' },
    { code: 'projects', name: 'Projects', description: 'Tasks, timesheets, project billing' },
  ];
  for (const m of moduleDefs) {
    await prisma.module.upsert({ where: { code: m.code }, update: {}, create: m });
  }

  // --- Plans ---
  await prisma.plan.upsert({
    where: { code: 'trial' },
    update: {},
    create: { code: 'trial', name: 'Trial', description: '14-day trial, all modules', monthlyPrice: 0, annualPrice: 0 },
  });

  // --- First Platform Admin ---
  // Change this email/password immediately after first login in any
  // real deployment — this is a dev-only convenience seed.
  const email = process.env.SEED_ADMIN_EMAIL ?? '[email protected]';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.platformAdmin.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, firstName: 'Platform', lastName: 'Admin' },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded. Platform Admin login: ${email} / ${password} (change this password immediately)`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
