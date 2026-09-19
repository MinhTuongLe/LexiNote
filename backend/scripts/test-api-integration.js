/**
 * LexiNote Live API Integration Test Suite
 * 
 * Tests the running backend HTTP endpoints (http://127.0.0.1:1337/api)
 * to verify end-to-end communication, authentication payload integrity,
 * dashboard metrics, and stats calculation over HTTP.
 * 
 * Run with:
 *   node backend/scripts/test-api-integration.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Ensure exact base URL pointing to /api (strip accidental legacy /v1 if present in .env)
const rawUrl = process.env.API_BASE_URL || 'http://127.0.0.1:1337/api';
const API_BASE = rawUrl.replace(/\/v1\/?$/, '').replace(/\/+$/, '');
const TEST_EMAIL = 'api_live_tester@lexinote.test';
const TEST_PASSWORD = 'TestPassword123!';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

async function runApiIntegrationTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  LexiNote Live API Integration Test Suite          ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Target: ${API_BASE}                   ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  async function assertApi(testName, testFn) {
    const tStart = Date.now();
    try {
      await testFn();
      const elapsed = Date.now() - tStart;
      console.log(`  ${colors.green}✔ PASS${colors.reset} ${testName} ${colors.gray}(${elapsed}ms)${colors.reset}`);
      passed++;
    } catch (err) {
      const elapsed = Date.now() - tStart;
      console.log(`  ${colors.red}✖ FAIL${colors.reset} ${testName} ${colors.gray}(${elapsed}ms)${colors.reset}`);
      console.log(`    ${colors.red}Error: ${err.message}${colors.reset}`);
      failed++;
    }
  }

  let authToken = null;
  let testUser = null;
  let createdWordId = null;

  try {
    // --- Pre-cleanup & seed verified test user ---
    console.log(`${colors.gray}🔧 Preparing live test account in DB...${colors.reset}`);
    const existing = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    if (existing) {
      await prisma.review.deleteMany({ where: { word: { ownerId: existing.id } } });
      await prisma.wordRelation.deleteMany({ where: { word: { ownerId: existing.id } } });
      await prisma.word.deleteMany({ where: { ownerId: existing.id } });
      await prisma.refreshToken.deleteMany({ where: { userId: existing.id } });
      await prisma.user.delete({ where: { id: existing.id } });
    }

    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    testUser = await prisma.user.create({
      data: {
        email: TEST_EMAIL,
        password: hashedPassword,
        fullName: 'API Live Tester',
        isEmailVerified: true,
        settings: { theme: 'cute-rabbit' },
      }
    });

    // Test 1: Health check
    await assertApi('1. GET /api - Server health check returns status ok', async () => {
      const res = await fetch(`${API_BASE}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error(`Expected status 'ok', got ${data.status}`);
    });

    // Test 2: Login API
    await assertApi('2. POST /api/auth/login - Returns token, user id, and settings intact', async () => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      if (!data.token) throw new Error('Response missing token');
      if (!data.user || data.user.id !== testUser.id) throw new Error('Response missing valid user object or id');
      if (!data.user.settings) throw new Error('Response missing user.settings');
      authToken = data.token;
    });

    // Test 3: Profile API /auth/me
    await assertApi('3. GET /api/auth/me - Authenticated profile preserves id and settings', async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      if (!data.user?.id) throw new Error('Profile user.id is missing in /auth/me');
      if (data.user?.settings?.theme !== 'cute-rabbit') throw new Error('Profile settings not preserved');
    });

    // Test 4: Create word via API
    await assertApi('4. POST /api/words - Creates word and initializes review record', async () => {
      const res = await fetch(`${API_BASE}/words`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          word: 'blossom',
          meaningVi: 'nở hoa',
          type: 'verb',
          example: 'Flowers blossom in spring.',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      if (!data.id) throw new Error('Created word missing id');
      createdWordId = data.id;
    });

    // Test 5: Dashboard stats API
    await assertApi('5. GET /api/dashboard - Returns valid totalWords, streak, and weeklyActivity', async () => {
      const res = await fetch(`${API_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      if (data.totalWords < 1) throw new Error(`Expected at least 1 word, got ${data.totalWords}`);
      if (data.streak === undefined) throw new Error('Missing streak property');
      if (!Array.isArray(data.weeklyActivity) || data.weeklyActivity.length !== 7) {
        throw new Error('weeklyActivity must be an array of 7 days');
      }
    });

    // Test 6: Due words API
    await assertApi('6. GET /api/reviews/due - Word just created is immediately due for review', async () => {
      const res = await fetch(`${API_BASE}/reviews/due`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Expected array of due reviews');
      const found = data.some(r => r.wordId === createdWordId || r.word?.id === createdWordId);
      if (!found) throw new Error('Newly created word was not marked as due');
    });

    // Test 7: Update review via SM-2 API
    await assertApi('7. POST /api/reviews/update - Successfully advances SRS interval', async () => {
      const dueRes = await fetch(`${API_BASE}/reviews/due`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const dueList = await dueRes.json();
      const targetReview = dueList.find(r => r.wordId === createdWordId || r.word?.id === createdWordId);
      if (!targetReview) throw new Error('Target review record not found');

      const res = await fetch(`${API_BASE}/reviews/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          reviewId: targetReview.id,
          quality: 5,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const updated = await res.json();
      if (updated.correctCount !== 1) throw new Error(`Expected correctCount 1, got ${updated.correctCount}`);
      if (updated.interval !== 1) throw new Error(`Expected interval 1, got ${updated.interval}`);
    });

    // Test 8: Detailed study stats API
    await assertApi('8. GET /api/reviews/stats - Reflects reviewed word, accuracy, and streak = 1', async () => {
      const res = await fetch(`${API_BASE}/reviews/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      const data = await res.json();
      if (data.streak !== 1) throw new Error(`Expected streak 1, got ${data.streak}`);
      if (data.totalReviewed !== 1) throw new Error(`Expected totalReviewed 1, got ${data.totalReviewed}`);
      if (data.accuracy !== 100) throw new Error(`Expected accuracy 100%, got ${data.accuracy}%`);
      if (!Array.isArray(data.typesBreakdown)) throw new Error('typesBreakdown must be an array');
    });

  } finally {
    // --- Teardown ---
    console.log(`\n${colors.gray}🧹 Cleaning up live API test sandbox...${colors.reset}`);
    if (testUser) {
      await prisma.review.deleteMany({ where: { word: { ownerId: testUser.id } } });
      await prisma.wordRelation.deleteMany({ where: { word: { ownerId: testUser.id } } });
      await prisma.word.deleteMany({ where: { ownerId: testUser.id } });
      await prisma.refreshToken.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.deleteMany({ where: { id: testUser.id } });
    }
    await prisma.$disconnect();
    await pool.end();
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${colors.bold}API Test Summary:${colors.reset}`);
  console.log(`  Total:    ${passed + failed}`);
  console.log(`  ${colors.green}Passed:   ${passed}${colors.reset}`);
  if (failed > 0) {
    console.log(`  ${colors.red}Failed:   ${failed}${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`  Duration: ${duration}s`);
    console.log(`\n${colors.bold}${colors.green}✨ All Live API endpoints passed with 100% success! ✨${colors.reset}\n`);
    process.exit(0);
  }
}

runApiIntegrationTests().catch(err => {
  console.error(`${colors.red}Fatal Error:${colors.reset}`, err);
  process.exit(1);
});
