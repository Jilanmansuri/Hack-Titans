const memoryStore = require('../utils/memoryStore')
const { generateRoadmap } = require('../utils/roadmapAlgorithm')
const { connectIfEnabled } = require('../utils/db')
const Analysis = require('../models/Analysis')

async function generateRoadmapController(req, res) {
  try {
    const body = req.body || {}
    const analysisId = body.analysisId

    let analysis = null
    if (analysisId) {
      analysis = memoryStore.getAnalysis(analysisId)
      if (!analysis) {
        const dbStatus = await connectIfEnabled()
        if (dbStatus.enabled) {
          const doc = await Analysis.findOne({ analysisId })
          if (doc?.payload) analysis = doc.payload
        }
      }
    }

    if (!analysis) {
      // Allow direct payload usage (useful for tests).
      if (body.role && body.gaps) {
        analysis = {
          role: body.role,
          gaps: body.gaps,
        }
      }
    }

    if (!analysis || !analysis.role) {
      return res.status(400).json({ error: 'analysisId (or {role, gaps}) is required' })
    }

    const { role } = analysis
    const missingSkills = analysis.gaps?.missingSkills || []
    const weakSkills = analysis.gaps?.weakSkills || []

    const roadmapResult = generateRoadmap({
      role,
      missingSkills,
      weakSkills,
    })

    const payload = {
      analysisId: analysisId || null,
      role,
      roadmap: roadmapResult.steps,
      reasoningTrace: roadmapResult.reasoningTrace,
      generatedAt: new Date().toISOString(),
    }

    if (analysisId) {
      const updated = { ...analysis, roadmap: payload.roadmap, roadmapReasoning: payload.reasoningTrace }
      memoryStore.setAnalysis(analysisId, updated)
    }

    return res.json(payload)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[backend] generateRoadmapController error', err)
    return res.status(500).json({ error: 'Failed to generate roadmap', details: String(err?.message || err) })
  }
}

module.exports = {
  generateRoadmap: generateRoadmapController,
}

