const mongoose = require('mongoose');

// CaseStudy Schema — supports both v1.0 and v1.1+ case study formats.
// v1.1 adds: story, objectives, prerequisites, observation, firstAttempt,
// guidedQuestions, cognitiveTrigger, discovery, programmingMapping,
// practice, reflection, extension, and more.
// All new fields are stored; the model does not validate them.

const caseStudySchema = new mongoose.Schema({
  // ─── v1.0 fields (still used) ──────────────────────────
  title:           { type: String, required: true },
  description:     { type: String, required: true },
  requiredConcepts:{ type: [String], default: [] },
  targetInsight:   { type: String, default: '' },
  followUpQuestions:{ type: [String], default: [] },
  pythonTopics:    { type: [String], default: [] },
  starterCode:     { type: String, default: '' },
  testCases:       { type: [Object], default: [] },

  // ─── v1.1 identity fields ──────────────────────────────
  id:              { type: String },   // stable slug, e.g. "cricket-scoreboard"
  subtitle:        { type: String },   // short hook
  author:          { type: String },   // e.g. "PyBe Content Team"
  difficulty:      { type: String },   // "beginner" | "intermediate" | "advanced"
  estimatedMin:    { type: Number },   // approximate session length
  tags:            { type: [String] }, // filtering and recommendation

  // ─── v1.1 learning structure ───────────────────────────
  objectives:      { type: Array, default: [] },   // [{ id, label }]
  prerequisites:   { type: Array, default: [] },   // [{ caseStudyId, reason }]

  // ─── v1.1 phases (flexible — not all case studies use all phases) ──
  story:           { type: mongoose.Schema.Types.Mixed }, // { setting, protagonist, situation, tension, emotion }
  observation:     { type: mongoose.Schema.Types.Mixed },
  firstAttempt:    { type: mongoose.Schema.Types.Mixed },
  guidedQuestions: { type: Array, default: [] },   // [{ question, targetsMisconception, topic, order, ifStuck }]
  cognitiveTrigger:{ type: mongoose.Schema.Types.Mixed },
  discovery:       { type: mongoose.Schema.Types.Mixed },
  programmingMapping:{ type: mongoose.Schema.Types.Mixed },
  practice:        { type: Array, default: [] },
  reflection:      { type: mongoose.Schema.Types.Mixed },
  extension:       { type: mongoose.Schema.Types.Mixed }

}, { timestamps: true });

module.exports = mongoose.model('CaseStudy', caseStudySchema);