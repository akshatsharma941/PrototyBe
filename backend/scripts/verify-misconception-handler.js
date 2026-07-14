// Verifier: misconception handler (§6.7 in tutorController.js)
//
// This verifier checks that the case-study-level misconception layer
// (per guided question) is wired up correctly:
//
//   - Each guided question may have a `misconceptions` array of
//     { name, description, diagnosis, reframe, expectedShift? }.
//   - When the active question has misconceptions, the system prompt
//     contains a KNOWN MISCONCEPTIONS block listing each one.
//   - The prompt instructs Gemini not to repeat the same diagnosis
//     verbatim across multiple occurrences.
//   - The valid status list includes `misconception_handled`.
//   - Controller routes `status: 'misconception_handled'` correctly:
//     a) §6.5 controller-override does NOT override it.
//     b) §6.6 question-required guardrail does NOT augment it.
//     c) `determineTransition` keeps the learner on the same phase
//        and same questionIndex (no advance).
//   - The cricket Q3 (the "80 players × 10 matches" question) has
//     the `team_vs_league` misconception catalogued.
//   - Other case studies and other questions have no misconceptions
//     (architectural isolation: cricket misconception never appears
//     in tiffin / bakery / etc.).
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

// ─── Section 1: case-study schema is valid ────────────────

console.log('\n[1] Case-study schema: misconceptions[] is well-formed');

const REQUIRED_FIELDS = ['name', 'description', 'diagnosis', 'reframe'];
const NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

let totalMisconceptions = 0;
let totalQuestionsWithMisconceptions = 0;

for (const caseStudy of seedData) {
  const guided = caseStudy.guidedQuestions || [];
  for (let i = 0; i < guided.length; i++) {
    const q = guided[i];
    const misconceptions = q.misconceptions;
    if (!misconceptions || misconceptions.length === 0) {
      continue; // optional field; absence is fine
    }
    totalQuestionsWithMisconceptions++;

    // Each misconception has all required fields populated.
    for (let j = 0; j < misconceptions.length; j++) {
      const m = misconceptions[j];
      totalMisconceptions++;
      const label = `${caseStudy.id} / Q${i + 1} / misconception[${j}]`;

      for (const field of REQUIRED_FIELDS) {
        check(
          `${label} has non-empty ${field}`,
          typeof m[field] === 'string' && m[field].trim().length > 0,
          `value: ${JSON.stringify(m[field])}`
        );
      }
      check(
        `${label} name is snake_case`,
        NAME_PATTERN.test(m.name || ''),
        `name: ${JSON.stringify(m.name)}`
      );
      // expectedShift is optional. If present, must be a non-empty string.
      if (m.expectedShift !== undefined) {
        check(
          `${label} expectedShift is a non-empty string (optional field)`,
          typeof m.expectedShift === 'string' && m.expectedShift.trim().length > 0,
          `value: ${JSON.stringify(m.expectedShift)}`
        );
      }
    }

    // names are unique within a question
    const names = misconceptions.map(m => m.name);
    const unique = new Set(names);
    check(
      `${caseStudy.id} / Q${i + 1} / names are unique within the question`,
      unique.size === names.length,
      `names: ${names.join(', ')}`
    );
  }
}

console.log(`  -- schema summary: ${totalMisconceptions} misconception(s) across ${totalQuestionsWithMisconceptions} question(s)`);

// ─── Section 2: prompt contains the misconception block ────

console.log('\n[2] System prompt contains KNOWN MISCONCEPTIONS block for cricket Q3');

// We can't call buildSystemPrompt directly (it isn't exported), so we
// verify the *source* contains the rendering code. The actual rendered
// prompt behaviour is exercised in the live tutor flow during testing.
const promptSignals = [
  'KNOWN MISCONCEPTIONS FOR THIS QUESTION',
  'activeQuestion.misconceptions',
  'description:',
  'Diagnosis:',
  'Reframe:',
  'expectedShift',
  'do not repeat the same diagnosis verbatim'
];
for (const signal of promptSignals) {
  check(`controller source contains: \`${signal}\``, controllerSource.includes(signal));
}

check('controller source includes the "do not repeat" instruction',
  /do not repeat the same diagnosis verbatim|do not repeat the same diagnosis/i
    .test(controllerSource));

// ─── Section 3: misconception_handled is a valid status ────

console.log('\n[3] misconception_handled is in the valid-status list');

check('JSON schema lists misconception_handled as a valid status',
  controllerSource.includes('misconception_handled'));

// We need to confirm it appears specifically in the status enum line, not
// just in a comment. The status enum is the line that says
// "status": "needs_guidance | insight_reached | ... | misconception_handled".
check('status enum line includes misconception_handled',
  /status.*misconception_handled/.test(controllerSource));

// ─── Section 4: controller routing for misconception_handled ──

console.log('\n[4] Controller routes misconception_handled correctly');

