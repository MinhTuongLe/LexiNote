import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gmail.com';
  const password = '123456';
  const fullName = 'System Administrator';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  console.log('Seeding root admin...');

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      fullName,
    },
    create: {
      email,
      password: hashedPassword,
      fullName,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log('Root admin created/updated:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
