const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function resetToday() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return;

    // Xác định mốc thời gian bắt đầu ngày hôm nay (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = BigInt(today.getTime());

    console.log(`🧹 Đang xóa dữ liệu học tập ngày hôm nay (${today.toLocaleDateString()}) cho user ${user.email}...`);

    // Cập nhật lastReviewed về null (hoặc lùi về hôm qua) cho các từ đã học hôm nay
    const result = await prisma.review.updateMany({
      where: {
        word: { ownerId: user.id },
        lastReviewed: { gte: todayTimestamp }
      },
      data: {
        lastReviewed: null, // Xóa mốc học hôm nay
        // Tùy chọn: Bạn có thể giảm correctCount nếu muốn test kỹ hơn
        // correctCount: { decrement: 1 } 
      }
    });

    console.log(`✅ Đã reset thành công ${result.count} từ vựng. Bây giờ bạn có thể test học mới!`);

  } catch (error) {
    console.error("❌ Lỗi khi reset:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetToday();
