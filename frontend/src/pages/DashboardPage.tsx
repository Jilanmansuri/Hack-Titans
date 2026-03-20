import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'

type StoredResult = {
  analysis: any
  roadmap: {
    analysisId: string | null
    role: string
    roadmap: { step: number; stage: string; recommendedDurationWeeks: number; topics: string[] }[]
    reasoningTrace: string[]
  }
}

export default function DashboardPage() {
  const navigate = useNavigate()

  const [result, setResult] = useState<StoredResult | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const raw = localStorage.getItem('adaptive_onboarding_result')
    if (!raw) return
    try {
      setResult(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const analysisId = result?.analysis?.analysisId || result?.roadmap?.analysisId || 'unknown'

  useEffect(() => {
    if (!analysisId) return
    const key = `onboarding_progress_${analysisId}`
    const raw = localStorage.getItem(key)
    if (!raw) return
    try {
      setCompletedSteps(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [analysisId])

  useEffect(() => {
    if (!analysisId) return
    const key = `onboarding_progress_${analysisId}`
    localStorage.setItem(key, JSON.stringify(completedSteps))
  }, [completedSteps, analysisId])

  const completionPct = useMemo(() => {
    const steps = result?.roadmap?.roadmap || []
    if (!steps.length) return 0
    const done = steps.filter((s) => completedSteps[String(s.step)]).length
    return Math.round((done / steps.length) * 100)
  }, [completedSteps, result])

  if (!result) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <p className="text-slate-200">No analysis found. Start from the upload page.</p>
        <button
          className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-500"
          onClick={() => navigate('/')}
        >
          Go to Upload
        </button>
      </div>
    )
  }

  const analysis = result.analysis
  const roadmap = result.roadmap

  function downloadRoadmapPdf() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 36
    let y = 48

    const header = 'Adaptive Onboarding Engine - Roadmap'
    doc.setFontSize(16)
    doc.text(header, margin, y)
    y += 18

    doc.setFontSize(11)
    doc.text(`Role: ${roadmap.role}`, margin, y)
    y += 14
    doc.text(`Experience estimate: ${analysis.experienceLevel}`, margin, y)
    y += 18

    doc.setFontSize(12)
    doc.text('Learning Roadmap', margin, y)
    y += 16
    doc.setFontSize(10)

    const steps = roadmap.roadmap || []
    if (!steps.length) {
      doc.text('No roadmap steps generated.', margin, y)
      doc.save('adaptive-onboarding-roadmap.pdf')
      return
    }

    for (const step of steps) {
      if (y > 760) {
        doc.addPage()
        y = 48
      }

      doc.setFontSize(11)
      doc.text(`Step ${step.step}: ${step.stage} (~${step.recommendedDurationWeeks} week(s))`, margin, y)
      y += 14
      doc.setFontSize(10)

      const topics = (step.topics || []).map((t) => `• ${t}`)
      const maxTextWidth = pageWidth - margin * 2
      const wrapped = topics.flatMap((line) =>
        doc.splitTextToSize(line, maxTextWidth) as unknown as string[]
      )
      for (const line of wrapped) {
        if (y > 760) {
          doc.addPage()
          y = 48
        }
        doc.text(line, margin + 6, y)
        y += 12
      }

      y += 8
    }

    y += 6
    if (y > 760) {
      doc.addPage()
      y = 48
    }

    doc.setFontSize(12)
    doc.text('Why This Roadmap Was Generated', margin, y)
    y += 16
    doc.setFontSize(10)

    const traceItems = [
      ...(analysis.reasoningTrace || []),
      ...(roadmap.reasoningTrace || []),
    ]

    if (!traceItems.length) {
      doc.text('No reasoning trace available.', margin, y)
      doc.save('adaptive-onboarding-roadmap.pdf')
      return
    }

    for (const item of traceItems) {
      const lines = doc.splitTextToSize(`- ${item}`, pageWidth - margin * 2) as unknown as string[]
      for (const line of lines) {
        if (y > 760) {
          doc.addPage()
          y = 48
        }
        doc.text(line, margin, y)
        y += 12
      }
      y += 4
    }

    doc.save('adaptive-onboarding-roadmap.pdf')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Learning Dashboard</h2>
            <p className="text-sm text-slate-300">
              Role: <span className="font-medium text-slate-100">{roadmap.role}</span> · Experience estimate:{' '}
              <span className="font-medium text-slate-100">{analysis.experienceLevel}</span>
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-center">
            <div className="text-xs text-slate-400">Progress</div>
            <div className="text-2xl font-semibold">{completionPct}%</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-semibold">Extracted Skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(analysis.extractedSkills || []).slice(0, 20).map((s: any) => (
              <span
                key={s.id}
                className="rounded-full border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-200"
                title={(s.evidence || []).join('\n')}
              >
                {s.name} · L{s.level}
              </span>
            ))}
            {!analysis.extractedSkills?.length ? (
              <p className="text-sm text-slate-400">No skills extracted.</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="text-base font-semibold">Skill Gaps</h3>
          <div className="mt-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="text-sm font-medium text-slate-100">Missing</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(analysis.gaps?.missingSkills || []).map((s: any) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-red-800/50 bg-red-950/20 px-3 py-1 text-xs text-red-200"
                  >
                    {s.name} (requires L{s.requiredLevel})
                  </span>
                ))}
                {!analysis.gaps?.missingSkills?.length ? (
                  <span className="text-sm text-slate-400">None detected.</span>
                ) : null}
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div className="text-sm font-medium text-slate-100">Weak</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(analysis.gaps?.weakSkills || []).map((s: any) => (
                  <span
                    key={s.id}
                    className="rounded-full border border-amber-800/50 bg-amber-950/20 px-3 py-1 text-xs text-amber-200"
                  >
                    {s.name} (L{s.extractedLevel} → L{s.requiredLevel})
                  </span>
                ))}
                {!analysis.gaps?.weakSkills?.length ? (
                  <span className="text-sm text-slate-400">None detected.</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold">Adaptive Roadmap Timeline</h3>
            <p className="text-sm text-slate-300">Dependency-safe learning order with stage grouping.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
              onClick={() => downloadRoadmapPdf()}
            >
              Download PDF
            </button>
            <button
              className="rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
              onClick={() => navigate('/')}
            >
              New Analysis
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {(roadmap.roadmap || []).map((step) => {
            const done = Boolean(completedSteps[String(step.step)])
            return (
              <div
                key={step.step}
                className={`rounded-xl border p-4 ${
                  done ? 'border-emerald-800/60 bg-emerald-950/20' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-slate-100">
                        Step {step.step}: {step.stage}
                      </div>
                      <div className="text-xs text-slate-400">
                        ~{step.recommendedDurationWeeks} week{step.recommendedDurationWeeks === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.topics.map((t: string) => (
                        <span
                          key={t}
                          className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={(e) =>
                        setCompletedSteps((prev) => ({
                          ...prev,
                          [String(step.step)]: e.target.checked,
                        }))
                      }
                    />
                    Mark complete
                  </label>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-base font-semibold">Why This Roadmap Was Generated</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm font-medium text-slate-100">Analysis Trace</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-200">
              {(analysis.reasoningTrace || []).map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm font-medium text-slate-100">Roadmap Trace</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-200">
              {(roadmap.reasoningTrace || []).map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

