const CaseStudy = require('../models/CaseStudy');

exports.getCaseStudies = async (req, res) => {
  try {
    const caseStudies = await CaseStudy.find({});
    res.json(caseStudies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCaseStudyById = async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findById(req.params.id);
    if (!caseStudy) {
      return res.status(404).json({ message: 'Case study not found' });
    }
    res.json(caseStudy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
