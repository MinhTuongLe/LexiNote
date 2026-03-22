import { PrismaClient } from '@prisma/client';

async function checkDb() {
  const prisma = new PrismaClient();
  try {
    const totalWords = await prisma.word.count();
    const totalReviews = await prisma.review.count();
    const wordsWithoutReviews = await prisma.word.findMany({
      where: {
        reviews: { none: {} },
      },
      select: { id: true, word: true },
    });

    console.log(`Total Words: ${totalWords}`);
    console.log(`Total Reviews: ${totalReviews}`);
    console.log(`Words without reviews: ${wordsWithoutReviews.length}`);
    if (wordsWithoutReviews.length > 0) {
      console.log('Sample words without reviews:', wordsWithoutReviews.slice(0, 5));
    }
  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
