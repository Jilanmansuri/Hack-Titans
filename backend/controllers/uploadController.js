const { extractTextFromBuffer } = require('../utils/parseResume')
const { inferExperienceLevel, inferJobRole } = require('../utils/resumeInsights')
const { extractSkillsFromText } = require('../utils/skillExtractor')

async function uploadResume(req, res) {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'file is required (PDF or DOCX)' })

    const resumeText = await extractTextFromBuffer({
      buffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
    })

    if (!resumeText || !resumeText.trim()) {
      return res.status(422).json({
        error:
          'No extractable text found in this PDF. If it is a scanned/image PDF, try DOCX or paste the resume text instead.',
      })
    }

    const inferred = inferJobRole(resumeText)
    const exp = inferExperienceLevel(resumeText)
    const extractedSkills = extractSkillsFromText(resumeText, { minLevel: 1 }).slice(0, 15)

    return res.json({
      filename: file.originalname,
      resumeText,
      extractedPreview: extractedSkills,
      experienceLevel: exp.level,
      inferredRole: inferred.role,
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[backend] uploadResume error', err)
    return res.status(500).json({ error: 'Failed to parse uploaded resume', details: String(err?.message || err) })
  }
}

module.exports = { uploadResume }

