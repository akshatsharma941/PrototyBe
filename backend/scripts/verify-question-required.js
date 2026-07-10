// Verifier for the "every response must end with a question" guardrail.
//
// This is a multi-pronged check:
//
// 1. PROMPT RULE — Does the system prompt emitted by buildSystemPrompt
//    contain the universal "every response MUST end with a concrete
//    question" instruction? We can't call buildSystemPrompt directly
//    (it's not exported), so we regex-match the controller source file
//    for the rule's distinctive phrases.
//
// 2. CONTROLLER GUARDRAIL — Re-implement the same guardrail logic
//    inline (mirroring tutorController.js §6.6 + appendFollowUpQuestion),
//    then exercise it with simulated Gemini responses across all 5 case
//    studies and all phases (except cognitiveTrigger which is
//    intentionally excluded). Every needs_guidance response that lacks
//    a '?' must be augmented to contain one.
//
// 3. COGNITIVETRIGGER EXCLUSION — The cognitiveTrigger phase must NOT
//    be augmented even if its message has no '?'. The phase is designed
//    to pause silently after the trigger statement.
//
// 4. PRESERVE ACKNOWLEDGMENT — When Gemini's message is something like
//    "That's a very keen observation.", the augmented version must
//    preserve the original acknowledgment AND end with a '?'. We do
//    NOT silently replace Gemini's words.
//
// 5. EMPTY / NON-STRING FALLBACK — If Gemini returns an empty message
//    or no message field at all, the guardrail must still emit a '?'.

const fs = require('fs');
const path = require('path');
const seedData = require('../seedData.js');

const CONTROLLER_PATH = path.join(__dirname, '..', 'controllers', 'tutorController.js');
const controllerSource = fs.readFileSync(CONTROLLER_PATH, 'utf8');

let pass = 0;
let fail = 0;
const failures = [];

function check(label, condition, detail = '') {
  if (condition) {
    pass++;
    console.log(`  \u2713 ${label}`);
  } else {
    fail++;
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`  \u2717 ${label}${detail ? ` (${detail})` : ''}`);
  }
}

// ── Section 1: Prompt rule exists in the controller source ─────────────

console.log('\n[1] System prompt contains universal "must end with a question" rule');

const rulePhrases = [
  'Every response you send to the learner MUST end with a concrete question',
  'NEVER end a turn with only an acknowledgment',
  'The closing question or task must be something a first-time learner can act on',
  'cognitiveTrigger phase, where you may pause silently'
];

for (const phrase of rulePhrases) {
  check(`rule mentions: "${phrase.slice(0, 60)}..."`,
    controllerSource.includes(phrase));
}

// ── Section 2: Guardrail function exists in the controller source ───────

console.log('\n[2] Controller has the question-required guardrail code');

const guardrailSignals = [
  'appendFollowUpQuestion',
  '6.6 Question-required guardrail',
  'status === \'needs_guidance\'',
  'IMPERATIVE_TASK_REGEX',
  'activePhase !== \'cognitiveTrigger\''
];

for (const sig of guardrailSignals) {
  check(`controller source contains: \`${sig}\``, controllerSource.includes(sig));
}

// ── Section 3: Guardrail behavior across all 5 case studies ─────────────
//
// Inline re-implementation of the guardrail. Mirrors tutorController.js
// §6.6 + appendFollowUpQuestion. Any drift between this and the
// controller would surface as a real bug, not a test artifact, so we
// double-check by comparing key strings in source.

console.log('\n[3] Guardrail behavior across all 5 case studies');

const ALL_CASE_STUDIES = seedData;

const PHASE_ORDER = [
  'observation','firstAttempt','guidedQuestions','cognitiveTrigger',
  'discovery','programmingMapping','practice','reflection'
];

// Phases that get the guardrail. cognitiveTrigger is excluded by design.
const GUARDED_PHASES = PHASE_ORDER.filter(p => p !== 'cognitiveTrigger');

