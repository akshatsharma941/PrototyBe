// Verify pickNextPhase returns the right prompt from seedData.
const seedData = require('../seedData.js');

const PHASE_ORDER = ['observation','firstAttempt','guidedQuestions','cognitiveTrigger','discovery','programmingMapping','practice','reflection'];

function pickNextPhase(activePhase, caseStudy, currentQuestionIndex) {
  const phaseIndex = PHASE_ORDER.indexOf(activePhase);
  const nextPhase = PHASE_ORDER[phaseIndex + 1] || null;
  if (!nextPhase) {
    return { prompt: 'You have worked through this case study. Great work!', nextPhase: null };
  }
  if (activePhase === 'guidedQuestions') {
    const gq = caseStudy.guidedQuestions || [];
    const nextIndex = (currentQuestionIndex || 0) + 1;
    if (nextIndex < gq.length) {
      return { prompt: gq[nextIndex].question, nextPhase: activePhase, questionIndex: nextIndex };
    }
    return {
      prompt: caseStudy.cognitiveTrigger?.question || 'What pattern do you see repeating across these examples?',
      nextPhase: 'cognitiveTrigger',
      questionIndex: 0
    };
  }
  let prompt;
if (nextPhase === 'guidedQuestions') {
  prompt = caseStudy.guidedQuestions?.[0]?.question || null;
} else {
  const d = caseStudy[nextPhase];
  if (!d) prompt = null;
  else switch (nextPhase) {
    case 'observation':  prompt = d.prompt; break;
    case 'firstAttempt': prompt = d.prompt; break;
    case 'cognitiveTrigger': prompt = d.statement ? `Notice this: ${d.statement}` : null; break;
    case 'discovery':    prompt = d.bridgeQuestion; break;
    case 'programmingMapping': prompt = d.introduction; break;
    case 'practice':     prompt = Array.isArray(d) ? d[0]?.task : null; break;
    case 'reflection':   prompt = d.questions?.[0]; break;
    default: prompt = null;
  }
}
  return { prompt: prompt || `Let's move to the next phase.`, nextPhase, questionIndex: 0 };
}

const cricket = seedData.find(s => s.id === 'cricket-scoreboard');

console.log('=== pickNextPhase verification (cricket-scoreboard) ===\n');

const transitions = [
  { phase: 'observation',      expected: 'firstAttempt',       qIdx: 0 },
  { phase: 'firstAttempt',     expected: 'guidedQuestions',    qIdx: 0 },
  { phase: 'guidedQuestions',  expected: 'guidedQuestions',    qIdx: 1 }, // next question
  { phase: 'guidedQuestions',  expected: 'cognitiveTrigger',   qIdx: cricket.guidedQuestions.length - 1 }, // last Q → next phase
  { phase: 'cognitiveTrigger', expected: 'discovery',          qIdx: 0 },
  { phase: 'discovery',        expected: 'programmingMapping', qIdx: 0 },
  { phase: 'programmingMapping', expected: 'practice',         qIdx: 0 },
  { phase: 'practice',         expected: 'reflection',         qIdx: 0 },
  { phase: 'reflection',       expected: null,                 qIdx: 0 }, // session complete
];

let pass = 0, fail = 0;
for (const t of transitions) {
  const result = pickNextPhase(t.phase, cricket, t.qIdx);
  const ok = result.nextPhase === t.expected;
  if (ok) pass++; else fail++;
  const status = ok ? '✓' : '✗';
  console.log(`  ${status}  ${t.phase.padEnd(20)} → nextPhase=${result.nextPhase?.padEnd(20) ?? '(session_complete)'}   qIdx=${result.questionIndex ?? 0}`);
  console.log(`       prompt: "${(result.prompt || '').slice(0, 100)}${result.prompt && result.prompt.length > 100 ? '...' : ''}"`);
}

console.log(`\npass: ${pass}  fail: ${fail}`);
process.exit(fail === 0 ? 0 : 1);