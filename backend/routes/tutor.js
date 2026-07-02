const express = require('express');
const router = express.Router();
const { submitExplanation } = require('../controllers/tutorController');

router.post('/explanation', submitExplanation);

module.exports = router;