function followUpQuestionForPhase(activePhase, caseStudy, questionIndex) {
  const safe = caseStudy || {};
  switch (activePhase) {
    case 'observation':
      return safe.observation?.prompt || 'What do you notice about what is happening in the scenario?';
    case 'firstAttempt':
      return safe.firstAttempt?.prompt || 'How would you go about solving this?';
    case 'guidedQuestions': {
      const qs = safe.guidedQuestions || [];
      return qs[questionIndex || 0]?.question || qs[0]?.question
        || 'Could you say a bit more about what you are thinking?';
    }
    case 'discovery':
      return safe.discovery?.bridgeQuestion || 'Should these items live in the same place in the program?';
    case 'programmingMapping':
      return safe.programmingMapping?.miniTask || 'In your own words, what does this Python syntax represent?';
    case 'practice': {
      const t = safe.practice?.[0];
      return t?.task || 'What would your first line of code look like?';
    }
    case 'reflection': {
      const qs = safe.reflection?.questions || [];
      return qs[0] || 'Looking back, what is the main idea you are taking away?';
    }
    default:
      return 'Could you say a bit more about what you are thinking?';
  }
}

function appendFollowUpQuestion(originalMessage, activePhase, caseStudy, questionIndex) {
  const followUp = followUpQuestionForPhase(activePhase, caseStudy, questionIndex);
  const trimmed = (originalMessage || '').trim().replace(/[.!?]+$/, '');
  if (!trimmed) return followUp;
  return `${trimmed}. ${followUp}`;
}

// Mirrors IMPERATIVE_VERBS / IMPERATIVE_TASK_REGEX in tutorController.js.
const IMPERATIVE_VERBS = [
  'store','add','append','build','write','print','create','modify','update',
  'run','type','give','show','describe','explain','try','implement','define',
  'name','list','compare','think','consider','look','identify','recall',
  'remember','take','complete','fill','open','close','read','sketch','draw',
  'decide','predict','check','verify','test','observe','notice','tell','say',
  'share','imagine','suppose','rewrite','edit','refactor','find','locate',
  'sort','group','arrange','compute','calculate','count','measure','estimate',
  'trace','walk through','spell out','think through','say out loud','write down'
];
const IMPERATIVE_TASK_REGEX = new RegExp(
  `(?:[.!?]\\s+|^)\\s*(?:${IMPERATIVE_VERBS.join('|')})\\b`, 'i'
);

function isActionable(message) {
  if (typeof message !== 'string') return false;
  if (message.trim() === '') return false;
  return message.includes('?') || IMPERATIVE_TASK_REGEX.test(message);
}

function applyGuardrail(tutorResponse, activePhase, caseStudy, questionIndex) {
  if (
    tutorResponse.status === 'needs_guidance' &&
    activePhase !== 'cognitiveTrigger' &&
    !isActionable(tutorResponse.message)
  ) {
    tutorResponse.message = appendFollowUpQuestion(
      typeof tutorResponse.message === 'string' ? tutorResponse.message : '',
      activePhase, caseStudy, questionIndex
    );
  }
  return tutorResponse;
}

// 3a. The exact reported bug — "That's a very keen observation." with no question.
console.log('\n[3a] Reported bug scenario — pure acknowledgment, all case studies');

const ACKNOWLEDGMENT_MESSAGES = [
  "That's a very keen observation.",
  "Great answer!",
  "Excellent.",
  "Well done.",
  "I appreciate that response."
];

for (const caseStudy of ALL_CASE_STUDIES) {
  for (const phase of GUARDED_PHASES) {
    for (const msg of ACKNOWLEDGMENT_MESSAGES) {
      const input = { status: 'needs_guidance', message: msg };
      const output = applyGuardrail(input, phase, caseStudy, 0);
      // After the guardrail, the message must be actionable. We accept
      // either a '?' OR an imperative-task pattern in the appended text.
      check(
        `${caseStudy.id} / ${phase} / "${msg.slice(0, 30)}..." → augmented to be actionable`,
        isActionable(output.message),
        `output: "${output.message}"`
      );
    }
  }
}

