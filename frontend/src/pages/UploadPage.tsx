import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getJobDescriptionSampleById,
  getResumeSampleById,
  listJobDescriptionSamples,
  listResumeSamples,
  analyzeResume,
  generateRoadmap,
  uploadResume,
} from '../lib/api'

const ROLE_OPTIONS = ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Data Analyst']

type SampleOption = { id: string; title: string }

type RoadmapResult = {
  analysisId: string | null
  role: string
  roadmap: { step: number; stage: string; recommendedDurationWeeks: number; topics: string[] }[]
  reasoningTrace: string[]
}

export default function UploadPage() {
  const navigate = useNavigate()

  const [role, setRole] = useState(ROLE_OPTIONS[0])
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescriptionText, setJobDescriptionText] = useState('')

  const [resumeSamples, setResumeSamples] = useState<SampleOption[]>([])
  const [jdSamples, setJdSamples] = useState<SampleOption[]>([])
  const [resumeSampleId, setResumeSampleId] = useState<string>('')
  const [jdSampleId, setJdSampleId] = useState<string>('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Upload a resume or paste text to start.')

  useEffect(() => {
    ;(async () => {
      try {
        const [res, jd] = await Promise.all([listResumeSamples(), listJobDescriptionSamples()])
        setResumeSamples(res?.samples || [])
        setJdSamples(jd?.samples || [])
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Sample dataset fetch failed:', e)
      }
    })()
  }, [])

  const canAnalyze = useMemo(() => {
    const hasText = resumeText.trim().length > 0
    return Boolean(hasText || resumeFile || resumeSampleId)
  }, [resumeText, resumeFile, resumeSampleId])

  async function resolveResumeText(): Promise<string> {
    if (resumeFile) {
      const upload = await uploadResume(resumeFile)
      if (upload?.resumeText) return upload.resumeText
    }
    if (resumeText.trim()) return resumeText
    if (resumeSampleId) {
      const sample = await getResumeSampleById(resumeSampleId)
      return sample?.text || ''
    }
    return ''
  }

  async function resolveJobDescriptionText(): Promise<string> {
    if (jobDescriptionText.trim()) return jobDescriptionText
    if (jdSampleId) {
      const sample = await getJobDescriptionSampleById(jdSampleId)
      return sample?.text || ''
    }
    return ''
  }

  async function onAnalyze() {
    setError(null)
    setLoading(true)
    setStatus('Extracting skills and computing gaps...')

    try {
      const resolvedResumeText = await resolveResumeText()
      if (!resolvedResumeText.trim()) {
        throw new Error('Resume text is empty. Upload a resume or paste text.')
      }

      const resolvedJobDescriptionText = await resolveJobDescriptionText()

      const analysis = await analyzeResume({
        resumeText: resolvedResumeText,
        jobDescriptionText: resolvedJobDescriptionText,
        role,
      })

      if (!analysis?.analysisId) throw new Error('Analysis failed: missing analysisId.')

      setStatus('Generating your adaptive learning roadmap...')
      const roadmap: RoadmapResult = await generateRoadmap({
        analysisId: analysis.analysisId,
        role,
        gaps: analysis.gaps,
      })

      const combined = { analysis, roadmap }
      localStorage.setItem('adaptive_onboarding_result', JSON.stringify(combined))
      navigate('/dashboard')
    } catch (e: any) {
      setError(String(e?.message || e))
      setStatus('Upload a resume or paste text to start.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-lg font-semibold">1) Choose Role + Resume</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-300">Target Role</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300">Sample Resume (optional)</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
              value={resumeSampleId}
              onChange={(e) => {
                setResumeSampleId(e.target.value)
                setResumeFile(null)
                setResumeText('')
              }}
            >
              <option value="">-- Select sample --</option>
              {resumeSamples.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-slate-300">Upload PDF or DOCX (optional)</label>
          <input
            className="mt-2 w-full cursor-pointer rounded-lg border border-dashed border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              const f = e.target.files?.[0] || null
              setResumeFile(f)
              setResumeSampleId('')
              setResumeText('')
            }}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm text-slate-300">Paste Resume Text (optional)</label>
          <textarea
            className="mt-2 h-44 w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-50"
            placeholder="Paste resume text here. Or use upload / sample resume."
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-lg font-semibold">2) Job Description (optional)</h2>
        <div className="mt-4">
          <label className="block text-sm text-slate-300">Sample Job Description</label>
          <select
            className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-50"
            value={jdSampleId}
            onChange={(e) => {
              setJdSampleId(e.target.value)
              setJobDescriptionText('')
            }}
          >
            <option value="">-- Select sample --</option>
            {jdSamples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-slate-300">Paste Job Description Text</label>
          <textarea
            className="mt-2 h-28 w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-50"
            placeholder="Optional: provide JD text to refine required skills."
            value={jobDescriptionText}
            onChange={(e) => setJobDescriptionText(e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h2 className="text-lg font-semibold">3) Generate Roadmap</h2>
        <p className="mt-2 text-sm text-slate-300">{status}</p>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canAnalyze || loading}
            onClick={onAnalyze}
          >
            {loading ? 'Working...' : 'Analyze & Generate Roadmap'}
          </button>

          <p className="text-xs text-slate-400">
            Demo mode works without API keys (heuristic skill matching).
          </p>
        </div>
      </section>
    </div>
  )
}

