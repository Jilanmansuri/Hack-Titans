const express = require('express');
const { generateQuestions, evaluateAnswers } = require('../utils/anthropic');

const router = express.Router();

router.post('/generate', async (req, res) => {
  const { role, missingSkills, weakSkills, extractedSkills } = req.body;
  try {
    const questions = await generateQuestions(role, missingSkills || [], weakSkills || [], extractedSkills || []);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

router.post('/evaluate', async (req, res) => {
  const { role, questions, answers } = req.body;
  try {
    const result = await evaluateAnswers(role, questions, answers);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to evaluate answers' });
  }
});

module.exports = router;
