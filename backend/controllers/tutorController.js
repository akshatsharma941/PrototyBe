// backend/controllers/tutorController.js
// Wires together: CaseStudy + Misconception Library + TutorEngine
// Uses Case Study Schema v1.1

const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const CaseStudy = require('../models/CaseStudy');
const tutorEngine = require('../tutorEngine');
const { getMisconception, getAllMisconceptions } = require('../misconceptions/library-index');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Phase Order Map ─────────────────────────────────────
// Derived from tutorEngine phases, in order.

const PHASE_ORDER = Object.values(tutorEngine.phases)
  .sort((a, b) => a.order - b.order)
  .map(p => p.name);

// ─── Retry helper for upstream Gemini quota / transient 5xx ───────────────
// On a 429 the GoogleGenerativeAIFetchError carries errorDetails with a
// RetryInfo.retryDelay hint (seconds). We sleep that long (capped) and retry
// a few times before giving up. Non-429 errors propagate immediately.
async function withRetry(fn, { attempts = 3, maxWaitMs = 60_000 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err?.status || err?.response?.status;
      const isQuota = status === 429 ||
        (err?.errorDetails || []).some(d => d?.['@type']?.endsWith('QuotaFailure'));
      if (!isQuota || i === attempts - 1) throw err;

      const retryInfo = (err.errorDetails || []).find(d => d?.['@type']?.endsWith('RetryInfo'));
      let waitSec = 2;
      if (retryInfo?.retryDelay) {
        const m = String(retryInfo.retryDelay).match(/(\d+(?:\.\d+)?)/);
        if (m) waitSec = parseFloat(m[1]);
      }
      const waitMs = Math.min(maxWaitMs, Math.ceil(waitSec * 1000));
      console.warn(`Tutor: Gemini 429 (attempt ${i + 1}/${attempts}); retrying in ${waitMs}ms`);
      await new Promise(r => setTimeout(r, waitMs));
    }
  }
  throw lastErr;
}

// ─── Keyword Sets for Transition Inference ───────────────
//
// Phase-specific acceptance signals. The controller stays domain-agnostic:
// every keyword set is either generic (e.g. UNDERSTANDING_SIGNALS) or read
// from the active case study at runtime.
//
// The observation phase reads `caseStudy.observation.expectedKeywords`.
// This means each case study in seedData.js owns its own observation
// vocabulary — adding a new case study never requires touching this file.

const SCALE_SIGNALS = [
  "80", "800", "eighty", "eight hundred", "too many", "can't manage",
  "impossible", "slow", "hours", "overwhelming", "a lot", "too much"
];

const GROUPING_SIGNALS = [
  "yes", "group", "together", "same name", "same place", "connected",
  "belong together", "with each other", "under one", "store together",
  "put together", "yes they should", "should be together"
];

const UNDERSTANDING_SIGNALS = [
  "okay", "i see", "that makes sense", "right", "yes", "got it",
  "understood", "clear", "so it's like", "like a"
];

// ─── POST /api/tutor/explanation ─────────────────────────

