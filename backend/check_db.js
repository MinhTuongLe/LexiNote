const { PrismaClient } = require('@prisma/client');

async function checkDb() {
  const prisma = new PrismaClient();
  try {
    const totalWords = await prisma.word.count();
    const totalReviews = await prisma.review.count();
    
    // In RAW query to avoid Prisma logic issues
    const wordsWithReviews = await prisma.$queryRaw`SELECT count(distinct word) FROM review`;
    const wordsCount = await prisma.$queryRaw`SELECT count(*) FROM word`;
    
    console.log(`Total Words (Prisma): ${totalWords}`);
    console.log(`Total Reviews (Prisma): ${totalReviews}`);
    console.log(`Words in Word table:`, wordsCount);
    console.log(`Words with Review record:`, wordsWithReviews);

    const missing = await prisma.$queryRaw`
      SELECT id, word FROM word 
      WHERE id NOT IN (SELECT word FROM review)
    `;
    console.log(`Words missing reviews: ${missing.length}`);
    if (missing.length > 0) {
      console.log('Sample missing reviews:', missing.slice(0, 5));
    }
    
    const dueCount = await prisma.review.count({
        where: { nextReview: { lte: Date.now() + 600000 } } // Check with 10 min buffer
    });
    console.log(`Reviews due with 10 min buffer: ${dueCount}`);

  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
