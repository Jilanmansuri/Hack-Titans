const path = require('path')

const resumes = require('../../dataset/sample_resumes.json')
const jobDescriptions = require('../../dataset/sample_job_descriptions.json')

function listResumeSamples(_req, res) {
  res.json({
    samples: resumes.map((r) => ({ id: r.id, title: r.title })),
  })
}

function listJobDescriptionSamples(_req, res) {
  res.json({
    samples: jobDescriptions.map((j) => ({ id: j.id, title: j.title })),
  })
}

function getResumeTextById(req, res) {
  const id = req.params.id
  const sample = resumes.find((r) => r.id === id)
  if (!sample) return res.status(404).json({ error: 'Resume sample not found' })
  res.json({ id: sample.id, title: sample.title, text: sample.text })
}

function getJobDescriptionTextById(req, res) {
  const id = req.params.id
  const sample = jobDescriptions.find((j) => j.id === id)
  if (!sample) return res.status(404).json({ error: 'Job description sample not found' })
  res.json({ id: sample.id, title: sample.title, text: sample.text })
}

module.exports = {
  listResumeSamples,
  listJobDescriptionSamples,
  getResumeTextById,
  getJobDescriptionTextById,
}

