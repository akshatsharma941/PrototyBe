const express = require('express');
const router = express.Router();
const { executePython } = require('../services/pythonExecutionService');

router.post('/', (req, res) => {
  try {
    const { language, version, files, stdin } = req.body;
    
    // We only support python in this local proxy
    if (language !== 'python') {
      return res.status(400).json({ error: 'Only python is supported' });
    }
    
    const code = files[0].content;
    const result = executePython(code, stdin || "");
    
    res.json(result);
  } catch (err) {
    console.error('Execution Error:', err);
    res.status(500).json({ error: 'Execution failed', details: err.message });
  }
});

module.exports = router;
