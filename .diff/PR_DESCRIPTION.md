# PyBe tutoring platform — content, schema, SDK migration, and verifiers

> Single PR containing four logical sections that evolved together on the `kajal` feature branch. The commits are kept atomic where they always were atomic (case-study content commits), and grouped by section where they are intertwined (tutor-engine + controller logic that supports multiple sections at once).

---

## Section 1 — Tutoring improvements (Socratic engine hardening)

This is the heart of the PR: making the AI tutor actually useful in playtesting.

### A6.6 — "every response must end with a question" guardrail

Playtesting surfaced a recurring failure: when Gemini responded to a confused learner with a pure acknowledgment (`"That's a very keen observation."`), the learner didn't know what to do next. The fix is a controller-level guardrail that:

- **Re-implements the prompt rule in code**: any `needs_guidance` response that lacks a `?` gets a follow-up question appended from the case-study's own seed data.
- **Recognises imperative-task endings**: a response like *"Store the prices of five fruits in fruit_prices. Example: apple = 30"* is genuinely actionable — the learner knows what to type next — so the guardrail does **not** double-append a question on top of it. The recogniser uses a curated list of ~60 imperative verbs at the start of the last sentence.
- **Preserves Gemini's original acknowledgment**: *"That's a very keen observation."* stays at the start; we append, we don't replace.
- **Excludes `cognitiveTrigger`**: that phase is designed to pause silently after the trigger statement.
- **Pulls the follow-up from the case study's own `firstAttempt.prompt`** rather than a generic question, so the learner sees the question the author actually intended.

### A6.7 — case-study-level misconception routing

Case-study authors can now attach a `misconceptions[]` array to a specific guided question:

```js
{
  name: "team_vs_league",
  description: "The learner is reasoning from a real cricket team (11 players) rather than the fictional 80-player league in the story.",
  diagnosis: "It sounds like you're thinking of a real cricket match team, not this story's league.",
  reframe: "This is a club league, not a single match team. The story says there are 80 players in total. Now, how many score entries is 80 players × 10 matches each?",
  expectedShift: "The learner shifts from counting a single 11-player team to multiplying 80 players by 10 matches."
}
```

When the active guided question carries `misconceptions[]`, the system prompt renders a **`KNOWN MISCONCEPTIONS FOR THIS QUESTION`** block instructing Gemini:

- to compare the learner's full response (not just keywords) against each description;
- to emit `status: "misconception_handled"` with the matching `diagnosis` + `reframe` if detected;
- to avoid repeating the same diagnosis verbatim across multiple occurrences.

`determineTransition` routes `misconception_handled` correctly: stays on the same phase, same `questionIndex`, attempts the reframe rather than advancing. A6.5 (controller-override) and A6.6 (question-required) both **deliberately do not** override or augment it.

### A6.8 — per-question learning objective

Case-study authors can attach an `objective` string to a specific guided question:

```js
objective: "The learner recognizes that inserting a player into a numbered list forces every subsequent label to shift."
```

This addresses the playtesting failure mode where the learner had reached the insight (in their own words, with examples, via the natural answer) but the tutor kept re-asking the same question digging for "the right wording". When the active question carries `objective`, the system prompt renders a **`LEARNING OBJECTIVE FOR THIS QUESTION`** block instructing Gemini to emit `status="phase_complete"` once the learner has demonstrated the concept — in any form.

Architecturally isolated: blocks render conditionally on the active question having the field, so an unmodified question sees no extra prompt text.

### Misc tutoring niceties

- **Imperative-task recogniser** (`IMPERATIVE_TASK_REGEX`) used by A6.6 — see above.
- **Prompt-shape updates** for the new concept-completion criterion + misconception block in `buildSystemPrompt`.
- **`phaseOpeningPrompt(caseStudy, phaseName)` extension** — handles the new schema fields when rendering phase openings.
- **Persona/style additions** in the system prompt for richer tutor voice.

---

## Section 2 — Case studies

Three new case studies, plus a major rewrite of one existing one.

| ID | Concept | Notes |
|---|---|---|
| `cricket-scoreboard` | Lists (indexing, mutability, insertion) | Includes the `team_vs_league` misconception on Q3 and the `shift-label` objective on Q4 |
| `tiffin-service-orders` | Dictionaries (lookup, counts, missing-key handling) | Replaced the older "Student Report Card" draft; now uses real-life order-lookup scenarios |
| `attendance-register` | Lists (insertion semantics, sorted insertion) | Newest case study; covers the labeled-insertion insight |

Plus case studies that pre-existed but were refined during this work:

- `bakery-checkout`, `age-verification-system`, `inventory-stock-checker` — content tightened to match the new schema and the hardened tutor prompt.

The schema itself (`backend/models/CaseStudy.js`) was extended with **Schema v1.1**:

```js
{
  id: 'cricket-scoreboard',           // v1.0 didn't have id; v1.1 adds it
  title: 'The Cricket Scoreboard',
  subtitle: '...',
  description: '...',
  phases: { ... },                     // phase configuration
  guidedQuestions: [                   // per-question misconceptions[] + objective
    {
      question: '...',
      ifStuck: '...',
      misconceptions: [ { name, description, diagnosis, reframe, expectedShift } ],
      objective: '...',
    },
    ...
  ],
  // ... v1.0 fields still supported (firstAttempt, misconceptionLibrary refs, etc.)
}
```

---

## Section 3 — Gemini SDK migration

The previous code used the **deprecated `@google/generative-ai` SDK**, which reached end-of-life on **2025-11-30**. Migrated to the official unified client: **`@google/genai` v2.10.0**.

### What changed

