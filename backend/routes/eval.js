const express = require('express');
const router = express.Router();
const { evaluateCode } = require('../controllers/evalController');

router.post('/', evaluateCode);

module.exports = router;
