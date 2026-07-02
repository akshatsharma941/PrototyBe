const CaseStudy = require('../models/CaseStudy');

const mapErrorToConceptAndHint = (stderr, requiredConcepts) => {
  if (stderr.includes('SyntaxError')) return { concept: 'syntax error', hint: 'Check your spelling, colons, and punctuation.' };
  if (stderr.includes('IndentationError')) return { concept: 'indentation', hint: 'Python relies on spaces. Make sure your lines align perfectly.' };
  if (stderr.includes('NameError')) return { concept: 'variable misuse', hint: 'You might be using a variable that has not been defined or is spelled incorrectly.' };
  if (stderr.includes('IndexError')) return { concept: 'list indexing', hint: 'You are trying to access a position in the list that does not exist.' };
  if (stderr.includes('TypeError')) return { concept: 'type error', hint: 'You are mixing different data types (like adding a string and a number without converting).' };
  
  // Logic errors (no stderr, but wrong output)
  if (requiredConcepts.some(c => c.toLowerCase().includes('conditional') || c.toLowerCase().includes('operator'))) {
     return { concept: 'condition logic', hint: 'Your logic isn\'t producing the expected result. Check your if/else conditions.' };
  }
  if (requiredConcepts.some(c => c.toLowerCase().includes('loop') || c.toLowerCase().includes('list'))) {
     return { concept: 'loop logic', hint: 'Your loop might not be running the correct number of times or processing the right items.' };
  }
  return { concept: 'general logic', hint: 'Your output does not match what was expected. Review your logic.' };
};

exports.evaluateCode = async (req, res) => {
  try {
    const { caseStudyId, code } = req.body;
    const caseStudy = await CaseStudy.findById(caseStudyId);
    
    if (!caseStudy) {
      return res.status(404).json({ error: 'Case study not found' });
    }

    let passed = 0;
    let failed = 0;
    const failedTests = [];
    const hints = [];

    // Evaluate each test case
    for (let i = 0; i < caseStudy.testCases.length; i++) {
       const tc = caseStudy.testCases[i];
       
       let codeToRun = code;
       
       // Quick prototype replacement to test hidden conditions for beginners who don't know functions
       if (caseStudy.title === "Age Verification System" && tc.input) {
           codeToRun = code.replace(/age\s*=\s*\d+/, `age = ${tc.input}`);
       }

       const { executePython } = require('../services/pythonExecutionService');
       const data = executePython(codeToRun, tc.input || "");

       if (!data.run || data.run.code !== 0 && data.run.stderr.includes('Error')) {
          // If code execution completely fails due to an error, we can still parse stderr,
          // but if it's purely a runtime error that prevents output and it has stderr, we proceed below
          if (!data.run) {
             failed++;
             failedTests.push(`Test Case ${i+1}`);
             if (!hints.find(h => h.concept === 'execution error')) {
               hints.push({ concept: 'execution error', hint: 'Could not execute your code.' });
             }
             continue;
          }
       }

       const output = data.run.output.trim();
       const stderr = data.run.stderr.trim();

       if (stderr) {
          failed++;
          failedTests.push(`Test Case ${i+1}`);
          const errHint = mapErrorToConceptAndHint(stderr, caseStudy.requiredConcepts);
          if (!hints.find(h => h.concept === errHint.concept)) hints.push(errHint);
       } else if (output === tc.expectedOutput.trim()) {
          passed++;
       } else {
          failed++;
          failedTests.push(`Test Case ${i+1}`);
          const logicHint = mapErrorToConceptAndHint("", caseStudy.requiredConcepts);
          if (!hints.find(h => h.concept === logicHint.concept)) hints.push(logicHint);
       }
    }

    res.json({
       passed,
       failed,
       failedTests,
       hints
    });

  } catch (err) {
    console.error('Eval Error:', err);
    res.status(500).json({ error: 'Evaluation failed', details: err.message });
  }
};