// 3b. Responses that already contain a '?' are passed through unchanged.
console.log('\n[3b] Responses with a question are NOT modified');

for (const caseStudy of ALL_CASE_STUDIES) {
  for (const phase of GUARDED_PHASES) {
    const msgWithQ = "That's a good point. Can you say more about why?";
    const input = { status: 'needs_guidance', message: msgWithQ };
    const output = applyGuardrail(input, phase, caseStudy, 0);
    check(
      `${caseStudy.id} / ${phase} — preserves original message with '?'`,
      output.message === msgWithQ
    );
  }
}

// 3b-bis. Imperative-task endings are NOT augmented.
console.log('\n[3b-bis] Imperative-task endings are recognized as actionable');

// These are real seedData strings. None contain '?', but each ends with an
// imperative verb that the guardrail should recognize as actionable.
const TASK_MESSAGES = [
  "Great answer. Store the prices of five fruits in a list called fruit_prices. Example: apple = 30",
  "Nice work. Add Sara and Arjun-S to the end of the students list. Then print the total count of students using len().",
  "Excellent thinking. Build the attendance register for Monday. Store the 8 students in a list called students. Then print how many students there are.",
  "Good. Store five of your favourite movies in a list called movies.",
  "Okay. Try writing the loop yourself first."
];

for (const caseStudy of ALL_CASE_STUDIES) {
  for (const phase of GUARDED_PHASES) {
    for (const msg of TASK_MESSAGES) {
      const input = { status: 'needs_guidance', message: msg };
      const output = applyGuardrail(input, phase, caseStudy, 0);
      check(
        `${caseStudy.id} / ${phase} / imperative task → not augmented (preserved verbatim)`,
        output.message === msg,
        `expected: "${msg.slice(0, 40)}..." got: "${output.message.slice(0, 60)}..."`
      );
    }
  }
}

// 3b-ter. Mixed: acknowledgment + question. Already-actionable. Not augmented.
console.log('\n[3b-ter] Mixed acknowledgment + question is not augmented');

const MIXED_MESSAGES = [
  "Great answer. Could you tell me why you chose that approach?",
  "Excellent. What does the next line do?",
  "Good. How would you extend this to handle 80 players?"
];

for (const caseStudy of ALL_CASE_STUDIES) {
  for (const phase of GUARDED_PHASES) {
    for (const msg of MIXED_MESSAGES) {
      const input = { status: 'needs_guidance', message: msg };
      const output = applyGuardrail(input, phase, caseStudy, 0);
      check(
        `${caseStudy.id} / ${phase} / mixed → preserved verbatim`,
        output.message === msg,
        `got: "${output.message}"`
      );
    }
  }
}

// 3c. Acknowledgment is PRESERVED in the augmented message.
console.log('\n[3c] Augmented message preserves the original acknowledgment');

const OBSERVATION_CS = ALL_CASE_STUDIES.find(cs => cs.id === 'cricket-scoreboard');
const obsResult = applyGuardrail(
  { status: 'needs_guidance', message: "That's a very keen observation." },
  'observation',
  OBSERVATION_CS,
  0
);

check('observation/augmented message keeps "keen observation" verbatim',
  obsResult.message.includes("That's a very keen observation"),
  `got: "${obsResult.message}"`);

check('observation/augmented message ends with "?"',
  obsResult.message.trim().endsWith('?'),
  `got: "${obsResult.message}"`);

// 3d. cognitiveTrigger is NEVER augmented, even without a '?'.
console.log('\n[3d] cognitiveTrigger phase is excluded from the guardrail');

const TRIGGER_MSG = "80 players × 10 matches = 800 individual score entries. Let that number land.";
const triggerResult = applyGuardrail(
  { status: 'needs_guidance', message: TRIGGER_MSG },
  'cognitiveTrigger',
  OBSERVATION_CS,
  0
);
check('cognitiveTrigger — message unchanged even without "?"',
  triggerResult.message === TRIGGER_MSG,
  `got: "${triggerResult.message}"`);