exports.submitExplanation = async (req, res) => {
  try {
    const {
      caseStudyId,
      studentExplanation,
      currentPhase,
      questionIndex,
      attemptCount = 0
    } = req.body;

    if (!caseStudyId || !studentExplanation) {
      return res.status(400).json({
        error: 'caseStudyId and studentExplanation are required'
      });
    }

    // 1. Load case study from MongoDB.
    // caseStudyId may be either a Mongo ObjectId (24 hex chars) or the
    // human-readable slug (e.g. "cricket-scoreboard") used by frontend routes.
    // caseStudyController.getCaseStudyById already does this lookup; replicate
    // it here so the tutor works with both shapes.
    let caseStudy = null;
    if (mongoose.Types.ObjectId.isValid(caseStudyId)) {
      caseStudy = await CaseStudy.findById(caseStudyId);
    }
    if (!caseStudy) {
      caseStudy = await CaseStudy.findOne({ id: caseStudyId });
    }
    if (!caseStudy) {
      return res.status(404).json({ error: 'Case study not found' });
    }

    // 2. Determine current phase
    const activePhase = currentPhase || PHASE_ORDER[0];
    const phaseConfig = tutorEngine.phases[activePhase];

    // 3. Build the system prompt
    const systemPrompt = buildSystemPrompt(
      caseStudy,
      activePhase,
      questionIndex,
      attemptCount
    );

    // 4. Call Gemini
    const model = genAI.getGenerativeModel({
      model: tutorEngine.engine.model,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: tutorEngine.engine.temperature
      }
    });

    const result = await withRetry(() => model.generateContent([
      { text: systemPrompt },
      { text: `Learner Response: ${studentExplanation}` }
    ]));

    // 5. Parse response
    const responseText = result.response.text();
    let tutorResponse;

    try {
      tutorResponse = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Tutor: Gemini returned non-JSON. First 500 chars:', responseText.slice(0, 500));
      return res.status(200).json({
        message: tutorEngine.persona.fallback.error,
        phase: activePhase,
        status: 'retry',
        questionIndex: questionIndex || 0,
        attemptCount: 0,
        phaseProgress: buildProgress(activePhase, questionIndex, caseStudy)
      });
    }

    // 6. Determine transition
    const transition = determineTransition(
      tutorResponse,
      activePhase,
      studentExplanation,
      questionIndex,
      attemptCount,
      caseStudy
    );

    // 6.5 Controller-level acceptance override.
    // The controller has authoritative keyword matchers for what counts as
    // a valid learner response at each phase. When the controller's check
    // accepts but Gemini has emitted a rejection (status: 'retry' with a
    // fallback message), we override Gemini: never show the rejection,
    // jump to the next phase using its prompt as the message.
    const controllerAccepted = controllerAccepts(activePhase, studentExplanation, caseStudy, questionIndex);
    if (controllerAccepted && tutorResponse.status === 'retry') {
      const nextPhaseInfo = pickNextPhase(activePhase, caseStudy, questionIndex);
      tutorResponse.message = nextPhaseInfo.prompt;
      tutorResponse.status = 'phase_complete';
      transition.nextPhase = nextPhaseInfo.nextPhase;
      transition.status = 'phase_complete';
      if (nextPhaseInfo.questionIndex !== undefined) {
        transition.questionIndex = nextPhaseInfo.questionIndex;
      }
    }

    res.json({
      message: tutorResponse.message,
      phase: transition.nextPhase || activePhase,
      status: transition.status,
      questionIndex: transition.questionIndex !== undefined
        ? transition.questionIndex
        : questionIndex || 0,
      attemptCount: transition.attemptCount !== undefined
        ? transition.attemptCount
        : 0,
      phaseProgress: buildProgress(
        transition.nextPhase || activePhase,
        transition.questionIndex ?? questionIndex ?? 0,
        caseStudy
      )
    });

  } catch (err) {
    console.error('Tutor Error:', err);

    // The Gemini SDK throws GoogleGenerativeAIFetchError for upstream HTTP
    // errors. Distinguish rate-limit (429) and quota-exceeded from generic
    // failures so the learner sees a useful message instead of a generic
    // "try rephrasing" — which is misleading when their input had nothing
    // to do with the failure.
    const status = err?.status || err?.response?.status;
    const errorDetails = err?.errorDetails || [];
    const isQuota = status === 429 ||
      errorDetails.some(d => d?.['@type']?.endsWith('QuotaFailure')) ||
      /quota|rate.?limit|429/i.test(err?.message || '');
    const retryInfo = errorDetails.find(d => d?.['@type']?.endsWith('RetryInfo'));
    const retryDelaySec = (() => {
      if (!retryInfo?.retryDelay) return null;
      const m = String(retryInfo.retryDelay).match(/(\d+(?:\.\d+)?)/);
      return m ? Math.ceil(parseFloat(m[1])) : null;
    })();

    const message = isQuota
      ? (tutorEngine.persona.fallback.rateLimit
          || 'The AI tutor is temporarily rate-limited. Please wait a few seconds and try again.')
      : tutorEngine.persona.fallback.error;

    // Return 200 (not 500). The frontend's Tutor page has its own (hard-coded)
    // kitchen-sink fallback that fires on any non-2xx response — and that
    // fallback is themed for the Bakery Checkout case study, which leaks into
    // unrelated case-study sessions. Surface the persona's actual fallback
    // message via 200 so the page can render it consistently.
    res.status(200).json({
      message,
      phase: req.body.currentPhase || 'observation',
      status: 'retry',
      isRateLimit: !!isQuota,
      retryAfterSeconds: retryDelaySec
    });
  }
};

