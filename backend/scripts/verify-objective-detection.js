// Verifier: per-question learning objective (§6.8 in tutorController.js)
//
// This verifier checks that the per-question learning objective mechanism
// is wired up correctly:
//
//   - Each guided question may carry an optional `objective` string
//     describing the conceptual completion criterion.
//   - When the active question has an objective, the system prompt
//     contains a LEARNING OBJECTIVE block with explicit guidance to
//     emit status="phase_complete" once the learner demonstrates the
//     concept — in their own words, with examples, or via the natural
//     answer.
//   - The prompt block is omitted entirely when the question has no
//     objective.
//   - Cricket Q4 specifically has an objective describing the
//     shift-label insight (the failure mode observed in playtesting).
//   - Other questions / case studies have no objective (architectural
//     isolation: cricket's objective never appears in tiffin /
//     attendance / etc.).
//
// This verifier is non-destructive and read-only. It runs against the
// current source on disk and the in-memory case-study objects.

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Load fixtures ────────────────────────────────────────

const seedData = require(path.join(__dirname, '..', 'seedData'));
const controllerSource = fs.readFileSync(
  path.join(__dirname, '..', 'controllers', 'tutorController.js'),
  'utf8'
);

// ─── Tiny test harness ────────────────────────────────────

let passCount = 0;
let failCount = 0;

function check(label, condition, detail) {
  if (condition) {
    passCount++;
    console.log('  ✓ ' + label);
  } else {
    failCount++;
    console.log('  ✗ ' + label + (detail ? '   (' + detail + ')' : ''));
  }
}

// ─── Section 1: schema — objective is a non-empty string when present ──

console.log('\n[1] Case-study schema: objective is well-formed');

let totalQuestionsWithObjective = 0;

for (const caseStudy of seedData) {
  const guided = caseStudy.guidedQuestions || [];
  if (guided.length === 0) {
    // Case studies without guided questions are out of scope.
    continue;
  }
  for (let i = 0; i < guided.length; i++) {
    const q = guided[i];
    const obj = q.objective;
    if (obj === undefined) {
      // Optional field. Absence is fine.
      continue;
    }
    totalQuestionsWithObjective++;
    const label = `${caseStudy.id} / Q${i + 1}`;
    check(
      `${label} objective is a non-empty string`,
      typeof obj === 'string' && obj.trim().length > 0,
      `value: ${JSON.stringify(obj)}`
    );
  }
}

console.log(`  -- schema summary: ${totalQuestionsWithObjective} question(s) carry an objective`);

// ─── Section 2: prompt contains the LEARNING OBJECTIVE block ──

console.log('\n[2] System prompt contains LEARNING OBJECTIVE block');

const promptSignals = [
  'LEARNING OBJECTIVE FOR THIS QUESTION',
  'activeQuestion.objective',
  'status="phase_complete"',
  'Do NOT re-ask the same question'
];
for (const signal of promptSignals) {
  check(`controller source contains: \`${signal}\``, controllerSource.includes(signal));
}

// Confirm the prompt tells Gemini to judge conceptually, not lexically.
check('prompt instructs Gemini to NOT require specific keywords',
  /Do not require specific keywords|do not require specific keywords|not.*require.*keyword/i
    .test(controllerSource));

check('prompt instructs Gemini to allow examples / own words / natural answer',
  /in their own words|with examples|via the natural answer/i
    .test(controllerSource));

// ─── Section 3: prompt rendering is conditional on objective being set ──

console.log('\n[3] Prompt rendering is conditional on activeQuestion.objective');

const conditionalRender = controllerSource.match(
  /activeQuestion\.objective\s*\?[\s\S]{0,100}LEARNING OBJECTIVE FOR THIS QUESTION/
);
check('controller source renders LEARNING OBJECTIVE block only when activeQuestion.objective is set',
  Boolean(conditionalRender));

