/**
 * Prisma Seed Script
 *
 * Populates the database with:
 * 1. Item categories (required before any item can be created)
 * 2. A default admin user (for testing the admin panel)
 *
 * Run with:
 *   npm run db:seed
 *
 * Safe to re-run — uses upsert, so it won't create duplicates.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Electronics',       icon: '📱' },
  { name: 'Bags & Wallets',    icon: '👜' },
  { name: 'Keys',              icon: '🔑' },
  { name: 'ID & Cards',        icon: '💳' },
  { name: 'Books & Notes',     icon: '📚' },
  { name: 'Clothing',          icon: '👕' },
  { name: 'Jewellery',         icon: '💍' },
  { name: 'Water Bottles',     icon: '🍶' },
  { name: 'Stationery',        icon: '✏️' },
  { name: 'Sports Equipment',  icon: '⚽' },
  { name: 'Glasses',           icon: '👓' },
  { name: 'Headphones',        icon: '🎧' },
  { name: 'Umbrellas',         icon: '☂️' },
  { name: 'Other',             icon: '📦' },
];

const ADMIN_USER = {
  name:      'Campus Admin',
  email:     'admin@campusfind.dev',
  password:  'Admin@1234',           // Change this immediately after first login
  university: 'Trace University',
  role:      'ADMIN' as const,
};

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ── 1. Seed Categories ─────────────────────────────────────────
  console.log('📂 Seeding categories...');

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where:  { name: category.name },
      update: { icon: category.icon },
      create: { name: category.name, icon: category.icon },
    });
    console.log(`   ✓ ${category.icon}  ${category.name}`);
  }

  // ── 2. Seed Admin User ─────────────────────────────────────────
  console.log('\n👤 Seeding admin user...');

  const passwordHash = await bcrypt.hash(ADMIN_USER.password, 12);

  const admin = await prisma.user.upsert({
    where:  { email: ADMIN_USER.email },
    update: {},                       // Don't overwrite if already exists
    create: {
      name:         ADMIN_USER.name,
      email:        ADMIN_USER.email,
      passwordHash,
      role:         ADMIN_USER.role,
      university:   ADMIN_USER.university,
      isVerified:   true, // Seeded directly — skips the email OTP flow
    },
  });

  console.log(`   ✓ Admin user: ${admin.email}`);
  console.log(`   ⚠️  Default password: ${ADMIN_USER.password}`);
  console.log(`   ⚠️  Change this password after first login!\n`);

  // ── Summary ────────────────────────────────────────────────────
  const categoryCount = await prisma.category.count();
  console.log(`✅ Seed complete!`);
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Admin:      ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