// ─── Prompt Builder ───────────────────────────────────────

function buildSystemPrompt(caseStudy, activePhase, questionIndex, attemptCount) {
  const persona = tutorEngine.persona;
  const phaseConfig = tutorEngine.phases[activePhase];

  const guidedQuestions = caseStudy.guidedQuestions || [];
  const activeQuestion = guidedQuestions[questionIndex] || {};
  const activeMisconception = activeQuestion.targetsMisconception
    ? getMisconception(activeQuestion.targetsMisconception)
    : null;
  const allMisconceptions = getAllMisconceptions();

  const retry = tutorEngine.retry;
  const hint = (attemptCount > 0 && attemptCount <= retry.hintLevels.length)
    ? retry.hintLevels[attemptCount - 1].message
    : null;

  return `
You are ${persona.name}, an expert Python tutor.
Style: ${persona.style}
Rules:
${persona.rules.map(r => `- ${r}`).join('\n')}

CURRENT PHASE: ${activePhase}
Phase description: ${phaseConfig.description}
${activePhase === 'cognitiveTrigger' && phaseConfig.forcePause ? 'IMPORTANT: This phase requires a pause. After presenting the trigger, stop and wait for the learner\'s response.' : ''}
${hint ? `HINT to offer learner (after ${attemptCount} attempts): "${hint}"` : ''}

Case Study: ${caseStudy.title}
${caseStudy.story ? `
Story context (for your understanding — do not read this to the learner verbatim):
- Setting: ${caseStudy.story.setting}
- Protagonist: ${caseStudy.story.protagonist}
- Situation: ${caseStudy.story.situation}
- Tension: ${caseStudy.story.tension}
- Emotion to evoke: ${caseStudy.story.emotion}
` : ''}

${activePhase === 'observation' ? `
PHASE INSTRUCTION: Ask the learner what they notice. Accept any observation mentioning data elements (names, numbers, players, scores). Do not lead the observation.

Question to show the learner:
"${caseStudy.observation?.prompt || 'What do you notice about what Arjun is managing?'}"

Observation signals (for your reference, NOT shown to learner):
- Valid observation: ${(caseStudy.observation?.whatToNotice || []).join(', ')}
- Not yet ready signals: ${(caseStudy.observation?.notYetReady || []).join(', ')}
` : ''}

${activePhase === 'firstAttempt' ? `
PHASE INSTRUCTION: Ask the learner to propose their natural solution. Do not correct or guide. Let the learner's mental model surface.

Question to show the learner:
"${caseStudy.firstAttempt?.prompt || "How would you track all 80 players' scores?"}"

Model responses (for creator reference only):
- Strong attempt: ${caseStudy.firstAttempt?.modelGood || 'n/a'}
- Weak attempt: ${caseStudy.firstAttempt?.modelWeak || 'n/a'}
- What this reveals: ${caseStudy.firstAttempt?.reveals || 'n/a'}
` : ''}

${activePhase === 'guidedQuestions' ? `
PHASE INSTRUCTION: Ask Socratic questions. Each question should expose a weakness in the learner's current model. After asking the question, STOP and wait for the learner's response.

${activeQuestion.question ? `
Question to ask NOW (question ${(questionIndex || 0) + 1} of ${guidedQuestions.length}):
"${activeQuestion.question}"
` : 'All guided questions have been asked.'}

${activeMisconception ? `
Misconception being targeted: "${activeMisconception.misconception.text}"
- Why it feels true to the learner: "${activeMisconception.misconception.whyItFeelsTrue}"
- Why it fails: "${activeMisconception.misconception.whyItFails}"
- Hint for stuck learner: "${activeMisconception.hint}"`
 : ''}

${activeQuestion.ifStuck ? `
If the learner is very stuck or silent, say: "${activeQuestion.ifStuck}"`
 : ''}
` : ''}

${activePhase === 'cognitiveTrigger' ? `
PHASE INSTRUCTION: Present the trigger statement forcefully. Pause. Let it land. Do not explain or follow up — stop and wait for the learner's reaction.

TRIGGER STATEMENT to show the learner:
${caseStudy.cognitiveTrigger?.statement || '80 players × 10 matches = 800 individual score entries'}

Presentation note: ${caseStudy.cognitiveTrigger?.presentationNote || 'Pause after saying the number. Let the silence land.'}

${caseStudy.cognitiveTrigger?.pauseRequired ? 'IMPORTANT: After showing this, STOP. Do not say anything else. Wait for the learner to respond.' : ''}
` : ''}

${activePhase === 'discovery' ? `
PHASE INSTRUCTION: Ask the bridge question. Guide toward the insight without stating it directly.

Bridge question: "${caseStudy.discovery?.bridgeQuestion || 'If all Vikram\'s scores belong together, should they also be stored together?'}"

Hint if learner is silent or stuck: "${caseStudy.discovery?.hint || 'Think about where Vikram\'s scores are written. Are they grouped together?'}"
` : ''}

${activePhase === 'programmingMapping' ? `
PHASE INSTRUCTION: Connect the discovered concept to Python. Name the concept. Show minimal syntax. Explain each symbol.

${caseStudy.programmingMapping?.introduction ? `
Introduction to say: "${caseStudy.programmingMapping.introduction}"`
 : ''}

${caseStudy.programmingMapping?.pythonCode ? `
Python code to show:
\`\`\`python
${caseStudy.programmingMapping.pythonCode}
\`\`\``
 : ''}

${caseStudy.programmingMapping?.symbols?.length ? `
Symbol explanations:
${caseStudy.programmingMapping.symbols.map(s => `- ${s.symbol}: ${s.meaning}`).join('\n')}`
 : ''}

${caseStudy.programmingMapping?.miniTask ? `
Mini task after code: "${caseStudy.programmingMapping.miniTask}"`
 : ''}
` : ''}

${activePhase === 'practice' ? `
PHASE INSTRUCTION: The learner writes code. Provide brief, encouraging feedback. Point out errors gently without giving the full solution.

Practice task: "${caseStudy.practice?.[0]?.task || 'Store five of your favourite movies in a list called movies.'}"

${caseStudy.practice?.[0]?.starterCode ? `
Starter code available:
\`\`\`python
${caseStudy.practice[0].starterCode}
\`\`\``
 : ''}

${caseStudy.practice?.[0]?.hint ? `
Hint if learner is stuck: "${caseStudy.practice[0].hint}"`
 : ''}
` : ''}

${activePhase === 'reflection' ? `
PHASE INSTRUCTION: Ask the reflection questions. Then collect confidence ratings for each learning objective.

Questions:
${(caseStudy.reflection?.questions || []).map(q => `- ${q}`).join('\n')}

Confidence survey — ask after reflection questions:
${(caseStudy.reflection?.confidenceSurvey || []).map(c =>
  `"${c.prompt}" — Ask the learner to rate 1 (not confident) to 5 (very confident).`
).join('\n')}
` : ''}

All available misconceptions in the library (for reference):
${Object.values(allMisconceptions).map(m =>
  `- ${m.id}: "${m.misconception.text}"`
).join('\n')}

Your response MUST be valid JSON with exactly this structure:
{
  "message": "Your message to the learner",
  "phase": "${activePhase}",
  "status": "needs_guidance | insight_reached | phase_complete | session_complete | retry"
}

IMPORTANT: Respond with ONLY the JSON object. No markdown, no explanation, no text outside the JSON.
`.trim();
}

