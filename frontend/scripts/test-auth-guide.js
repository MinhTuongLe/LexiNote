/**
 * Frontend Logic Test Suite: Guide & Popup Standardization
 * 
 * Verifies that:
 *  - First-time users ONLY see intro (checkHasSeenGuide === false)
 *  - Returning users ONLY see Welcome Back (checkHasSeenGuide === true)
 *  - Both localStorage and database settings paths are reliably handled
 * 
 * Run with:
 *   node frontend/scripts/test-auth-guide.js
 */

// Mock localStorage for Node.js environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

// Replicate the exact logic from frontend/src/utils/authUtils.ts
const checkHasSeenGuide = (user) => {
  if (!user) return false;
  const userIdKey = user.id ?? user.userId ?? user._id ?? user.email ?? 'unknown';
  const storageKey = `hasSeenGuide_${userIdKey}`;
  const locallySeen = localStorage.getItem(storageKey) === 'true';

  const rawSettings = user.settings || {};
  const remotelySeen = rawSettings.preferences?.hasSeenGuide === true || rawSettings.hasSeenGuide === true;

  return Boolean(locallySeen || remotelySeen);
};

const markGuideAsSeenLocal = (user) => {
  if (!user) return;
  const userIdKey = user.id ?? user.userId ?? user._id ?? user.email ?? 'unknown';
  const storageKey = `hasSeenGuide_${userIdKey}`;
  localStorage.setItem(storageKey, 'true');
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}  Frontend Guide & Popup Logic Test Suite           ${colors.reset}`);
console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS${colors.reset} ${description}`);
    passed++;
  } else {
    console.log(`  ${colors.red}✖ FAIL${colors.reset} ${description}`);
    failed++;
  }
}

// Test 1: Null/undefined user returns false
assert('1. Null or undefined user evaluates to false (no popup shown)', checkHasSeenGuide(null) === false);

// Test 2: Fresh user without settings and without localStorage
localStorage.clear();
const newUser = { id: 101, email: 'newbie@lexinote.test', fullName: 'New User' };
assert('2. Fresh user without settings/localStorage evaluates to FALSE -> Only Intro displayed', checkHasSeenGuide(newUser) === false);

// Test 3: Returning user with root hasSeenGuide in database settings
const returningUserRoot = {
  id: 102,
  email: 'veteran@lexinote.test',
  settings: { hasSeenGuide: true },
};
assert('3. User with settings.hasSeenGuide = true evaluates to TRUE -> Welcome Back displayed', checkHasSeenGuide(returningUserRoot) === true);

// Test 4: Returning user with nested preferences.hasSeenGuide
const returningUserNested = {
  id: 103,
  email: 'veteran2@lexinote.test',
  settings: { preferences: { hasSeenGuide: true } },
};
assert('4. User with preferences.hasSeenGuide = true evaluates to TRUE -> Welcome Back displayed', checkHasSeenGuide(returningUserNested) === true);

// Test 5: First-time user completes guide and marks localStorage
localStorage.clear();
const guideCompleter = { id: 104, email: 'learner@lexinote.test', settings: {} };
assert('5a. Before completing guide: evaluates to FALSE', checkHasSeenGuide(guideCompleter) === false);
markGuideAsSeenLocal(guideCompleter);
assert('5b. After markGuideAsSeenLocal: evaluates to TRUE in localStorage immediately', checkHasSeenGuide(guideCompleter) === true);

// Test 6: Fallback to userId, _id, or email if id is formatted differently
localStorage.clear();
const mongoStyleUser = { _id: 'abc-678', email: 'mongo@lexinote.test' };
markGuideAsSeenLocal(mongoStyleUser);
assert('6. Works seamlessly with alternative ID key formats (_id, userId, email)', checkHasSeenGuide(mongoStyleUser) === true);

console.log(`\n${colors.bold}Summary:${colors.reset}`);
console.log(`  Total:  ${passed + failed}`);
console.log(`  ${colors.green}Passed: ${passed}${colors.reset}`);
if (failed > 0) {
  console.log(`  ${colors.red}Failed: ${failed}${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`\n${colors.bold}${colors.green}✨ All frontend guide & popup logic tests passed! ✨${colors.reset}\n`);
  process.exit(0);
}
