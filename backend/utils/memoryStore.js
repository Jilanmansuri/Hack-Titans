const analyses = new Map()

function setAnalysis(analysisId, data) {
  analyses.set(analysisId, data)
}

function getAnalysis(analysisId) {
  return analyses.get(analysisId)
}

module.exports = { setAnalysis, getAnalysis }