// ─── Transition Logic ─────────────────────────────────────
// Infers phase advancement from learner's response and case study content.

function determineTransition(tutorResponse, activePhase, learnerResponse, questionIndex, attemptCount, caseStudy) {
  const status = tutorResponse.status || 'needs_guidance';
  const lowerResponse = learnerResponse.toLowerCase();
  const guidedQuestions = caseStudy.guidedQuestions || [];

  // ── Check for explicit status flags ──

  if (status === 'insight_reached') {
    return advancePhase(activePhase, guidedQuestions.length, questionIndex);
  }

  if (status === 'phase_complete') {
    return advancePhase(activePhase, guidedQuestions.length, questionIndex);
  }

  if (status === 'session_complete') {
    return { nextPhase: null, status: 'session_complete' };
  }

  // ── Retry: too many failed attempts ──
  if (status === 'retry' && attemptCount >= tutorEngine.retry.maxAttemptsPerQuestion) {
    // Exhausted retries — advance to next question or next phase
    if (activePhase === 'guidedQuestions') {
      const nextIndex = (questionIndex || 0) + 1;
      if (nextIndex >= guidedQuestions.length) {
        return advancePhase(activePhase, guidedQuestions.length, nextIndex);
      }
      return { nextPhase: activePhase, status: 'needs_guidance', questionIndex: nextIndex, attemptCount: 0 };
    }
    return advancePhase(activePhase, guidedQuestions.length, questionIndex);
  }

  // ── Phase-specific transition logic ──

  switch (activePhase) {

    case 'observation': {
      const keywords = caseStudy?.observation?.expectedKeywords || [];
      const hasDataElements = keywords.some(s => lowerResponse.includes(s));
      if (hasDataElements) {
        return advancePhase(activePhase, guidedQuestions.length, questionIndex);
      }
      return { nextPhase: activePhase, status: 'needs_guidance' };
    }

    case 'firstAttempt': {
      // Any response that proposes an organisation strategy counts
      const proposedApproach = lowerResponse.length > 20;
      if (proposedApproach) {
        return advancePhase(activePhase, guidedQuestions.length, questionIndex);
      }
      return { nextPhase: activePhase, status: 'needs_guidance' };
    }

    case 'guidedQuestions': {
      const nextIndex = (questionIndex || 0) + 1;

      if (nextIndex >= guidedQuestions.length) {
        // All questions done — advance to cognitiveTrigger
        return advancePhase(activePhase, guidedQuestions.length, nextIndex);
      }

      return { nextPhase: activePhase, status: 'needs_guidance', questionIndex: nextIndex };
    }

    case 'cognitiveTrigger': {
      const acknowledged = SCALE_SIGNALS.some(s => lowerResponse.includes(s))
        || lowerResponse.includes("that's")
        || lowerResponse.includes("too ")
        || lowerResponse.includes("can't")
        || lowerResponse.includes("impossible")
        || lowerResponse.includes("don't know");

      if (acknowledged) {
        return advancePhase(activePhase, guidedQuestions.length, questionIndex);
      }
      return { nextPhase: activePhase, status: 'needs_guidance' };
    }

    case 'discovery': {
      const expressedGrouping = GROUPING_SIGNALS.some(s => lowerResponse.includes(s));
      if (expressedGrouping) {
        return advancePhase(activePhase, guidedQuestions.length, questionIndex);
      }
      // Partial — use hint
      return { nextPhase: activePhase, status: 'needs_guidance' };
    }

    case 'programmingMapping': {
      const acknowledged = UNDERSTANDING_SIGNALS.some(s => lowerResponse.includes(s));
      if (acknowledged) {
        return advancePhase(activePhase, guidedQuestions.length, questionIndex);
      }
      return { nextPhase: activePhase, status: 'needs_guidance' };
    }

    case 'practice': {
      // Practice is optional — advance on any attempt or explicit skip
      const skipped = lowerResponse.includes("skip") || lowerResponse.includes("next");
      if (skipped || lowerResponse.length > 10) {
        return advancePhase(activePhase, guidedQuestions.length, questionIndex);
      }
      return { nextPhase: activePhase, status: 'needs_guidance' };
    }

    case 'reflection': {
      // Reflection is optional — advance when done
      return advancePhase(activePhase, guidedQuestions.length, questionIndex);
    }

    default:
      return { nextPhase: activePhase, status: 'needs_guidance' };
  }
}

