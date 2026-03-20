const { roles, skills } = require('./skillDb')

function normalizeText(s) {
  return (s || '').toLowerCase()
}

function inferExperienceLevel(text) {
  const t = normalizeText(text)

  const yearMatches = [...t.matchAll(/(\d+(?:\.\d+)?)\s*(years|yrs|year)\b/gim)]
  const years = yearMatches
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n))
  const maxYears = years.length ? Math.max(...years) : 0

  if (/(intern|entry\s*level|graduate|0\s*years|less than 1 year)/i.test(text)) {
    return { level: 'beginner', numeric: 1, evidence: ['Detected entry-level language'] }
  }

  if (maxYears >= 5) {
    return { level: 'advanced', numeric: 3, evidence: [`Detected ~${maxYears}+ years of experience`] }
  }
  if (maxYears >= 2) {
    return { level: 'intermediate', numeric: 2, evidence: [`Detected ~${maxYears}+ years of experience`] }
  }

  // Fallback based on seniority keywords.
  if (/(senior|lead|staff|principal)/i.test(text)) {
    return { level: 'advanced', numeric: 3, evidence: ['Detected seniority keywords'] }
  }
  if (/(junior|mid|experienced)/i.test(text)) {
    return { level: 'intermediate', numeric: 2, evidence: ['Detected mid-level keywords'] }
  }

  return { level: 'beginner', numeric: 1, evidence: ['Defaulted to beginner'] }
}

function inferJobRole(text) {
  const t = normalizeText(text)

  const roleScores = Object.entries(roles).map(([roleName, role]) => {
    // Score by how many required skills show up in the resume text.
    const required = Object.keys(role.required || {})
    let score = 0

    for (const skillId of required) {
      const skill = skills[skillId]
      if (!skill) continue
      const hit = (skill.synonyms || []).some((syn) => {
        const s = syn.toLowerCase()
        return s && new RegExp(`\\b${escapeRegex(s)}\\b`, 'i').test(t)
      })
      if (hit) score += 1
    }

    return { roleName, score }
  })

  roleScores.sort((a, b) => b.score - a.score)
  const best = roleScores[0]
  if (!best || best.score === 0) return { role: 'Full Stack Developer', evidence: ['No strong role signals found'] }

  return {
    role: best.roleName,
    evidence: [`Matched ${best.score} role-relevant skills from resume text`],
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = {
  inferExperienceLevel,
  inferJobRole,
}

