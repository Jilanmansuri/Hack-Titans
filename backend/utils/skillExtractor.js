const { skills } = require('./skillDb')

function normalizeText(s) {
  return (s || '').toLowerCase()
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findOccurrences(haystack, needleRegex) {
  const matches = []
  const re = new RegExp(needleRegex.source, needleRegex.flags.includes('g') ? needleRegex.flags : `${needleRegex.flags}g`)
  let m
  while ((m = re.exec(haystack)) !== null) {
    matches.push({ index: m.index, match: m[0] })
    if (m.index === re.lastIndex) re.lastIndex++ // avoid infinite loops
  }
  return matches
}

function scoreLevelFromContext(snippet) {
  const s = snippet.toLowerCase()
  const years = [...s.matchAll(/(\d+(?:\.\d+)?)\s*(years|yrs|year)\b/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n))

  const hasExpert = /(expert|master|advanced|deep dive|extensive)/i.test(snippet)
  const hasProficient = /(proficient|strong|worked on|developed|built|led|production|in production)/i.test(snippet)
  const hasWeak = /(familiar|basic|beginner|intro|exposure|understanding|learning|some experience)/i.test(snippet)

  if (years.length) {
    const maxYears = Math.max(...years)
    if (maxYears >= 5) return 3
    if (maxYears >= 2) return 2
  }

  if (hasExpert) return 3
  if (hasProficient) return 2
  if (hasWeak) return 1
  return 1
}

function extractSkillsFromText(text, { minLevel = 1 } = {}) {
  const t = normalizeText(text)
  const results = []

  for (const [skillId, skill] of Object.entries(skills)) {
    let bestLevel = 0
    const evidence = []

    const synonyms = Array.isArray(skill.synonyms) ? skill.synonyms : []
    for (const syn of synonyms) {
      if (!syn) continue
      const synTrim = syn.trim()
      if (!synTrim) continue

      // Use word boundaries when the phrase is "word-like".
      // For tokens like `node.js` the `.` breaks word boundaries, so we fall back to substring matching.
      const isWordLike = /^[a-z0-9_\s]+$/i.test(synTrim)
      const base = escapeRegex(synTrim)
      const pattern = isWordLike ? `\\b${base}\\b` : base
      const synRegex = new RegExp(pattern, 'i')
      const occ = findOccurrences(t, synRegex)
      if (!occ.length) continue

      for (const o of occ.slice(0, 2)) {
        const start = Math.max(0, o.index - 80)
        const end = Math.min(t.length, o.index + o.match.length + 80)
        const snippet = text.slice(start, end)
        const lvl = scoreLevelFromContext(snippet)
        bestLevel = Math.max(bestLevel, lvl)
        evidence.push(`Found "${o.match}"`)
        if (evidence.length >= 3) break
      }
    }

    if (bestLevel >= minLevel) {
      results.push({
        id: skillId,
        name: skill.name,
        level: bestLevel,
        evidence,
        difficulty: skill.difficulty,
        prerequisites: skill.prerequisites || [],
      })
    }
  }

  // Sort highest confidence first for nicer UI.
  results.sort((a, b) => b.level - a.level || a.name.localeCompare(b.name))
  return results
}

module.exports = {
  extractSkillsFromText,
}