// ─── Advance Phase Helper ─────────────────────────────────

function advancePhase(currentPhase, totalQuestions, currentQuestionIndex) {
  const currentPhaseIndex = PHASE_ORDER.indexOf(currentPhase);
  const nextPhase = PHASE_ORDER[currentPhaseIndex + 1] || null;

  if (!nextPhase) {
    return { nextPhase: null, status: 'session_complete' };
  }

  // guidedQuestions → cognitiveTrigger: pass questionIndex = 0 for the new phase
  // cognitiveTrigger → discovery: pass questionIndex = 0
  const resetQuestionIndex = ['guidedQuestions', 'cognitiveTrigger'].includes(currentPhase) ? 0 : currentQuestionIndex;

  return {
    nextPhase,
    status: 'phase_complete',
    questionIndex: resetQuestionIndex,
    attemptCount: 0
  };
}

// ─── Progress Builder ─────────────────────────────────────

function buildProgress(activePhase, questionIndex, caseStudy) {
  const phaseIndex = PHASE_ORDER.indexOf(activePhase) + 1;
  const totalPhases = PHASE_ORDER.length;

  if (activePhase === 'guidedQuestions') {
    const total = caseStudy.guidedQuestions?.length || 0;
    return `Question ${Math.min((questionIndex || 0) + 1, total)} of ${total}`;
  }

  return `Phase ${phaseIndex} of ${totalPhases}`;
}

