require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

async function checkDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({ where: { email: 'admin@gmail.com' } });
    console.log('--- ADMIN USER RECORD ---');
    console.log(user);

    if (user) {
      const isMatch = await bcrypt.compare('123456', user.password);
      console.log('Is "123456" valid password for admin?:', isMatch);
    }
  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkDb();
