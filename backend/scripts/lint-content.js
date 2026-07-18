#!/usr/bin/env node
//
// backend/scripts/lint-content.js
//
// Static lint for `backend/seedData.js`. Catches content-shape drift before
// it ships. Pure Node, no external dependencies — runs anywhere `node` does.
//
// Usage:
//   node scripts/lint-content.js                  # exit 1 if any violation
//   node scripts/lint-content.js --json           # machine-readable output
//   node scripts/lint-content.js --seed=path.js   # lint a different seed file
//
// Exit codes:
//   0  no violations
//   1  one or more violations found
//
// Rules:
//   1. v1.1 case studies must have observation.prompt, observation.whatToNotice[],
//      observation.notYetReady[], AND observation.expectedKeywords[].
//   2. v1.1 case studies must have ≥1 entry in objectives[] with non-empty label.
//   3. Description must end with `.` or `?` (no dangling fragments).
//   4. Description must not contain em-dash fragments — "X — Y" where Y is a
//      short clause that reads as a sentence fragment rather than a proper
//      parenthetical or list. We catch the most common offender: a space-
//      em-dash-space pattern that splits a sentence.
//   5. guidedQuestions[].ifStuck must be non-empty for every guidedQuestion.
//   6. extension.description (when present) must also end with `.` or `?`.
//
// The lint deliberately errs on the side of *naming a pattern*, not blocking
// content. When a rule fires, the output includes the rule id, the case-study
// identifier, and the offending text — so the editor knows exactly what to
// fix and where.

'use strict';

const fs = require('fs');
const path = require('path');

const ARGS = process.argv.slice(2);
const JSON_OUT = ARGS.includes('--json');
const SEED_ARG = ARGS.find(a => a.startsWith('--seed='));
const SEED_PATH = SEED_ARG
  ? path.resolve(SEED_ARG.slice('--seed='.length))
  : path.join(__dirname, '..', 'seedData.js');

// Cleared `require.cache` so re-running in the same process always reads the
// latest version from disk.
delete require.cache[require.resolve(SEED_PATH)];
const seedData = require(SEED_PATH);

const violations = [];

function push(rule, studyId, message, snippet) {
  violations.push({ rule, studyId, message, snippet: (snippet || '').slice(0, 200) });
}

function isV11(study) {
  // v1.1 schema = has objectives[] and observation object.
  // v1.0 schema = has requiredConcepts[] and no observation.
  return Array.isArray(study.objectives) && study.observation && typeof study.observation === 'object';
}

function endsWithSentence(text) {
  if (typeof text !== 'string' || !text.length) return false;
  const trimmed = text.trim();
  return /[.?]$/.test(trimmed);
}

function hasEmDashFragment(text) {
  if (typeof text !== 'string') return false;
  // Pattern: " — " (space, em-dash, space) splits a sentence. Two consecutive
  // em-dashes ("——") or em-dashes touching words ("word—word") are fine and
  // common in compound adjectives.
  return / \u2014 /.test(text);
}

function lintStudy(study, idx) {
  const studyId = study.id || study.title || `index:${idx}`;

  // Description must end a sentence.
  if (!endsWithSentence(study.description)) {
    push(
      'desc-must-end-sentence',
      studyId,
      'description does not end with "." or "?"',
      study.description
    );
  }

  // Description must not contain em-dash fragments.
  if (hasEmDashFragment(study.description)) {
    push(
      'no-em-dash-fragment',
      studyId,
      'description contains " \u2014 " (space-em-dash-space) which usually signals a sentence fragment',
      study.description
    );
  }

  // extension.description must end a sentence.
  if (study.extension) {
    if (!endsWithSentence(study.extension.description)) {
      push(
        'ext-desc-must-end-sentence',
        studyId,
        'extension.description does not end with "." or "?"',
        study.extension.description
      );
    }
    if (hasEmDashFragment(study.extension.description)) {
      push(
        'ext-no-em-dash-fragment',
        studyId,
        'extension.description contains " \u2014 " which usually signals a sentence fragment',
        study.extension.description
      );
    }
  }

  if (!isV11(study)) return;

  // v1.1: observation.prompt
  if (!study.observation.prompt || !study.observation.prompt.trim()) {
    push(
      'v11-observation-prompt',
      studyId,
      'v1.1 case study is missing observation.prompt',
      ''
    );
  }

  // v1.1: observation.expectedKeywords[] ≥ 1 entry.
  // The controller reads this list to decide whether a learner's observation
  // response is valid. Without it, the observation phase can never advance
  // for this case study — so we treat a missing list as a content bug.
  if (!Array.isArray(study.observation.expectedKeywords) || study.observation.expectedKeywords.length < 1) {
    push(
      'obs-must-have-expected-keywords',
      studyId,
      'observation.expectedKeywords is missing or empty — each case study must declare its own observation vocabulary',
      JSON.stringify(study.observation.expectedKeywords || [])
    );
  }

  // v1.1: observation.whatToNotice[] ≥ 2 entries
  if (!Array.isArray(study.observation.whatToNotice) || study.observation.whatToNotice.length < 2) {
    push(
      'v11-what-to-notice',
      studyId,
      'v1.1 case study should list ≥ 2 things the learner might notice',
      JSON.stringify(study.observation.whatToNotice || [])
    );
  }

  // v1.1: observation.notYetReady[] ≥ 1 entry
  if (!Array.isArray(study.observation.notYetReady) || study.observation.notYetReady.length < 1) {
    push(
      'v11-not-yet-ready',
      studyId,
      'v1.1 case study should list ≥ 1 "not yet ready" signal',
      JSON.stringify(study.observation.notYetReady || [])
    );
  }

  // v1.1: ≥ 1 objective with non-empty label
  if (!Array.isArray(study.objectives) || study.objectives.length === 0) {
    push(
      'v11-objectives',
      studyId,
      'v1.1 case study is missing objectives[]',
      ''
    );
  } else {
    const emptyLabels = study.objectives.filter(o => !o.label || !o.label.trim());
    if (emptyLabels.length) {
      push(
        'v11-objective-label',
        studyId,
        `v1.1 case study has ${emptyLabels.length} objective(s) with empty label`,
        JSON.stringify(emptyLabels)
      );
    }
  }

  // v1.1: every guidedQuestion has non-empty ifStuck
  if (!Array.isArray(study.guidedQuestions)) return;
  study.guidedQuestions.forEach((q, i) => {
    if (!q.ifStuck || !q.ifStuck.trim()) {
      push(
        'v11-if-stuck',
        studyId,
        `guidedQuestions[${i}] has empty ifStuck — tutor needs a fallback prompt`,
        q.question || ''
      );
    }
  });
}

seedData.forEach(lintStudy);

// ─── Output ───────────────────────────────────────────────────────────────

if (JSON_OUT) {
  process.stdout.write(JSON.stringify({ violations }, null, 2) + '\n');
} else {
  if (violations.length === 0) {
    console.log(`✓ lint-content: 0 violations across ${seedData.length} case studies (${SEED_PATH})`);
    process.exit(0);
  }

  console.error(`✗ lint-content: ${violations.length} violation(s) across ${seedData.length} case studies\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.studyId}`);
    console.error(`      ${v.message}`);
    if (v.snippet) console.error(`      → ${v.snippet}`);
    console.error('');
  }
}

process.exit(violations.length === 0 ? 0 : 1);