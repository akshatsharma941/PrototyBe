// End-to-end verification of the override path WITHOUT calling Gemini.
//
// We can't test against a live Gemini (quota exhausted), so we simulate the
// exact controller logic and confirm:
//   1. controllerAccepts reads expectedKeywords from the active case study
//   2. When controllerAccepts is true and Gemini said 'retry',
//      the override produces the right (message, status, phase, questionIndex)
//   3. When controllerAccepts is false, the override is not applied
//   4. The new message is sourced from seedData, not Gemini's fallback string
//   5. The same logic works for all 5 case studies

const seedData = require('../seedData.js');

// ── Inline copies of the relevant logic from tutorController.js ──────────
// (Duplicated here so we can test without starting the server. The real
// controller has the same logic — drift between this and the controller
// is a risk we accept for test-only isolation.)

const PHASE_ORDER = ['observation','firstAttempt','guidedQuestions','cognitiveTrigger','discovery','programmingMapping','practice','reflection'];

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
    case 'cognitiveTrigger':  return /too |cant|can't|overwhelm|hours|impossible|don.?t know|that's/i.test(lower);
    case 'discovery':         return /together|group|same|connected|under one|store together|put together|yes.*should|should be together/i.test(lower);
    case 'programmingMapping':return /okay|i see|that makes sense|right|got it|understood|clear|so it.?s like|like a/i.test(lower);
    case 'practice':          return lower.length > 10 || lower.includes('skip') || lower.includes('next');
    case 'reflection':        return lower.length > 0;
    default:                  return false;
  }
}

function phaseOpeningPrompt(caseStudy, phaseName) {
  if (!caseStudy) return null;
  const data = caseStudy[phaseName];
  if (!data) {
    if (phaseName === 'firstAttempt' && caseStudy.description) return caseStudy.description;
    return null;
  }
  switch (phaseName) {
    case 'observation':   return data.prompt || null;
    case 'firstAttempt':  return data.prompt || caseStudy.description || null;
    case 'guidedQuestions': return data?.[0]?.question || null;
    case 'cognitiveTrigger': return data.statement ? `Notice this: ${data.statement}` : null;
    case 'discovery':     return data.bridgeQuestion || null;
    case 'programmingMapping': return data.introduction || null;
    case 'practice':      return Array.isArray(data) && data[0]?.task || null;
    case 'reflection':    return Array.isArray(data.questions) && data.questions[0] || null;
    default: return null;
  }
}

function pickNextPhase(activePhase, caseStudy, currentQuestionIndex) {
  const phaseIndex = PHASE_ORDER.indexOf(activePhase);
  const nextPhase = PHASE_ORDER[phaseIndex + 1] || null;
  if (!nextPhase) return { prompt: 'You have worked through this case study. Great work!', nextPhase: null };
  if (activePhase === 'guidedQuestions') {
    const gq = caseStudy.guidedQuestions || [];
    const nextIndex = (currentQuestionIndex || 0) + 1;
    if (nextIndex < gq.length) return { prompt: gq[nextIndex].question, nextPhase: activePhase, questionIndex: nextIndex };
    return { prompt: phaseOpeningPrompt(caseStudy, 'cognitiveTrigger') || 'What pattern do you see repeating across these examples?', nextPhase: 'cognitiveTrigger', questionIndex: 0 };
  }
  let prompt;
  if (nextPhase === 'guidedQuestions') {
    prompt = caseStudy.guidedQuestions?.[0]?.question || phaseOpeningPrompt(caseStudy, nextPhase);
  } else {
    prompt = phaseOpeningPrompt(caseStudy, nextPhase);
  }
  return { prompt: prompt || `Let's move to the next phase.`, nextPhase, questionIndex: 0 };
}

function applyOverride(tutorResponse, activePhase, studentExplanation, caseStudy, questionIndex) {
  const accepted = controllerAccepts(activePhase, studentExplanation, caseStudy, questionIndex);
  if (accepted && tutorResponse.status === 'retry') {
    const next = pickNextPhase(activePhase, caseStudy, questionIndex);
    return {
      ...tutorResponse,
      message: next.prompt,
      status: 'phase_complete',
      nextPhase: next.nextPhase,
      questionIndex: next.questionIndex ?? questionIndex,
    };
  }
  return tutorResponse;
}

// ─── Tests ───────────────────────────────────────────────────────────────

const cricket   = seedData.find(s => s.id === 'cricket-scoreboard');
const tiffin    = seedData.find(s => s.id === 'tiffin-service-orders');
const bakery    = seedData.find(s => s.id === 'bakery-checkout');
const age       = seedData.find(s => s.id === 'age-verification-system');
const inventory = seedData.find(s => s.id === 'inventory-stock-checker');

let pass = 0, fail = 0;
function expect(name, cond, detail = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else      { fail++; console.log(`  ✗ ${name}  ${detail}`); }
}

