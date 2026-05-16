const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function wipeAll() {
  try {
    const result = await prisma.review.updateMany({
      data: {
        lastReviewed: null,
        correctCount: 0,
        wrongCount: 0,
        interval: 0
      }
    });
    console.log(`✅ Đã xóa sạch toàn bộ ${result.count} dữ liệu ôn tập.`);
  } catch (error) {
    console.error("❌ Lỗi khi wipe:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

wipeAll();
