const { skills } = require('./skillDb')

function unique(arr) {
  return [...new Set(arr)]
}

function getDifficultyStage(difficulty) {
  if (difficulty <= 1) return 'Basics'
  if (difficulty === 2) return 'Intermediate'
  return 'Advanced'
}

function collectPrerequisites(skillIds) {
  const out = new Set()
  const visit = (id) => {
    if (!skills[id]) return
    if (out.has(id)) return
    out.add(id)
    for (const pre of skills[id].prerequisites || []) visit(pre)
  }
  for (const id of skillIds) visit(id)
  return [...out]
}

function topoSortSelected(selectedSkillIds) {
  const selected = new Set(selectedSkillIds)
  const inDegree = new Map()
  const adj = new Map()

  for (const id of selectedSkillIds) {
    inDegree.set(id, 0)
    adj.set(id, [])
  }

  for (const id of selectedSkillIds) {
    const prereqs = skills[id]?.prerequisites || []
    for (const pre of prereqs) {
      if (!selected.has(pre)) continue
      // Edge pre -> id
      adj.get(pre).push(id)
      inDegree.set(id, (inDegree.get(id) || 0) + 1)
    }
  }

  const q = []
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) q.push(id)
  }

  const ordered = []
  while (q.length) {
    q.sort((a, b) => (skills[a]?.difficulty || 0) - (skills[b]?.difficulty || 0))
    const cur = q.shift()
    ordered.push(cur)
    for (const nxt of adj.get(cur)) {
      inDegree.set(nxt, inDegree.get(nxt) - 1)
      if (inDegree.get(nxt) === 0) q.push(nxt)
    }
  }

  // If there is a cycle (unlikely with curated data), fall back to deterministic order.
  if (ordered.length !== selectedSkillIds.length) {
    return [...selectedSkillIds].sort((a, b) => (skills[a]?.difficulty || 0) - (skills[b]?.difficulty || 0))
  }

  return ordered
}

function generateRoadmap({ role, missingSkills, weakSkills }) {
  const needed = unique([
    ...missingSkills.map((s) => s.id),
    ...weakSkills.map((s) => s.id),
  ])

  const expanded = collectPrerequisites(needed)
  const sorted = topoSortSelected(expanded)

  const byDifficulty = new Map()
  for (const id of sorted) {
    const d = skills[id]?.difficulty ?? 1
    if (!byDifficulty.has(d)) byDifficulty.set(d, [])
    byDifficulty.get(d).push(id)
  }

  const steps = []
  let stepIndex = 1
  const difficulties = [1, 2, 3]

  for (const diff of difficulties) {
    const topicIds = byDifficulty.get(diff) || []
    if (!topicIds.length) continue

    const stage = getDifficultyStage(diff)
    const durationWeeks = diff === 1 ? 1 : diff === 2 ? 2 : 3

    steps.push({
      step: stepIndex++,
      stage,
      recommendedDurationWeeks: durationWeeks,
      topics: topicIds.map((id) => skills[id]?.name || id),
      topicIds,
    })
  }

  if (!steps.length) {
    steps.push({
      step: 1,
      stage: 'On Track',
      recommendedDurationWeeks: 0,
      topics: ['No major gaps detected for this role.'],
      topicIds: [],
    })
  }

  const missingNames = missingSkills.map((s) => s.name)
  const weakNames = weakSkills.map((s) => s.name)

  const reasoningTrace = []
  if (missingNames.length) {
    reasoningTrace.push(
      `You are missing ${missingNames.join(', ')} for the ${role} roadmap.`
    )
  }
  if (weakNames.length) {
    reasoningTrace.push(
      `You also have weaker coverage in ${weakNames.join(', ')}; the roadmap reinforces these topics.`
    )
  }
  if (needed.length) {
    const prereqAdded = expanded.filter((id) => !needed.includes(id))
    if (prereqAdded.length) {
      reasoningTrace.push(`Prerequisites included to prevent blocking (e.g., ${prereqAdded.slice(0, 3).map((id) => skills[id].name).join(', ')}...).`)
    }
  }

  return { steps, reasoningTrace }
}

module.exports = {
  generateRoadmap,
}