// === Scenario 1: User's exact report (cricket) ===
console.log('\n=== Scenario 1: User-reported bug ("Each player\'s score" on cricket) ===');
{
  const tutorResponse = { message: 'I had trouble processing that. Could you try rephrasing?', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', "Each player's score", cricket, 0);
  expect('controller accepted', out.message !== 'I had trouble processing that. Could you try rephrasing?');
  expect('phase advanced to firstAttempt', out.nextPhase === 'firstAttempt');
  expect('status flipped to phase_complete', out.status === 'phase_complete');
  expect('message sourced from firstAttempt.prompt', out.message.startsWith('Arjun starts writing'));
  expect('questionIndex reset to 0', out.questionIndex === 0);
}

// === Scenario 2: Off-topic learner input still hits Gemini ===
console.log('\n=== Scenario 2: Off-topic ("cricket technique") — Gemini keeps control ===');
{
  const tutorResponse = { message: 'I had trouble processing that. Could you try rephrasing?', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', 'I love cricket', cricket, 0);
  expect('controller rejected (cricket technique is not data vocabulary)', out === tutorResponse);
  expect('rejection message preserved', out.message.includes('trouble processing'));
}

// === Scenario 3: Empty input — Gemini keeps control ===
console.log('\n=== Scenario 3: Empty input — Gemini keeps control ===');
{
  const tutorResponse = { message: 'I had trouble processing that. Could you try rephrasing?', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', '', cricket, 0);
  expect('controller rejected (empty)', out === tutorResponse);
}

// === Scenario 4: Gemini already advanced — no override needed ===
console.log('\n=== Scenario 4: Gemini already advanced — no override ===');
{
  const tutorResponse = { message: 'Great, what about the scale?', phase: 'firstAttempt', status: 'phase_complete', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', "Each player's score", cricket, 0);
  expect('no override needed', out === tutorResponse);
  expect('Gemini message preserved', out.message === 'Great, what about the scale?');
}

// === Scenario 5: All four example inputs from the user ===
console.log('\n=== Scenario 5: All four user-listed example inputs (cricket) ===');
const userInputs = ['player scores', "each player's score", 'he is managing scores', 'players and scores'];
for (const input of userInputs) {
  const tutorResponse = { message: 'I had trouble processing that. Could you try rephrasing?', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', input, cricket, 0);
  expect(`"${input}" → advance`, out.nextPhase === 'firstAttempt' && out.message.startsWith('Arjun starts writing'));
}

// === Scenario 6: Tiffin case study (per-case-study keywords) ===
console.log('\n=== Scenario 6: Tiffin case study — orders and addresses accepted ===');
{
  const tutorResponse = { message: 'I had trouble processing that.', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', "Each customer's address and city", tiffin, 0);
  expect('tiffin: phase advanced', out.nextPhase === 'firstAttempt');
  expect('tiffin: message from firstAttempt.prompt', out.message.startsWith("Meera's notebook"));
}

// === Scenario 7: Bakery case study ===
console.log('\n=== Scenario 7: Bakery case study — prices and quantities accepted ===');
{
  const tutorResponse = { message: 'I had trouble processing that.', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', '3 croissants at $2.50 and 2 coffees at $3.00', bakery, 0);
  expect('bakery: phase advanced', out.nextPhase === 'firstAttempt');
  expect('bakery: message from firstAttempt.prompt', out.message.startsWith("You are building"));
}

// === Scenario 8: Age Verification ===
console.log('\n=== Scenario 8: Age Verification — age threshold accepted ===');
{
  const tutorResponse = { message: 'I had trouble processing that.', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', 'the age has to be 18 or more', age, 0);
  expect('age: phase advanced', out.nextPhase === 'firstAttempt');
  expect('age: message from firstAttempt.prompt', out.message.startsWith("A website requires"));
}

// === Scenario 9: Inventory ===
console.log('\n=== Scenario 9: Inventory — list of items accepted ===');
{
  const tutorResponse = { message: 'I had trouble processing that.', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', 'a list of items in stock', inventory, 0);
  expect('inventory: phase advanced', out.nextPhase === 'firstAttempt');
  expect('inventory: message from firstAttempt.prompt', out.message.startsWith("A store keeps"));
}

// === Scenario 10: Architectural isolation — cricket vocabulary does NOT pass tiffin ===
console.log('\n=== Scenario 10: Architectural isolation — cricket vocabulary does NOT pass tiffin ===');
{
  const tutorResponse = { message: 'I had trouble processing that.', phase: 'observation', status: 'retry', questionIndex: 0 };
  const out = applyOverride(tutorResponse, 'observation', 'player scores', tiffin, 0);
  expect('cricket vocab not accepted on tiffin', out === tutorResponse);
}

// === Scenario 11: Per-phase transition correctness (cricket) ===
console.log('\n=== Scenario 11: Per-phase transition prompts (cricket) ===');
{
  const cases = [
    ['observation', 'players', 'firstAttempt'],
    ['firstAttempt', 'I would use one variable per player labelled with their name', 'guidedQuestions'],
    ['guidedQuestions', 'yes', 'guidedQuestions'],
  ];
  for (const [phase, input, expectedNext] of cases) {
    const tutorResponse = { message: 'I had trouble processing that.', phase, status: 'retry', questionIndex: 0 };
    const out = applyOverride(tutorResponse, phase, input, cricket, 0);
    expect(`${phase} → ${expectedNext}`, out.nextPhase === expectedNext, `got ${out.nextPhase}`);
  }
}

console.log(`\npass: ${pass}   fail: ${fail}`);
process.exit(fail === 0 ? 0 : 1);