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
  
  const [inputTab, setInputTab] = useState<'upload' | 'paste' | 'linkedin'>('upload');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [linkedinSkills, setLinkedinSkills] = useState<string[]>([]);
  const [linkedinDemoMode, setLinkedinDemoMode] = useState(false);

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

  const handleLinkedInExtract = async () => {
    if (!linkedinUrl) return;
    setExtracting(true);
    setLinkedinDemoMode(false);
    try {
      const res = await fetch('http://localhost:5000/api/linkedin/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkedinUrl })
      });
      const data = await res.json();
      setLinkedinSkills(data.extractedSkills || []);
      setResumeText(data.profileText || '');
      if (data.demo) setLinkedinDemoMode(true);
    } catch (err) {
      console.error(err);
      alert('Could not fetch LinkedIn profile. Try pasting text instead.');
    } finally {
      setExtracting(false);
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
        
        {/* Brand Logo */}
        <div className="mb-12 md:mb-20" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

            {/* Input Tabs */}
            <div className="flex bg-[#111] p-1 rounded-lg mb-6 border border-[#222]">
              <button 
                onClick={() => setInputTab('upload')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${inputTab === 'upload' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                📄 Upload
              </button>
              <button 
                onClick={() => setInputTab('paste')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${inputTab === 'paste' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                ✏️ Paste Text
              </button>
              <button 
                onClick={() => setInputTab('linkedin')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${inputTab === 'linkedin' ? 'bg-[#222] text-white' : 'text-gray-500 hover:text-gray-300'}`}
              >
                🔗 LinkedIn
              </button>
            </div>
            
            {inputTab === 'upload' && (
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
            )}

            {inputTab === 'paste' && (
              <div className="space-y-4">
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
              </div>
            )}

            {inputTab === 'linkedin' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '14px 16px',
                  background: '#0A66C2' + '15',
                  border: '1px solid #0A66C2' + '30',
                  borderRadius: '10px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#F9FAFB' }}>
                      Import from LinkedIn
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>
                      AI extracts your skills automatically
                    </div>
                  </div>
                </div>

                {/* URL Input */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                    value={linkedinUrl}
                    onChange={e => setLinkedinUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      background: '#111111',
                      border: `1px solid ${linkedinUrl ? '#6366F1' : '#222222'}`,
                      borderRadius: '10px',
                      color: '#F9FAFB',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 200ms ease'
                    }}
                  />
                  <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                       width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                  </svg>
                </div>

                {/* Extract Button */}
                <button
                  onClick={handleLinkedInExtract}
                  disabled={!linkedinUrl || extracting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: linkedinUrl ? '#0A66C2' : '#1F1F1F',
                    border: 'none',
                    borderRadius: '10px',
                    color: linkedinUrl ? '#FFFFFF' : '#4B5563',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: linkedinUrl ? 'pointer' : 'not-allowed',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                  {extracting ? (
                    <>
                      <div className="animate-spin" style={{
                        width: '14px', height: '14px',
                        border: '2px solid #ffffff40',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%'
                      }} />
                      Extracting Skills...
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="23 4 23 10 17 10"/>
                        <path d="M20.49 15a9 9 0 1 1-.49-7.49"/>
                      </svg>
                      Extract Skills from LinkedIn
                    </>
                  )}
                </button>

                {/* Success State */}
                {linkedinSkills.length > 0 && (
                  <div style={{
                    padding: '14px 16px',
                    background: '#10B981' + '10',
                    border: '1px solid #10B981' + '30',
                    borderRadius: '10px'
                  }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 700,
                      color: '#10B981', marginBottom: '10px'
                    }}>
                      ✓ {linkedinSkills.length} Skills Extracted
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {linkedinSkills.map((skill, i) => (
                        <span key={i} style={{
                          padding: '4px 10px',
                          background: '#6366F1' + '15',
                          border: '1px solid #6366F1' + '30',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#818CF8'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {linkedinDemoMode && (
                  <div style={{
                    padding: '10px 14px',
                    background: '#F59E0B' + '15',
                    border: '1px solid #F59E0B' + '30',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F59E0B',
                    marginTop: '8px'
                  }}>
                    ⚠️ LinkedIn blocked direct access — using demo skills. For best results, paste your LinkedIn About section text instead.
                  </div>
                )}
              </div>
            )}
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