// ─── Controller-Level Acceptance Check ─────────────────────
//
// The controller has authoritative keyword matchers for what counts as a
// valid learner response at each phase. This mirrors determineTransition's
// predicate logic but as a boolean check used for the override path:
//
//   When Gemini emits status: 'retry' but the controller's check accepts
//   the input, the engine advances and uses the next-phase prompt as the
//   message — never the Gemini rejection text.
//
// Keep this function in sync with determineTransition's phase cases. If
// you add a new phase there, mirror its acceptance rule here.

function controllerAccepts(activePhase, studentExplanation, caseStudy, questionIndex) {
  const lower = (studentExplanation || '').trim().toLowerCase();
  if (!lower) return false; // empty input never advances

  switch (activePhase) {
    case 'observation': {
      // Read observation keywords from the case study itself - keeping the
      // controller domain-agnostic. Each case study in seedData.js owns
      // the vocabulary that counts as a valid observation for itself.
      const keywords = caseStudy?.observation?.expectedKeywords || [];
      return keywords.some(s => lower.includes(s));
    }

    case 'firstAttempt': {
      return lower.length > 20;
    }

    case 'guidedQuestions': {
      // For guided questions, ANY non-empty answer attempts to engage with
      // the question. The engine will route it to the misconception library;
      // if the answer is good enough, the next question will be emitted;
      // otherwise the engine will ask the same question or move to ifStuck.
      return lower.length > 0;
    }

    case 'cognitiveTrigger': {
      return SCALE_SIGNALS.some(s => lower.includes(s))
        || lower.includes("that's")
        || lower.includes("too ")
        || lower.includes("can't")
        || lower.includes("impossible")
        || lower.includes("don't know");
    }

    case 'discovery': {
      return GROUPING_SIGNALS.some(s => lower.includes(s));
    }

    case 'programmingMapping': {
      return UNDERSTANDING_SIGNALS.some(s => lower.includes(s));
    }

    case 'practice': {
      return lower.length > 10 || lower.includes("skip") || lower.includes("next");
    }

    case 'reflection': {
      return lower.length > 0;
    }

    default:
      return false;
  }
}

