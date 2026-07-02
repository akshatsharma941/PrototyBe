const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredConcepts: { type: [String], default: [] },
  targetInsight: { type: String, required: true },
  followUpQuestions: { type: [String], default: [] },
  pythonTopics: { type: [String], default: [] },
  starterCode: { type: String, default: '' },
  testCases: { type: [Object], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('CaseStudy', caseStudySchema);