// (a) §6.5 controller-override does NOT override misconception_handled.
//     The 6.5 block is gated on `status === 'retry'`, so this should be
//     a structural property. We assert it explicitly by reading the
//     relevant lines and checking the gate.
const sixFiveGateMatch = controllerSource.match(
  /controllerAccepted\s*&&\s*tutorResponse\.status\s*===\s*'retry'/
);
check('§6.5 override gate is status === \'retry\' (excludes misconception_handled)',
  Boolean(sixFiveGateMatch));

// (b) §6.6 question-required guardrail is gated on needs_guidance only,
//     so misconception_handled is naturally excluded. We assert the gate.
const sixSixGateMatch = controllerSource.match(
  /tutorResponse\.status\s*===\s*'needs_guidance'/
);
check('§6.6 guardrail gate is status === \'needs_guidance\' (excludes misconception_handled)',
  Boolean(sixSixGateMatch));

// (c) determineTransition has a branch for misconception_handled that
//     returns nextPhase = activePhase and the same questionIndex.
const transitionBranchMatch = controllerSource.match(
  /if\s*\(\s*status\s*===\s*['"]misconception_handled['"]\s*\)/
);
check('determineTransition has a misconception_handled branch',
  Boolean(transitionBranchMatch));

// The branch returns nextPhase: activePhase, status: misconception_handled,
// questionIndex, attemptCount. We look for the shape.
const branchReturnMatch = controllerSource.match(
  /nextPhase:\s*activePhase,\s*status:\s*['"]misconception_handled['"],\s*questionIndex,\s*attemptCount/
);
check('misconception_handled branch returns nextPhase=activePhase + same questionIndex',
  Boolean(branchReturnMatch));

// ─── Section 5: cricket Q3 has the team_vs_league misconception ──

console.log('\n[5] Cricket Q3 has the team_vs_league misconception');

const cricket = seedData.find(cs => cs.id === 'cricket-scoreboard');
check('cricket case study loaded', Boolean(cricket));

const q3 = cricket && cricket.guidedQuestions && cricket.guidedQuestions[2];
check('cricket Q3 (the 80-players question) exists', Boolean(q3));

const teamVsLeague = q3 && Array.isArray(q3.misconceptions)
  ? q3.misconceptions.find(m => m.name === 'team_vs_league')
  : null;

check('cricket Q3 has misconception named "team_vs_league"',
  Boolean(teamVsLeague));

if (teamVsLeague) {
  check('team_vs_league description references real-cricket-team confusion',
    /real cricket team|11 players|11-player/i.test(teamVsLeague.description),
    `description: ${teamVsLeague.description}`);

  check('team_vs_league reframe mentions "80 players"',
    /80 players/.test(teamVsLeague.reframe),
    `reframe: ${teamVsLeague.reframe}`);

  check('team_vs_league reframe ends with "?"',
    teamVsLeague.reframe.trim().endsWith('?'),
    `reframe: ${teamVsLeague.reframe}`);

  check('team_vs_league has expectedShift (optional but recommended)',
    typeof teamVsLeague.expectedShift === 'string'
      && teamVsLeague.expectedShift.trim().length > 0);
}

// ─── Section 6: architectural isolation ───────────────────

console.log('\n[6] Architectural isolation — other case studies have no misconceptions seeded');

for (const caseStudy of seedData) {
  if (caseStudy.id === 'cricket-scoreboard') continue; // we just verified it
  const guided = caseStudy.guidedQuestions || [];
  if (guided.length === 0) {
    // Case studies without guided questions (bakery, age, inventory) are
    // out of scope for the misconception layer. No check needed.
    check(
      `${caseStudy.id} has no guided questions (out of scope for misconceptions)`,
      true
    );
    continue;
  }
  for (let i = 0; i < guided.length; i++) {
    const m = guided[i].misconceptions;
    const isEmpty = !m || (Array.isArray(m) && m.length === 0);
    check(
      `${caseStudy.id} / Q${i + 1} has no misconceptions (or empty array)`,
      isEmpty,
      `value: ${JSON.stringify(m)}`
    );
  }
}

// ─── Section 7: prompt signal is conditional on active question ──

console.log('\n[7] Prompt rendering is conditional on the active question having misconceptions');

const conditionalRender = controllerSource.match(
  /Array\.isArray\(activeQuestion\.misconceptions\)\s*&&\s*activeQuestion\.misconceptions\.length\s*>\s*0/
);
check('controller source renders misconceptions block only when activeQuestion.misconceptions is non-empty',
  Boolean(conditionalRender));

// ─── Summary ──────────────────────────────────────────────

console.log('\n──────────────────────────────────────');
console.log(`Result: ${passCount} pass, ${failCount} fail`);
if (failCount > 0) {
  console.log('Misconception-handler checks FAILED.');
  process.exit(1);
}
console.log('All misconception-handler checks passed.');