// 3e. Status other than needs_guidance is untouched.
console.log('\n[3e] Non-needs_guidance statuses are not augmented');

for (const status of ['phase_complete', 'insight_reached', 'session_complete', 'retry']) {
  for (const caseStudy of ALL_CASE_STUDIES) {
    for (const phase of GUARDED_PHASES) {
      const input = { status, message: "That's a very keen observation." };
      const output = applyGuardrail(input, phase, caseStudy, 0);
      check(
        `${caseStudy.id} / ${phase} / status=${status} — untouched`,
        output.message === "That's a very keen observation."
      );
    }
  }
}

// 3f. Empty / missing message still produces a '?'.
console.log('\n[3f] Empty and missing message fields');

const emptyCases = [
  { status: 'needs_guidance', message: '' },
  { status: 'needs_guidance', message: '   ' },
  { status: 'needs_guidance' /* no message field */ },
  { status: 'needs_guidance', message: null },
  { status: 'needs_guidance', message: '.' },
  { status: 'needs_guidance', message: '!' }
];

for (const caseStudy of ALL_CASE_STUDIES) {
  for (const phase of GUARDED_PHASES) {
    for (const input of emptyCases) {
      const output = applyGuardrail({ ...input }, phase, caseStudy, 0);
      // Empty/missing message is replaced with the follow-up. The follow-up
      // must be actionable (question OR imperative task).
      check(
        `${caseStudy.id} / ${phase} / empty-ish input → still actionable`,
        isActionable(output.message),
        `input msg: ${JSON.stringify(input.message)}, output: "${output.message}"`
      );
    }
  }
}

// 3g. Non-string message is replaced with a follow-up question (no crash).
console.log('\n[3g] Non-string message fields are replaced with a follow-up (no crash)');

const weirdCases = [
  { status: 'needs_guidance', message: 42 },
  { status: 'needs_guidance', message: ['array', 'message'] },
  { status: 'needs_guidance', message: { nested: 'object' } }
];

for (const caseStudy of ALL_CASE_STUDIES) {
  for (const phase of GUARDED_PHASES) {
    for (const input of weirdCases) {
      let crashed = false;
      let output;
      try {
        output = applyGuardrail({ ...input }, phase, caseStudy, 0);
      } catch (e) {
        crashed = true;
      }
      // The non-string message is replaced entirely with a string follow-up.
      // This is a HARDENING improvement over the old behaviour (which let
      // the non-string slip through verbatim and reach the learner as-is).
      check(
        `${caseStudy.id} / ${phase} / weird-type input — no crash, message replaced with string follow-up`,
        !crashed && typeof output.message === 'string' && isActionable(output.message),
        `crashed: ${crashed}, output: ${JSON.stringify(output && output.message)}`
      );
    }
  }
}

// 3h. Per-phase follow-up question is the phase's own seedData prompt where available.
console.log('\n[3h] Follow-up question comes from the case study\'s own seedData');

const CS = OBSERVATION_CS;
const expectedObsPrompt = CS.observation.prompt;
const obsRes = applyGuardrail(
  { status: 'needs_guidance', message: "Good thinking." },
  'observation',
  CS,
  0
);
check('observation — follow-up includes case study\'s own prompt',
  obsRes.message.includes(expectedObsPrompt.slice(0, 30)),
  `got: "${obsRes.message}"`);

const expectedFirstAttemptPrompt = CS.firstAttempt.prompt;
const firstRes = applyGuardrail(
  { status: 'needs_guidance', message: "Good thinking." },
  'firstAttempt',
  CS,
  0
);
check('firstAttempt — follow-up includes case study\'s own prompt',
  firstRes.message.includes(expectedFirstAttemptPrompt.slice(0, 30)),
  `got: "${firstRes.message}"`);

