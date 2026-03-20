const { roles, skills } = require('./skillDb')

function computeGaps({ role, extractedSkills, jobDescriptionRequiredSkills }) {
  const roleRequired = roles?.[role]?.required || {}

  // Build required map: role required + optionally JD-only skills (min level 1)
  const required = { ...roleRequired }
  if (jobDescriptionRequiredSkills) {
    for (const [id] of Object.entries(jobDescriptionRequiredSkills)) {
      if (!required[id]) required[id] = 1
    }
  }

  const extractedMap = new Map((extractedSkills || []).map((s) => [s.id, s]))

  const missingSkills = []
  const weakSkills = []

  for (const [skillId, requiredLevel] of Object.entries(required)) {
    const extracted = extractedMap.get(skillId)
    const extractedLevel = extracted?.level ?? 0

    const skillMeta = skills[skillId] || { name: skillId, difficulty: 1, prerequisites: [] }
    const payload = {
      id: skillId,
      name: skillMeta.name,
      requiredLevel,
      extractedLevel,
      evidence: extracted?.evidence || [],
    }

    if (extractedLevel === 0) missingSkills.push(payload)
    else if (extractedLevel < requiredLevel) weakSkills.push(payload)
  }

  // Sort missing by requiredLevel desc then difficulty
  missingSkills.sort((a, b) => b.requiredLevel - a.requiredLevel || (skills[b.id]?.difficulty || 0) - (skills[a.id]?.difficulty || 0))
  weakSkills.sort((a, b) => b.requiredLevel - a.requiredLevel || (skills[b.id]?.difficulty || 0) - (skills[a.id]?.difficulty || 0))

  return { required, missingSkills, weakSkills }
}

module.exports = { computeGaps }

