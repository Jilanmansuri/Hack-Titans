// Prefer relative `/api` so Vite can proxy to the backend during local development.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').trim()

async function handleJson(res: Response) {
  const text = await res.text()
  let data: any = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return data
}

export async function listResumeSamples() {
  const res = await fetch(`${API_BASE}/samples/resumes`)
  return handleJson(res)
}

export async function listJobDescriptionSamples() {
  const res = await fetch(`${API_BASE}/samples/job-descriptions`)
  return handleJson(res)
}

export async function getResumeSampleById(id: string) {
  const res = await fetch(`${API_BASE}/samples/resumes/${encodeURIComponent(id)}`)
  return handleJson(res)
}

export async function getJobDescriptionSampleById(id: string) {
  const res = await fetch(`${API_BASE}/samples/job-descriptions/${encodeURIComponent(id)}`)
  return handleJson(res)
}

export async function uploadResume(file: File) {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${API_BASE}/upload-resume`, {
    method: 'POST',
    body: form,
  })
  return handleJson(res)
}

export async function analyzeResume(payload: {
  resumeText?: string
  jobDescriptionText?: string
  role?: string
  resumeSampleId?: string
  jobDescriptionSampleId?: string
}) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleJson(res)
}

export async function generateRoadmap(payload: {
  analysisId?: string | null
  role: string
  gaps: { missingSkills: any[]; weakSkills: any[] }
}) {
  const res = await fetch(`${API_BASE}/generate-roadmap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleJson(res)
}