| Aspect | Old `@google/generative-ai` | New `@google/genai` |
|---|---|---|
| Client | `new GoogleGenerativeAI(apiKey)` | `new GoogleGenAI({ apiKey })` |
| Model call | `genAI.getGenerativeModel({...}).generateContent(parts)` | `genAI.models.generateContent({ model, contents, config })` |
| Config key | `generationConfig: {...}` | `config: {...}` |
| Response text | `result.response.text()` (method) | `result.text` (property) |
| Error class | `GoogleGenerativeAIFetchError` | `ApiError` (retry info packed into `err.message` JSON) |

### Bonus: fail-fast startup validation

Added a regex check on `GEMINI_API_KEY` at backend boot. If the key is missing or doesn't look like a real Gemini API key (`AIza` + 30-40 alphanumeric chars), the backend prints an actionable warning pointing at https://aistudio.google.com/apikey and explaining the `401 ACCESS_TOKEN_TYPE_UNSUPPORTED` error class that Google returns when an OAuth token is misrouted. No more silent `401` from the API server — the developer finds out at boot.

### Bonus: `.env.example`

The project had none. This PR adds one that documents:

- `GEMINI_API_KEY` — required, `AIza…` format
- `MONGO_URI` — optional (omit for `mongodb-memory-server`)
- `PORT` — optional (default 5000)

`.env` is in `.gitignore`; `.env.example` is the tracked contract.

---

## Section 4 — Verifiers

Six automated checks live in `backend/scripts/` and run via `npm run pretest`:

| Suite | What it verifies | Pass / Total |
|---|---|---|
| `lint:content` | Each case study has required phases, no dangling refs, schema valid | 0 violations / 6 case studies |
| `verify:controller-acceptance` | Controller's keyword matchers accept learner responses that should be accepted | 46 / 46 |
| `verify:pick-next-phase` | `pickNextPhase` advances correctly across all phase transitions in all case studies | 9 / 9 |
| `verify:controller-override` | Controller-level acceptance override fires correctly (rejects "rejection" status when local matcher accepted) | 26 / 26 |
| **`verify:question-required`** ★ | **A6.6 guardrail: every needs_guidance response has a `?`; cognitiveTrigger excluded; imperative endings recognised; acknowledgment preserved; follow-up sourced from case study** | **1168 / 1168** |
| **`verify:misconception-handler`** ★ | **A6.7 routing: KNOWN MISCONCEPTIONS block renders conditionally; status `misconception_handled` is valid and routed correctly; architectural isolation across case studies** | **39 / 39** |
| **`verify:objective-detection`** ★ | **A6.8 routing: LEARNING OBJECTIVE block renders conditionally; blocks are independent; architectural isolation across case studies** | **14 / 14** |

★ = new in this PR

**Total: 1302 pass, 0 fail.**

---

## Files

- **Backend logic**: `controllers/tutorController.js` (~1000 lines added), `tutorEngine.js` (new module), `models/CaseStudy.js` (schema v1.1), `controllers/caseStudyController.js`
- **Misconception library**: 5 new files in `backend/misconceptions/` (one per misconception category)
- **Content**: `backend/seedData.js` (3 new case studies + 3 refined)
- **Verifiers**: 6 scripts in `backend/scripts/` (3 new in this PR)
- **Frontend**: `LevelSelection.jsx` (header + backend-driven loading), `CaseStudy.jsx`, `Tutor.jsx` (mostly v1.1 schema-driven)
- **Config**: `backend/package.json`, `backend/.env.example`, root `.gitignore` (already had `.env` entries)

---

## Test plan

```bash
cd backend
npm install
npm run pretest    # runs all 6 verifiers + lint; expect 1302/0
npm run dev        # boots on PORT (default 5000); reads GEMINI_API_KEY from .env
```

Frontend:

```bash
cd frontend
npm install
npm run dev        # vite dev server (default 5173)
```

Open `http://localhost:5173`, navigate to `/`, then into a case study (e.g. cricket-scoreboard), walk through the phases. Confirm:

- [ ] case studies load on `/` and `/levels`
- [ ] level list shows the new `Logo` + `ArrowLeft` header
- [ ] cricket-scoreboard Q3 routes the `team_vs_league` misconception correctly when triggered
- [ ] cricket-scoreboard Q4 emits `status: "phase_complete"` after the learner demonstrates the shift-label insight
- [ ] no `[debug]` or `console.log` lines appear in backend stdout during normal operation
- [ ] `console.warn` lines appear only on real 429 retries from Gemini

---

## Out of scope (intentionally not included)

- The deprecated SDK is fully removed; no fallback path remains.
- No changes to the MongoDB seed script execution path (still wipes + re-inserts on boot).
- No changes to the frontend deployment config (`vite.config.js` untouched).

---

## Breaking changes

**None for end users.** Frontend-observable response shape unchanged. The only externally-visible behaviour change is that an invalid `GEMINI_API_KEY` now produces an actionable boot-time warning instead of a `401 ACCESS_TOKEN_TYPE_UNSUPPORTED` after first request.

## Migration notes for downstream forks

If you maintain a fork that pins `@google/generative-ai`:

```bash
npm uninstall @google/generative-ai
npm install @google/genai
```

Then mirror the API-shape changes from `controllers/tutorController.js` (client init, `models.generateContent`, `result.text`, error handling).

## Pre-merge housekeeping done

- ✅ All temporary debug logging removed (`tutorEngine.debug.logMisconceptionRouting` block deleted; matched logging in `tutorController.js` deleted)
- ✅ No `TODO` / `FIXME` / `WIP` markers anywhere in dirty files
- ✅ All 6 verifier suites pass after cleanup
- ✅ Stale `§6.7 debug` comment in `verify-objective-detection.js` reworded to current state
- ✅ E2E verified through the new SDK with the current `.env` value
- ✅ `.env.example` complete and committed; `.env` gitignored; no `AIza…` keys in git history