// ─── Pick Next Phase Prompt ───────────────────────────────
//
// Given the controller has accepted a response, compute the prompt the
// learner should see next. Reads the prompt from seedData (caseStudy),
// falling back to the engine's transition vocabulary if seedData doesn't
// carry one.
//
// Returns: { prompt: string, nextPhase: string|null, questionIndex?: number }

function pickNextPhase(activePhase, caseStudy, currentQuestionIndex) {
  const phaseIndex = PHASE_ORDER.indexOf(activePhase);
  const nextPhase = PHASE_ORDER[phaseIndex + 1] || null;

  if (!nextPhase) {
    // Last phase complete — close gracefully
    return {
      prompt: 'You have worked through this case study. Great work!',
      nextPhase: null
    };
  }

  // guidedQuestions advances to the *next* question (not next phase)
  if (activePhase === 'guidedQuestions') {
    const guidedQuestions = caseStudy.guidedQuestions || [];
    const nextIndex = (currentQuestionIndex || 0) + 1;
    if (nextIndex < guidedQuestions.length) {
      return {
        prompt: guidedQuestions[nextIndex].question,
        nextPhase: activePhase,
        questionIndex: nextIndex
      };
    }
    // All guidedQuestions done — move to cognitiveTrigger
    return {
      prompt: phaseOpeningPrompt(caseStudy, 'cognitiveTrigger')
        || 'What pattern do you see repeating across these examples?',
      nextPhase: 'cognitiveTrigger',
      questionIndex: 0
    };
  }

  // Other phases: pick the next phase's prompt from seedData. The schema
  // varies per phase (some have .prompt, some .question, some .introduction,
  // practice is an array of tasks, reflection has .questions[]) — this
  // helper knows the quirks.
  //
  // Special case: when nextPhase is 'guidedQuestions', the prompt is the
  // *first* guidedQuestion's text (the opening of that phase), not the
  // generic phase-opening placeholder.
  let prompt;
  if (nextPhase === 'guidedQuestions') {
    prompt = caseStudy.guidedQuestions?.[0]?.question
      || phaseOpeningPrompt(caseStudy, nextPhase);
  } else {
    prompt = phaseOpeningPrompt(caseStudy, nextPhase);
  }

  return {
    prompt: prompt || `Let's move to the next phase.`,
    nextPhase,
    questionIndex: 0
  };
}

// ─── phaseOpeningPrompt ──────────────────────────────────
//
// Reads the "opening prompt" for a phase from seedData. The schema is
// inconsistent across phases — this helper handles the known variations
// and falls back gracefully when a phase has no obvious prompt field.

function phaseOpeningPrompt(caseStudy, phaseName) {
  if (!caseStudy) return null;
  const data = caseStudy[phaseName];

  // v1.0 case studies only carry the description field. When the v1.1
  // phase block is missing, the description is the natural fallback for
  // firstAttempt and observation phases — both are Socratic openers
  // grounded in the case study's story.
  if (!data) {
    if (phaseName === 'firstAttempt' && caseStudy.description) {
      return caseStudy.description;
    }
    return null;
  }

  switch (phaseName) {
    case 'observation':
      return data.prompt || null;

    case 'firstAttempt':
      return data.prompt || caseStudy.description || null;

    case 'guidedQuestions':
      return data?.[0]?.question || null;

    case 'cognitiveTrigger':
      // cognitiveTrigger has .statement (the key fact to pause on)
      // not .question — surface it as a Socratic prompt.
      return data.statement
        ? `Notice this: ${data.statement}`
        : null;

    case 'discovery':
      return data.bridgeQuestion || null;

    case 'programmingMapping':
      return data.introduction || null;

    case 'practice':
      // practice is an array of task objects
      return Array.isArray(data) && data[0]?.task || null;

    case 'reflection':
      // reflection has .questions[] — first question is the opening prompt
      return Array.isArray(data.questions) && data.questions[0] || null;

    default:
      return null;
  }
}