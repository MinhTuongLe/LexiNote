/**
 * LexiNote UI Stats Demo Seeder
 * 
 * Injects a rich, realistic set of words, multi-day study history,
 * and mastery progress into your account so you can visually review
 * the Dashboard & Stats UI without waiting or manually studying dozens of times.
 * 
 * Usage:
 *   node backend/scripts/seed-mock-stats.js               # Seeds data for the first user
 *   node backend/scripts/seed-mock-stats.js --email=user@example.com
 *   node backend/scripts/seed-mock-stats.js --reset       # Cleans up mock words
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const args = process.argv.slice(2);
const isReset = args.includes('--reset');
const emailArg = args.find(a => a.startsWith('--email='))?.split('=')[1];

const MOCK_WORDS = [
  { word: 'serendipity', meaningVi: 'sự tình cờ may mắn', type: 'noun', example: 'Finding this cozy cafe was pure serendipity.', status: 'mastered' },
  { word: 'resilient', meaningVi: 'kiên cường, mau phục hồi', type: 'adj', example: 'She is remarkably resilient in tough times.', status: 'mastered' },
  { word: 'embark', meaningVi: 'bắt đầu, dấn thân vào', type: 'verb', example: 'They are about to embark on a new adventure.', status: 'mastered' },
  { word: 'flourish', meaningVi: 'phát triển mạnh mẽ', type: 'verb', example: 'Plants flourish under good sunlight.', status: 'learning' },
  { word: 'meticulously', meaningVi: 'một cách tỉ mỉ, cẩn thận', type: 'adv', example: 'The notes were meticulously organized.', status: 'learning' },
  { word: 'ephemeral', meaningVi: 'phù du, sớm nở tối tàn', type: 'adj', example: 'Cherry blossoms have an ephemeral beauty.', status: 'learning' },
  { word: 'figure out', meaningVi: 'tìm ra giải pháp, hiểu ra', type: 'phrasal_verb', example: 'We will figure out the issue soon.', status: 'learning' },
  { word: 'piece of cake', meaningVi: 'dễ như ăn bánh', type: 'idiom', example: 'That math test was a piece of cake.', status: 'learning' },
  { word: 'eloquent', meaningVi: 'hùng biện, có tài ăn nói', type: 'adj', example: 'He gave an eloquent speech.', status: 'new' },
  { word: 'pragmatic', meaningVi: 'thực tế, thực dụng', type: 'adj', example: 'We need a pragmatic approach to this challenge.', status: 'new' },
  { word: 'persevere', meaningVi: 'kiên trì, bền chí', type: 'verb', example: 'Persevere through hardship to achieve greatness.', status: 'new' },
  { word: 'once in a blue moon', meaningVi: 'rất hiếm khi', type: 'idiom', example: 'He only visits once in a blue moon.', status: 'new' },
];

async function seed() {
  try {
    let user;
    if (emailArg) {
      user = await prisma.user.findUnique({ where: { email: emailArg } });
    } else {
      user = await prisma.user.findFirst({ where: { status: 'active' } });
    }

    if (!user) {
      console.error('❌ No user found in the database to seed mock stats.');
      process.exit(1);
    }

    console.log(`\n🎯 Target user: ${user.fullName} (${user.email}, ID: ${user.id})`);

    const mockWordNames = MOCK_WORDS.map(w => w.word);

    if (isReset) {
      console.log('🧹 Cleaning up mock words from target account...');
      const targetWords = await prisma.word.findMany({
        where: { ownerId: user.id, word: { in: mockWordNames } },
        select: { id: true }
      });
      const ids = targetWords.map(w => w.id);
      if (ids.length > 0) {
        await prisma.review.deleteMany({ where: { wordId: { in: ids } } });
        await prisma.wordRelation.deleteMany({ where: { wordId: { in: ids } } });
        await prisma.word.deleteMany({ where: { id: { in: ids } } });
      }
      console.log(`✅ Removed ${ids.length} mock words. Account restored!`);
      return;
    }

    console.log('🌱 Seeding rich mock data (7-day streak, 12 words, mastery distribution)...');

    // 1. Remove existing instances of mock words to avoid duplication
    const existing = await prisma.word.findMany({
      where: { ownerId: user.id, word: { in: mockWordNames } },
      select: { id: true }
    });
    const oldIds = existing.map(w => w.id);
    if (oldIds.length > 0) {
      await prisma.review.deleteMany({ where: { wordId: { in: oldIds } } });
      await prisma.wordRelation.deleteMany({ where: { wordId: { in: oldIds } } });
      await prisma.word.deleteMany({ where: { id: { in: oldIds } } });
    }

    const now = Date.now();

    // 2. Insert mock words and reviews
    for (let i = 0; i < MOCK_WORDS.length; i++) {
      const item = MOCK_WORDS[i];
      const createdWord = await prisma.word.create({
        data: {
          word: item.word,
          meaningVi: item.meaningVi,
          type: item.type,
          example: item.example,
          ownerId: user.id,
        }
      });

      let correctCount = 0;
      let wrongCount = 0;
      let interval = 0;
      let easeFactor = 2.5;
      let lastReviewed = null;
      let nextReview = BigInt(now);

      if (item.status === 'mastered') {
        correctCount = 5;
        interval = 21; // >= 14 -> Mastered
        easeFactor = 2.7;
        lastReviewed = BigInt(now - (i % 3) * 86400000); // Studied recently
        nextReview = BigInt(now + (21 * 86400000));
      } else if (item.status === 'learning') {
        correctCount = 2;
        wrongCount = i % 2; // 0 or 1
        interval = 4;
        easeFactor = 2.4;
        // Make some due today for practice
        if (i % 2 === 0) {
          nextReview = BigInt(now - 3600000); // 1h ago -> Due
        } else {
          nextReview = BigInt(now + 2 * 86400000);
        }
        lastReviewed = BigInt(now - ((i - 3) % 4 + 1) * 86400000);
      } else {
        // New word
        nextReview = BigInt(now - 1800000); // Due now
      }

      await prisma.review.create({
        data: {
          wordId: createdWord.id,
          correctCount,
          wrongCount,
          interval,
          easeFactor,
          lastReviewed,
          nextReview,
        }
      });
    }

    // 3. Ensure a solid 7-day unbroken streak by spreading reviews across the past 7 days
    const allUserReviews = await prisma.review.findMany({
      where: { word: { ownerId: user.id } },
      take: 7,
    });

    for (let dayOffset = 0; dayOffset < Math.min(7, allUserReviews.length); dayOffset++) {
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() - dayOffset);
      dayDate.setHours(14, 0, 0, 0);

      await prisma.review.update({
        where: { id: allUserReviews[dayOffset].id },
        data: {
          lastReviewed: BigInt(dayDate.getTime()),
          correctCount: Math.max(allUserReviews[dayOffset].correctCount, 1),
        }
      });
    }

    console.log(`\n🎉 Success! Seeded 12 words with 7-day streak for ${user.fullName}.`);
    console.log(`👉 Open http://localhost:5173/dashboard and http://localhost:5173/stats to see the result!`);
    console.log(`💡 To remove these mock words later, run: node backend/scripts/seed-mock-stats.js --reset\n`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed();
