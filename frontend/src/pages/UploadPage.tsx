import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText } from 'lucide-react';
import RoleCard from '../components/RoleCard';
import LoadingOverlay from '../components/LoadingOverlay';

export default function UploadPage() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedRole, setSelectedRole] = useState('Full Stack Developer');
  
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const loadSampleResume = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/samples/resumes');
      const data = await res.json();
      if (data.resumes[selectedRole]) {
        setResumeText(data.resumes[selectedRole]);
        setFile(null); // Clear file if sample text is loaded
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSampleJD = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/samples/job-descriptions');
      const data = await res.json();
      if (data.jobs[selectedRole]) {
        setJobDescription(data.jobs[selectedRole]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setLoadingStage(0);

    let extractedResumeText = resumeText;

    try {
      // Stage 0: Parsing
      if (file) {
        const formData = new FormData();
        formData.append('resume', file);
        const uploadRes = await fetch('http://localhost:5000/api/upload-resume', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        extractedResumeText = uploadData.resumeText;
      } else if (!extractedResumeText) {
        alert("Please provide a resume first.");
        setIsLoading(false);
        return;
      }

      setLoadingStage(1);
      
      // Stage 1: Analyze Skills
      const analyzeRes = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: extractedResumeText, role: selectedRole, jobDescriptionText: jobDescription }),
      });
      const analysisData = await analyzeRes.json();
      
      localStorage.setItem('onboarding_analysis', JSON.stringify({ ...analysisData, role: selectedRole }));

      setLoadingStage(2);
      await new Promise(r => setTimeout(r, 1500)); // artificial wait to show stages

      setLoadingStage(3);
      
      // Stage 3: Roadmap
      const roadmapRes = await fetch('http://localhost:5000/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: selectedRole, 
          missingSkills: analysisData.missingSkills, 
          weakSkills: analysisData.weakSkills, 
          extractedSkills: analysisData.extractedSkills 
        }),
      });
      const roadmapData = await roadmapRes.json();
      
      localStorage.setItem('onboarding_roadmap', JSON.stringify(roadmapData));

      setLoadingStage(4); // Fully complete
      setTimeout(() => {
        setIsLoading(false);
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      console.error(error);
      alert("Analysis failed. See console.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Column - Hero */}
      <div className="w-full md:w-5/12 p-8 md:p-16 flex flex-col justify-start border-b md:border-b-0 md:border-r border-[#222]">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          
          {/* Heading */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-2px',
              color: '#F9FAFB',
              margin: 0
            }}>
              Onboard Smarter.
            </h1>
            <h1 style={{
              fontSize: '56px', 
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-2px',
              color: '#6366F1',
              margin: 0
            }}>
              Learn Faster.
            </h1>
          </div>

          {/* Subheading */}
          <p style={{
            fontSize: '17px',
            color: '#6B7280',
            fontWeight: 400,
            lineHeight: 1.7,
            maxWidth: '420px',
            marginBottom: '36px'
          }}>
            AI analyzes your resume, finds your skill gaps, and 
            builds a personalized learning roadmap in seconds.
          </p>

          {/* Feature Cards */}
          {[
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
                </svg>
              ),
              iconBg: '#1E1B4B',
              title: 'AI Skill Extraction',
              desc: 'Detects 50+ technical skills from your resume automatically'
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                  <line x1="22" y1="12" x2="18" y2="12"/>
                  <line x1="6" y1="12" x2="2" y2="12"/>
                  <line x1="12" y1="6" x2="12" y2="2"/>
                  <line x1="12" y1="22" x2="12" y2="18"/>
                </svg>
              ),
              iconBg: '#14532D', 
              title: 'Gap Analysis',
              desc: 'Finds missing and weak skills vs your target role'
            },
            {
              icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round">
                  <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                  <line x1="9" y1="3" x2="9" y2="18"/>
                  <line x1="15" y1="6" x2="15" y2="21"/>
                </svg>
              ),
              iconBg: '#164E63',
              title: 'Adaptive Roadmap',
              desc: 'Builds a week-by-week learning plan in priority order'
            }
          ].map((feature, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '20px 24px',
              background: '#111111',
              border: '1px solid #1F1F1F',
              borderRadius: '14px',
              marginBottom: '12px',
              cursor: 'default',
              transition: 'border-color 200ms ease, transform 200ms ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1F1F1F';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              
              {/* Icon Box */}
              <div style={{
                width: '44px', height: '44px',
                background: feature.iconBg,
                borderRadius: '10px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {feature.icon}
              </div>

              {/* Text */}
              <div>
                <div style={{
                  fontSize: '15px', fontWeight: 700,
                  color: '#F9FAFB', letterSpacing: '-0.3px',
                  marginBottom: '4px'
                }}>
                  {feature.title}
                </div>
                <div style={{
                  fontSize: '13px', color: '#6B7280',
                  lineHeight: 1.5
                }}>
                  {feature.desc}
                </div>
              </div>
            </div>
          ))}

          {/* Stats Bar */}
          <div style={{
            display: 'flex', gap: '32px',
            marginTop: '20px', paddingTop: '24px',
            borderTop: '1px solid #1F1F1F'
          }}>
            {[
              { num: '4', label: 'Roles' },
              { num: '50+', label: 'Skills Tracked' },
              { num: '8 Weeks', label: 'Avg Roadmap' },
              { num: 'AI', label: 'Powered', color: '#6366F1' }
            ].map((s, i) => (
              <div key={i}>
                <div style={{ 
                  fontSize: '22px', fontWeight: 800,
                  color: s.color || '#F9FAFB' 
                }}>{s.num}</div>
                <div style={{ 
                  fontSize: '12px', color: '#6B7280', 
                  marginTop: '2px' 
                }}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Right Column - Wizard */}
      <div className="w-full md:w-7/12 p-8 md:p-16 overflow-y-auto">
        <div className="max-w-xl mx-auto space-y-12">
          
          {/* Step 1 */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-indigo-500 text-white flex items-center justify-center text-sm">1</span>
              Your Resume
            </h2>
            
            <div 
              className={`w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-[#333] hover:border-[#6366F1] hover:bg-[#111]'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className={`w-10 h-10 mb-4 ${isDragging ? 'text-indigo-400' : 'text-gray-500'}`} />
              {file ? (
                <div className="text-emerald-400 font-semibold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</div>
              ) : (
                <>
                  <p className="font-semibold text-white mb-2">Drop resume here or click to browse</p>
                  <p className="text-sm text-gray-500">Accepts PDF / DOCX</p>
                </>
              )}
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.docx" />
            </div>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-[#222]"></div>
              <span className="px-4 text-xs font-bold text-gray-600 uppercase">OR</span>
              <div className="flex-1 h-px bg-[#222]"></div>
            </div>

            <textarea 
              className="w-full h-32 bg-[#111] border border-[#222] rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />

            <div className="mt-4 flex justify-end">
              <button onClick={loadSampleResume} className="btn-ghost text-xs py-1.5 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Load Sample Resume
              </button>
            </div>
          </section>

          {/* Step 2 */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded bg-indigo-500 text-white flex items-center justify-center text-sm">2</span>
              Target Role
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RoleCard 
                role="Full Stack Developer" 
                selected={selectedRole === 'Full Stack Developer'} 
                onClick={() => setSelectedRole('Full Stack Developer')} 
                skills={['React', 'Node.js', 'MongoDB']} 
              />
              <RoleCard 
                role="Frontend Developer" 
                selected={selectedRole === 'Frontend Developer'} 
                onClick={() => setSelectedRole('Frontend Developer')} 
                skills={['React', 'Tailwind', 'Redux']} 
              />
              <RoleCard 
                role="Backend Developer" 
                selected={selectedRole === 'Backend Developer'} 
                onClick={() => setSelectedRole('Backend Developer')} 
                skills={['Node.js', 'PostgreSQL', 'Docker']} 
              />
              <RoleCard 
                role="Data Analyst" 
                selected={selectedRole === 'Data Analyst'} 
                onClick={() => setSelectedRole('Data Analyst')} 
                skills={['Python', 'SQL', 'Tableau']} 
              />
            </div>
          </section>

          {/* Step 3 */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="w-8 h-8 rounded border-[#333] border text-gray-500 flex items-center justify-center text-sm">3</span>
              Job Description <span className="text-gray-600 font-normal text-sm ml-2">(Optional)</span>
            </h2>
            <textarea 
              className="w-full h-24 bg-[#111] border border-[#222] rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Paste job description to tailor the roadmap..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button onClick={loadSampleJD} className="btn-ghost text-xs py-1.5 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Load Sample JD
              </button>
            </div>
          </section>

          <button 
            onClick={handleAnalyze} 
            className="w-full btn-primary text-lg py-4 group"
            disabled={isLoading || (!file && !resumeText)}
          >
            Analyze & Build Roadmap 
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </button>
        </div>
      </div>

      <LoadingOverlay isOpen={isLoading} stage={loadingStage} />
    </div>
  );
}
