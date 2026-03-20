const { OpenAI } = require('openai')
const { skills } = require('./skillDb')

function isAIEnabled() {
  const provider = (process.env.AI_PROVIDER || 'mock').toLowerCase()
  return provider !== 'mock' && Boolean(process.env.OPENAI_API_KEY)
}

function buildSkillListForPrompt() {
  // Keep prompt short-ish: id + name + difficulty.
  return Object.entries(skills).map(([id, s]) => `${id}: ${s.name} (difficulty ${s.difficulty})`)
}

async function extractSkillsAndInsightsWithOpenAI({ resumeText }) {
  const aiProvider = (process.env.AI_PROVIDER || '').toLowerCase()
  if (aiProvider !== 'openai') throw new Error('OpenAI provider not configured')

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'

  const skillList = buildSkillListForPrompt()

  const prompt = `
You are helping with a hackathon. Parse the resume text and return JSON only.

Tasks:
1) Choose the best job role label from: ["Frontend Developer","Backend Developer","Data Analyst","Full Stack Developer"].
2) Infer experience level: "beginner" | "intermediate" | "advanced".
3) From the resume, estimate which of the following skills are present.
Return skillLevels as an array of objects: { "id": <skillId>, "level": 1|2|3 }.
Only include skills you are confident are present.

Skill list:
${skillList.join('\n')}

Resume:
${resumeText}
  `.trim()

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Return strictly valid JSON. No markdown.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  })

  const content = completion.choices?.[0]?.message?.content || ''
  const jsonStart = content.indexOf('{')
  const jsonEnd = content.lastIndexOf('}')
  if (jsonStart < 0 || jsonEnd < 0) throw new Error('AI response missing JSON object')

  const parsed = JSON.parse(content.slice(jsonStart, jsonEnd + 1))
  return parsed
}

async function extractSkillsAndInsights({ resumeText }) {
  if (!isAIEnabled()) {
    return { mode: 'mock' }
  }

  try {
    const mode = 'openai'
    const data = await extractSkillsAndInsightsWithOpenAI({ resumeText })
    return { mode, ...data }
  } catch (err) {
    return { mode: 'fallbackHeuristics', error: String(err?.message || err) }
  }
}

module.exports = {
  extractSkillsAndInsights,
}

