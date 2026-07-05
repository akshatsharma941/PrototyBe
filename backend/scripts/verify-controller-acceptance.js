// Quick verification of the controllerAccepts logic, post-migration.
//
// After the architectural refactor, controllerAccepts no longer has a
// global DATA_ELEMENT_SIGNALS list. The observation phase reads keywords
// from the active case study's observation.expectedKeywords. This script
// confirms:
//   - cricket, tiffin, bakery, age, inventory all have their own
//     expectedKeywords lists
//   - The user's reported bug inputs are accepted by the right case study
//   - Off-topic inputs are rejected
//   - The other phases (firstAttempt, guidedQuestions, etc.) still work
//     as before
//   - Empty input is rejected (controller rule)

const seedData = require('../seedData.js');

const cricket    = seedData.find(s => s.id === 'cricket-scoreboard');
const tiffin     = seedData.find(s => s.id === 'tiffin-service-orders');
const bakery     = seedData.find(s => s.id === 'bakery-checkout');
const age        = seedData.find(s => s.id === 'age-verification-system');
const inventory  = seedData.find(s => s.id === 'inventory-stock-checker');

// ── Inlined controller logic (mirrors tutorController.js) ─────────────

function controllerAccepts(phase, response, caseStudy) {
  const lower = (response || '').trim().toLowerCase();
  if (!lower) return false;

  switch (phase) {
    case 'observation': {
      const keywords = caseStudy?.observation?.expectedKeywords || [];
      return keywords.some(s => lower.includes(s));
    }
    case 'firstAttempt':      return lower.length > 20;
    case 'guidedQuestions':   return lower.length > 0;
    case 'cognitiveTrigger':  return /too|cant|can't|overwhelm|hours|impossible|don.?t know/i.test(lower);
    case 'discovery':         return /together|group|same|connected|under one|store together|put together|yes.*should/i.test(lower);
    case 'programmingMapping':return /okay|i see|that makes sense|right|got it|understood|clear|so it.?s like|like a/i.test(lower);
    case 'practice':          return lower.length > 10 || lower.includes('skip') || lower.includes('next');
    case 'reflection':        return lower.length > 0;
    default:                  return false;
  }
}

// ── Tests ──────────────────────────────────────────────────────────────

const cases = [
  // === USER'S REPORTED BUG: cricket case study ===
  // Phase: observation
  ['observation', "Each player's score",      cricket,   true,  'cricket'],
  ['observation', 'player scores',            cricket,   true,  'cricket'],
  ['observation', 'players and scores',       cricket,   true,  'cricket'],
  ['observation', 'he is managing scores',    cricket,   true,  'cricket'],
  ['observation', 'players',                  cricket,   true,  'cricket'],
  ['observation', 'data',                     cricket,   true,  'cricket'],

  // === Off-topic input still fails ===
  ['observation', 'I love cricket',           cricket,   false, 'cricket-off-topic'],
  ['observation', 'cricket',                  cricket,   false, 'cricket-off-topic'],
  ['observation', 'asdf',                     cricket,   false, 'cricket-nonsense'],
  ['observation', '',                         cricket,   false, 'cricket-empty'],

  // === Tiffin case study: only tiffin keywords count ===
  ['observation', 'orders and addresses',     tiffin,    true,  'tiffin'],
  ['observation', 'city and customer',        tiffin,    true,  'tiffin'],
  ["observation", "Each customer's address",  tiffin,    true,  'tiffin'],
  ['observation', 'tiffins for different cities', tiffin,true,  'tiffin'],

  // Cricket-only vocabulary must NOT pass tiffin (controller is generic)
  ['observation', 'player scores',            tiffin,    false, 'cricket-vocab-not-tiffin'],
  ['observation', 'batting average',          tiffin,    false, 'cricket-vocab-not-tiffin'],

  // === Bakery case study: only bakery keywords ===
  ['observation', 'price and quantity',       bakery,    true,  'bakery'],
  ['observation', 'cost of each croissant',   bakery,    true,  'bakery'],
  ['observation', 'total of 3 and 2',         bakery,    true,  'bakery'],
  ['observation', '3 croissants and 2 coffees', bakery,  true,  'bakery'],
  // Cricket vocabulary must NOT pass bakery
  ['observation', 'player scores',            bakery,    false, 'cricket-vocab-not-bakery'],
  ['observation', 'orders and customers',     bakery,    false, 'tiffin-vocab-not-bakery'],

  // === Age Verification: only age keywords ===
  ['observation', 'age limit of 18',          age,       true,  'age'],
  ['observation', 'age is checked',           age,       true,  'age'],
  ['observation', 'minimum age threshold',    age,       true,  'age'],
  ['observation', 'player scores',            age,       false, 'cricket-vocab-not-age'],
  ['observation', 'cookie price',             age,       false, 'bakery-vocab-not-age'],

  // === Inventory: only inventory keywords ===
  ['observation', 'list of items',            inventory, true,  'inventory'],
  ['observation', 'walk through each',        inventory, true,  'inventory'],
  ['observation', 'print every item in stock', inventory, true, 'inventory'],
  ['observation', 'player scores',            inventory, false, 'cricket-vocab-not-inventory'],
  ['observation', 'price total',              inventory, false, 'bakery-vocab-not-inventory'],

  // === Other phases (unchanged) ===
  ['firstAttempt', 'I would create a list', null,        true,  'firstAttempt-non-empty'],
  ['firstAttempt', 'yes',                   null,        false, 'firstAttempt-too-short'],
  ['guidedQuestions', 'yes',                null,        true,  'guidedQuestions'],
  ['guidedQuestions', '',                   null,        false, 'guidedQuestions-empty'],
  ['cognitiveTrigger', "That's too many",   null,        true,  'cognitiveTrigger'],
  ['cognitiveTrigger', 'cool',              null,        false, 'cognitiveTrigger-off-topic'],
  ['discovery', 'they should be together', null,        true,  'discovery'],
  ['discovery', 'maybe',                    null,        false, 'discovery-vague'],
  ['programmingMapping', 'okay',            null,        true,  'programmingMapping'],
  ['programmingMapping', 'what?',           null,        false, 'programmingMapping-vague'],
  ['practice', 'definitely a list',         null,        true,  'practice'],
  ['practice', 'skip',                      null,        true,  'practice-skip'],
  ['practice', 'ok',                        null,        false, 'practice-too-short'],
  ['reflection', 'It felt good',            null,        true,  'reflection'],
];

let pass = 0, fail = 0;
const failures = [];
for (const [phase, input, cs, expected, label] of cases) {
  const got = controllerAccepts(phase, input, cs);
  const ok = got === expected;
  if (ok) pass++; else { fail++; failures.push({ phase, input, expected, got, label, csId: cs?.id }); }
}

console.log(`\n=== controllerAccepts verification (post-refactor) ===`);
console.log(`pass: ${pass}   fail: ${fail}\n`);
if (failures.length) {
  console.log('Failures:');
  for (const f of failures) {
    console.log(`  ✗  ${f.csId?.padEnd(25) || '(null)'}  ${f.phase.padEnd(20)}  ${JSON.stringify(f.input).padEnd(36)}  expected=${f.expected}  got=${f.got}  [${f.label}]`);
  }
}

process.exit(fail === 0 ? 0 : 1);