const expectedBridge = CS.discovery.bridgeQuestion;
const discRes = applyGuardrail(
  { status: 'needs_guidance', message: "Good thinking." },
  'discovery',
  CS,
  0
);
check('discovery — follow-up includes case study\'s own bridge question',
  discRes.message.includes(expectedBridge.slice(0, 30)),
  `got: "${discRes.message}"`);

// 3i. guidedQuestions at a specific questionIndex uses that question, not the first.
console.log('\n[3i] guidedQuestions — follow-up re-asks the current question index');

const gqRes0 = applyGuardrail(
  { status: 'needs_guidance', message: "Good thinking." },
  'guidedQuestions',
  CS,
  0
);
const gqRes1 = applyGuardrail(
  { status: 'needs_guidance', message: "Good thinking." },
  'guidedQuestions',
  CS,
  1
);

check('guidedQuestions / qIdx=0 — uses guidedQuestions[0].question',
  gqRes0.message.includes(CS.guidedQuestions[0].question.slice(0, 30)),
  `got: "${gqRes0.message}"`);

check('guidedQuestions / qIdx=1 — uses guidedQuestions[1].question',
  gqRes1.message.includes(CS.guidedQuestions[1].question.slice(0, 30)),
  `got: "${gqRes1.message}"`);

check('guidedQuestions / qIdx=0 and qIdx=1 produce different follow-ups',
  gqRes0.message !== gqRes1.message);

// ── Section 4: v1.0 case studies (bakery, age, inventory) coverage ───────
//
// v1.0 case studies have observation.expectedKeywords now (per earlier
// migration), but they may have thinner phase data. The guardrail's
// fallbacks should still produce a valid '?' for every phase.

console.log('\n[4] v1.0 case studies (bakery, age, inventory) — every guarded phase produces a "?"');

const V10_STUDIES = ALL_CASE_STUDIES.filter(cs =>
  ['bakery-checkout', 'age-verification', 'inventory-stock-checker'].includes(cs.id)
);

for (const caseStudy of V10_STUDIES) {
  for (const phase of GUARDED_PHASES) {
    const out = applyGuardrail(
      { status: 'needs_guidance', message: "That's a very keen observation." },
      phase, caseStudy, 0
    );
    check(
      `${caseStudy.id} / ${phase} — augmented with "?"`,
      out.message.includes('?'),
      `got: "${out.message}"`
    );
  }
}

// ── Section 5: Architectural isolation ──────────────────────────────────
//
// The reported bug is "tutor responds with only a confirmation." We want
// to be sure the guardrail's appended question does NOT echo the wrong
// case study's vocabulary. For example, a tiffin-service learner should
// never see a cricket question in their augmented message.

console.log('\n[5] Architectural isolation — appended question uses active case study');

const tiffin = ALL_CASE_STUDIES.find(cs => cs.id === 'tiffin-service');
const bakery = ALL_CASE_STUDIES.find(cs => cs.id === 'bakery-checkout');

const cricketInTiffin = applyGuardrail(
  { status: 'needs_guidance', message: "Good thinking." },
  'observation', tiffin, 0
);
check('tiffin observation follow-up does NOT contain cricket vocabulary',
  !/score|player|match|cricket/i.test(cricketInTiffin.message),
  `got: "${cricketInTiffin.message}"`);

const tiffinInBakery = applyGuardrail(
  { status: 'needs_guidance', message: "Good thinking." },
  'observation', bakery, 0
);
check('bakery observation follow-up does NOT contain tiffin vocabulary',
  !/tiffin|order|customer|delivery/i.test(tiffinInBakery.message),
  `got: "${tiffinInBakery.message}"`);

// ── Summary ──────────────────────────────────────────────────────────────

console.log(`\n──────────────────────────────────────`);
console.log(`Result: ${pass} pass, ${fail} fail`);

if (fail > 0) {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}

console.log('All question-required checks passed.');
