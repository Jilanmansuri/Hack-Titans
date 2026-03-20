const { v4: uuidv4 } = require('uuid')

const { roles } = require('../utils/skillDb')
const { inferExperienceLevel, inferJobRole } = require('../utils/resumeInsights')
const { extractSkillsFromText } = require('../utils/skillExtractor')
const { extractSkillsAndInsights } = require('../utils/aiClient')
const { computeGaps } = require('../utils/skillGap')
const memoryStore = require('../utils/memoryStore')

const { setAnalysis } = memoryStore

const resumes = require('../../dataset/sample_resumes.json')
const jobDescriptions = require('../../dataset/sample_job_descriptions.json')
const { connectIfEnabled } = require('../utils/db')
const Analysis = require('../models/Analysis')

async function resolveTextFromSamples({ resumeSampleId, jobDescriptionSampleId }) {
  const resumeSample = resumes.find((r) => r.id === resumeSampleId)
  const jobSample = jobDescriptions.find((j) => j.id === jobDescriptionSampleId)

  return {
    resumeText: resumeSample?.text || '',
    jobDescriptionText: jobSample?.text || '',
  }
}

function normalizeRole(role) {
  if (!role) return null
  if (roles[role]) return role
  // small normalization: allow case-insensitive match
  const found = Object.keys(roles).find((k) => k.toLowerCase() === String(role).toLowerCase())
  return found || null
}

function numericExperienceFromLevel(level) {
  if (level === 'advanced') return 3
  if (level === 'intermediate') return 2
  return 1
}

async function analyzeResume(req, res) {
  try {
    const body = req.body || {}

    const resolvedFromSamples = await resolveTextFromSamples({
      resumeSampleId: body.resumeSampleId,
      jobDescriptionSampleId: body.jobDescriptionSampleId,
    })

    const resumeText = body.resumeText || resolvedFromSamples.resumeText
    const jobDescriptionText = body.jobDescriptionText || resolvedFromSamples.jobDescriptionText
    const roleFromClient = normalizeRole(body.role) || normalizeRole(body.selectedRole)

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'resumeText is required (or provide resumeSampleId).' })
    }

    const inferred = inferJobRole(resumeText)
    const exp = inferExperienceLevel(resumeText)

    const roleToUse = roleFromClient || inferred.role || 'Full Stack Developer'

    // Heuristic base extraction.
    const extractedSkills = extractSkillsFromText(resumeText, { minLevel: 1 })

    // Optional AI extraction enhancement (safe fallback).
    const ai = await extractSkillsAndInsights({ resumeText })
    if (ai?.mode === 'openai' && Array.isArray(ai.skillLevels)) {
      const aiSkillMap = new Map(ai.skillLevels.map((s) => [s.id, s.level]))
      for (const s of extractedSkills) {
        const maybe = aiSkillMap.get(s.id)
        if (maybe && Number.isFinite(maybe)) {
          s.level = Math.max(s.level, maybe)
        }
      }
      // If AI found additional skills not in heuristic output, add them (no evidence).
      for (const [id, lvl] of aiSkillMap.entries()) {
        if (!extractedSkills.some((s) => s.id === id)) {
          extractedSkills.push({
            id,
            name: id,
            level: Number(lvl),
            evidence: [],
            difficulty: 1,
            prerequisites: [],
          })
        }
      }
    }

    const inferredRoleFinal = roleFromClient ? inferred.role : inferred.role

    const jobDescriptionRequiredSkills = jobDescriptionText
      ? Object.fromEntries(extractSkillsFromText(jobDescriptionText, { minLevel: 1 }).map((s) => [s.id, s.level]))
      : null

    const gaps = computeGaps({
      role: roleToUse,
      extractedSkills,
      jobDescriptionRequiredSkills,
    })

    const missing = gaps.missingSkills
    const weak = gaps.weakSkills

    const reasoningTrace = [
      `Role selected: ${roleToUse}.`,
      `Inferred role from resume: ${inferred.role}.`,
      `Experience estimate: ${exp.level} (${exp.numeric}).`,
    ]

    if (ai?.mode) {
      reasoningTrace.push(
        ai.mode === 'openai'
          ? 'AI-assisted skill extraction enabled.'
          : `AI extraction not available (mode: ${ai.mode}).`
      )
    }

    if (missing.length) {
      reasoningTrace.push(`Detected missing skills: ${missing.slice(0, 6).map((s) => s.name).join(', ')}.`)
    } else {
      reasoningTrace.push('No major missing skills detected for this role.')
    }

    if (weak.length) {
      reasoningTrace.push(`Detected weak skills: ${weak.slice(0, 6).map((s) => s.name).join(', ')}.`)
    }

    const analysisId = uuidv4()

    const payload = {
      analysisId,
      createdAt: new Date().toISOString(),
      role: roleToUse,
      inferredRole: inferredRoleFinal,
      experienceLevel: exp.level,
      experienceNumeric: numericExperienceFromLevel(exp.level),
      extractedSkills,
      requiredSkills: gaps.required,
      gaps: {
        missingSkills: missing,
        weakSkills: weak,
      },
      jobDescriptionUsed: Boolean(jobDescriptionText && jobDescriptionText.trim()),
      reasoningTrace,
    }

    // Keep in-memory for hackathon demo; MongoDB is optional.
    setAnalysis(analysisId, payload)

    // Optional MongoDB persistence.
    const dbStatus = await connectIfEnabled()
    if (dbStatus.enabled) {
      await Analysis.findOneAndUpdate(
        { analysisId },
        { payload },
        { upsert: true, new: true }
      )
    }

    return res.json(payload)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[backend] analyzeResume error', err)
    return res.status(500).json({ error: 'Failed to analyze resume', details: String(err?.message || err) })
  }
}

module.exports = { analyzeResume }

