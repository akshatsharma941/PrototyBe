const { GoogleGenerativeAI } = require('@google/generative-ai');
const CaseStudy = require('../models/CaseStudy');
const { tutorSystemPrompt } = require('../prompts/tutorPrompt');

let genAI = null;
const getClient = () => {
  if (genAI) return genAI;
  if (!process.env.GEMINI_API_KEY) return null;
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

exports.submitExplanation = async (req, res) => {
  try {
    const { caseStudyId, studentExplanation } = req.body;

    if (!caseStudyId || !studentExplanation) {
      return res.status(400).json({ error: 'caseStudyId and studentExplanation are required' });
    }

    const caseStudy = await CaseStudy.findById(caseStudyId);
    if (!caseStudy) {
      return res.status(404).json({ error: 'Case study not found' });
    }

    const client = getClient();
    if (!client) {
      return res.status(503).json({ error: 'AI Tutor is not configured. Missing GEMINI_API_KEY.' });
    }

    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const prompt = tutorSystemPrompt(caseStudy);
    
    const result = await model.generateContent([
      { text: prompt },
      { text: `Student Explanation: ${studentExplanation}` }
    ]);

    const responseText = result.response.text();
    const jsonResponse = JSON.parse(responseText);

    res.json(jsonResponse);
  } catch (err) {
    console.error('Gemini Error:', err);
    res.status(500).json({ error: 'Failed to process with AI Tutor', details: err.message });
  }
};