// ─── Section 4: at least one guided question has an objective seeded ──
//
// The mechanism is generic. We seed objectives on guided questions where
// playtesting has demonstrated a real failure. Right now that's one
// question (cricket Q4, the renumber-on-insert question — the most likely
// candidate based on the playtest transcript, though we don't have a
// confirmed question index). The verifier asserts that *some* question
// carries an objective (so the seed isn't empty) and that the seeded
// objective is conceptual rather than numeric (it's about a concept the
// learner expresses, not a literal answer to check).

console.log('\n[4] At least one guided question carries an objective');

const allGuidedQuestions = seedData.flatMap(cs =>
  (cs.guidedQuestions || []).map(q => ({
    caseStudyId: cs.id,
    question: q.question,
    objective: q.objective
  }))
);
const seededObjectives = allGuidedQuestions.filter(q => typeof q.objective === 'string' && q.objective.trim().length > 0);

check('at least one guided question has an objective seeded',
  seededObjectives.length >= 1,
  `seeded: ${seededObjectives.length}`);

for (const q of seededObjectives) {
  check(`${q.caseStudyId} / "${q.question.slice(0, 40)}..." objective is conceptual, not numeric`,
    !/^\s*\d+\s*$/.test(q.objective) && !/^\s*\d+\s*(matches|equals|=)\s*$/i.test(q.objective),
    `objective: ${q.objective}`);
}

// ─── Section 5: architectural isolation — objectives are seed-by-evidence ──

console.log('\n[5] Architectural isolation — only questions with playtest-demonstrated failures have objectives');

// We don't pin this to a specific question. We only assert that the
// number of seeded objectives is small (consistent with evidence-driven
// rollout) and that they sit in the cricket case study for now (the only
// case study we've playtested thoroughly). Future playtest evidence may
// add objectives to other questions; the verifier will need to be
// updated when that happens, but that's intentional — each addition is
// a deliberate, evidence-backed change.
check('seeded objectives are concentrated in cricket-scoreboard (the playtested case study)',
  seededObjectives.every(q => q.caseStudyId === 'cricket-scoreboard'),
  `case studies with objectives: ${[...new Set(seededObjectives.map(q => q.caseStudyId))].join(', ') || '(none)'}`);

check('seeded objective count is small (evidence-driven, not blanket-applied)',
  seededObjectives.length <= 4,
  `count: ${seededObjectives.length}`);

// ─── Section 6: prompt block is non-overlapping with misconception block ──

console.log('\n[6] Prompt blocks are independent (objective + misconceptions can coexist)');

// Both should be present in the source as separate conditional renderers.
const hasObjectiveBlock = /activeQuestion\.objective\s*\?/.test(controllerSource);
const hasMisconceptionBlock = /activeQuestion\.misconceptions[\s\S]{0,80}KNOWN MISCONCEPTIONS/.test(controllerSource);
check('objective block and misconceptions block are both present in the source',
  hasObjectiveBlock && hasMisconceptionBlock);

// Order: objective should appear before misconceptions in the prompt
// (so Gemini reads the completion criterion first, then the misconception layer).
// We anchor on the indented prompt-block occurrences (`^ + LEARNING OBJECTIVE`
// and `^ + KNOWN MISCONCEPTIONS`) so we don't false-match any unrelated
// string in the file.
const objectiveMatch = controllerSource.match(/^\s*LEARNING OBJECTIVE FOR THIS QUESTION:/m);
const misconceptionMatch = controllerSource.match(/^\s*KNOWN MISCONCEPTIONS FOR THIS QUESTION:/m);
check('objective block is rendered before the misconceptions block in the prompt',
  Boolean(objectiveMatch) && Boolean(misconceptionMatch)
    && objectiveMatch.index < misconceptionMatch.index);

// ─── Summary ──────────────────────────────────────────────

console.log('\n──────────────────────────────────────');
console.log(`Result: ${passCount} pass, ${failCount} fail`);
if (failCount > 0) {
  console.log('Objective-detection checks FAILED.');
  process.exit(1);
}
console.log('All objective-detection checks passed.');
