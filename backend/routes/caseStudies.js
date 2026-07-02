const express = require('express');
const router = express.Router();
const { getCaseStudies, getCaseStudyById } = require('../controllers/caseStudyController');

router.get('/', getCaseStudies);
router.get('/:id', getCaseStudyById);

module.exports = router;
