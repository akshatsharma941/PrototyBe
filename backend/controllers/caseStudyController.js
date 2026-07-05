const mongoose = require('mongoose');
const CaseStudy = require('../models/CaseStudy');

exports.getCaseStudies = async (req, res) => {
  try {
    const caseStudies = await CaseStudy.find({});
    res.json(caseStudies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lookup by either Mongo _id (ObjectId) or the human-readable `id` slug
// (e.g. "cricket-scoreboard"). Frontend routes use the slug, so without
// this fallback a GET /api/case-studies/:slug would always 500.
exports.getCaseStudyById = async (req, res) => {
  try {
    const { id } = req.params;
    let caseStudy = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      caseStudy = await CaseStudy.findById(id);
    }

    if (!caseStudy) {
      caseStudy = await CaseStudy.findOne({ id });
    }

    if (!caseStudy) {
      return res.status(404).json({ message: 'Case study not found' });
    }
    res.json(caseStudy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
