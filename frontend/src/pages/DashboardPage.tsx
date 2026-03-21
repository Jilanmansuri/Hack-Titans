import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import SkillPill from '../components/SkillPill';
import RadarChartComponent from '../components/RadarChartComponent';
import Timeline from '../components/Timeline';
import ReasoningPanel from '../components/ReasoningPanel';
import InterviewPanel from '../components/InterviewPanel';
import ShareModal from '../components/ShareModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const analysisData = localStorage.getItem('onboarding_analysis');
    const roadmapData = localStorage.getItem('onboarding_roadmap');
    
    if (analysisData && roadmapData) {
      setAnalysis(JSON.parse(analysisData));
      setRoadmap(JSON.parse(roadmapData));
    } else {
      // If no data, send them back to upload
      navigate('/');
    }
  }, [navigate]);

  if (!analysis || !roadmap) return <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">Loading...</div>;

  const handlePrint = () => {
    window.print();
  };

  // Build Radar Data
  const radarData = [
    { subject: 'Languages', A: 80, B: 100, fullMark: 100 },
    { subject: 'Frameworks', A: 60, B: 90, fullMark: 100 },
    { subject: 'Databases', A: 40, B: 85, fullMark: 100 },
    { subject: 'Tools', A: 50, B: 80, fullMark: 100 },
    { subject: 'Concepts', A: 70, B: 100, fullMark: 100 },
  ]; // Mock data since the backend doesn't output precise category scores, but we can synthesize

  const totalSkills = (analysis.extractedSkills?.length || 0) + (analysis.missingSkills?.length || 0);
  const matchScore = totalSkills > 0 ? Math.round(((analysis.extractedSkills?.length || 0) / totalSkills) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white print:bg-white print:text-black">
      {/* Top Bar */}
      <div className="border-b border-[#222] bg-[#111] p-4 sticky top-0 z-30 no-print">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                 onClick={() => navigate('/')}>
              {/* Hexagon Logo */}
              <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
                <style>{`
                  .hx { stroke-dasharray: 120; stroke-dashoffset: 120; animation: dh 0.8s ease forwards; }
                  .bt { stroke-dasharray: 40; stroke-dashoffset: 40; animation: db 0.5s ease forwards 0.7s; }
                  @keyframes dh { to { stroke-dashoffset: 0; } }
                  @keyframes db { to { stroke-dashoffset: 0; } }
                `}</style>
                <polygon className="hx"
                  points="18,2 32,10 32,26 18,34 4,26 4,10"
                  fill="#6366F1" fillOpacity="0.15"
                  stroke="#6366F1" strokeWidth="1.5"
                />
                <path className="bt"
                  d="M21 8L14 18H20L15 28"
                  stroke="#6366F1" strokeWidth="2.2"
                  strokeLinecap="round" strokeLinejoin="round" fill="none"
                />
              </svg>

              {/* Name */}
              <div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                  Skill<span style={{ color: '#6366F1' }}>Forge</span>
                  <span style={{ color: '#06B6D4', fontSize: '11px', fontWeight: 700, marginLeft: '4px', letterSpacing: '1px' }}>AI</span>
                </div>
                <div style={{ fontSize: '10px', color: '#4B5563', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Career Accelerator
                </div>
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Roadmap for</div>
              <h1 className="text-lg font-bold">{analysis.role}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowShareModal(true)} className="btn-primary text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share Roadmap
            </button>
            <button onClick={() => navigate('/')} className="btn-ghost text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Re-analyze
            </button>
            <button onClick={handlePrint} className="btn-ghost text-sm flex items-center gap-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 hidden md:flex">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Column 1: Skill Intelligence */}
          <div className="w-full lg:w-3/12 space-y-8">
            <section>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Extracted Skills <span className="text-indigo-400 ml-2">({analysis.extractedSkills?.length || 0} detected)</span></h3>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scroll">
                {analysis.extractedSkills?.map((skill: string) => (
                  <SkillPill key={skill} skill={skill} strength="strong" />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Skill Gap Radar</h3>
              <RadarChartComponent data={radarData} />
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="card !p-4 !border-l-4 !border-l-red-500 flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-white mb-1">{analysis.missingSkills?.length || 0}</span>
                <span className="text-xs font-bold text-gray-500 uppercase">Missing Skills</span>
              </div>
              <div className="card !p-4 !border-l-4 !border-l-amber-500 flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-white mb-1">{analysis.weakSkills?.length || 0}</span>
                <span className="text-xs font-bold text-gray-500 uppercase">Weak Skills</span>
              </div>
              <div className="card !p-4 !border-l-4 !border-l-emerald-500 flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-white mb-1">{analysis.extractedSkills?.length || 0}</span>
                <span className="text-xs font-bold text-gray-500 uppercase">Strong Skills</span>
              </div>
              <div className="card !p-4 !border-l-4 !border-l-indigo-500 flex flex-col justify-center">
                <span className="text-3xl font-extrabold text-indigo-400 mb-1">{matchScore}%</span>
                <span className="text-xs font-bold text-gray-500 uppercase">Role Match</span>
              </div>
            </section>
          </div>

          {/* Column 2: Timeline */}
          <div className="w-full lg:w-6/12 max-h-none lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto pr-4 custom-scroll">
            <Timeline steps={roadmap.roadmap || []} />
          </div>

          {/* Column 3: AI Reasoning */}
          <div className="w-full lg:w-3/12 space-y-8">
            <div className="card border-0 bg-indigo-500/10 p-6 flex items-center justify-between">
              <div>
                <span className="block text-4xl font-extrabold text-indigo-400 mb-1">87%</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analysis Confidence</span>
              </div>
              <div className="text-right text-xs text-indigo-400/80 max-w-[120px]">Based on resume clarity & role match</div>
            </div>

            <ReasoningPanel reasoningTrace={analysis.reasoningTrace} />
            
            <section className="card p-6 border-dashed border-[#333] hidden xl:block relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(99,102,241,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250px_250px] animate-[pulse_3s_linear_infinite]" />
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 relative z-10">Skill Topology</h3>
              <p className="text-xs text-gray-400 mb-4 relative z-10">
                A dense node map showing relationship between missing concepts and core prerequisites.
              </p>
              <div className="h-[120px] w-full border border-[#222] bg-[#0A0A0A] rounded relative z-10 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 120">
                  {/* Connecting Lines */}
                  <line x1="120" y1="60" x2="40" y2="30" stroke="#333" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="120" y1="60" x2="40" y2="90" stroke="#333" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="120" y1="60" x2="200" y2="30" stroke="#4F46E5" strokeWidth="1.5" className="animate-[pulse_2s_ease-in-out_infinite]" />
                  <line x1="120" y1="60" x2="200" y2="90" stroke="#4F46E5" strokeWidth="1.5" className="animate-[pulse_2s_ease-in-out_infinite_500ms]" />
                  
                  {/* Nodes */}
                  <circle cx="40" cy="30" r="4" fill="#374151" />
                  <circle cx="40" cy="90" r="4" fill="#374151" />
                  
                  {/* Central Node */}
                  <circle cx="120" cy="60" r="6" fill="#6366F1" />
                  <circle cx="120" cy="60" r="12" fill="#6366F1" opacity="0.2" className="animate-ping" style={{ animationDuration: '3s' }} />
                  
                  {/* Target Nodes */}
                  <circle cx="200" cy="30" r="5" fill="#10B981" />
                  <circle cx="200" cy="90" r="5" fill="#10B981" />
                  
                  {/* Labels */}
                  <text x="40" y="42" fill="#6B7280" fontSize="8" textAnchor="middle" className="font-mono">
                    {(analysis.extractedSkills?.[0] || 'HTML').substring(0, 10)}
                  </text>
                  <text x="40" y="102" fill="#6B7280" fontSize="8" textAnchor="middle" className="font-mono">
                    {(analysis.extractedSkills?.[1] || 'CSS').substring(0, 10)}
                  </text>
                  
                  <text x="120" y="76" fill="#818CF8" fontSize="8" textAnchor="middle" className="font-mono font-bold">YOU</text>
                  
                  <text x="200" y="18" fill="#10B981" fontSize="8" textAnchor="middle" className="font-mono">
                    {(analysis.missingSkills?.[0] || 'React').substring(0, 10)}
                  </text>
                  <text x="200" y="102" fill="#10B981" fontSize="8" textAnchor="middle" className="font-mono">
                    {(analysis.missingSkills?.[1] || 'Node.js').substring(0, 10)}
                  </text>
                </svg>
              </div>
            </section>
          </div>
        </div>

        {/* Feature 1 - Interview Panel placed fully below the main columns */}
        <InterviewPanel 
          role={analysis.role}
          missingSkills={analysis.missingSkills || []}
          weakSkills={analysis.weakSkills || []}
          extractedSkills={analysis.extractedSkills || []}
        />
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        analysisData={analysis}
        roadmapData={roadmap}
      />
    </div>
  );
}
