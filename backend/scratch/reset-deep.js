const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetDeep() {
  try {
    // Lùi về 24h trước để chắc chắn xóa sạch mọi dấu vết của "hôm nay" bất kể múi giờ
    const longAgo = new Date();
    longAgo.setDate(longAgo.getDate() - 2); 
    longAgo.setHours(0, 0, 0, 0);
    const timestamp = BigInt(longAgo.getTime());

    console.log(`🧹 Đang xóa sạch dữ liệu học tập từ 48h qua...`);

    const result = await prisma.review.updateMany({
      where: {
        lastReviewed: { gte: timestamp }
      },
      data: {
        lastReviewed: null
      }
    });

    console.log(`✅ Đã reset thành công ${result.count} từ vựng. Bây giờ chắc chắn hôm nay sẽ trống.`);

  } catch (error) {
    console.error("❌ Lỗi khi reset:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetDeep();
