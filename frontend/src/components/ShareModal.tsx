import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: any;
  roadmapData: any;
}

export default function ShareModal({ isOpen, onClose, analysisData, roadmapData }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0A0A0A',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = 'my-roadmap.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) {
      console.error(e);
      alert("Failed to build PNG image.");
    }
  };

  const handleShare = async () => {
    const encoded = btoa(JSON.stringify({
      role: analysisData.role,
      score: analysisData.matchScore || 64,
      steps: roadmapData?.roadmap?.length || 9,
      weeks: 8
    }));
    const url = `${window.location.origin}/shared?data=${encoded}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Adaptive Roadmap',
          text: `Check out my personalized learning roadmap for ${analysisData.role}!`,
          url: url
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const totalSkills = (analysisData.extractedSkills?.length || 0) + (analysisData.missingSkills?.length || 0);
  const matchScore = totalSkills > 0 ? Math.round(((analysisData.extractedSkills?.length || 0) / totalSkills) * 100) : 0;

  const coverageData = [
    { category: 'Languages', have: 80, need: 100 },
    { category: 'Frameworks', have: 60, need: 100 },
    { category: 'Tools', have: 40, need: 100 },
    { category: 'Databases', have: 30, need: 100 },
    { category: 'Concepts', have: 50, need: 100 },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#000000Cc] backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="flex flex-col items-center my-8 transition-all w-full max-w-[480px]" onClick={e => e.stopPropagation()}>
        {/* The Card to be captured */}
        <div 
          ref={cardRef} 
          className="w-full bg-[#0A0A0A] border border-[#6366F1] rounded-2xl p-8 relative overflow-hidden shrink-0"
          style={{ transform: 'scale(1)', transformOrigin: 'center' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#222] pb-6 mb-6">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold text-sm">
              AO
            </div>
            <h2 className="text-xl font-bold text-[#F9FAFB]">Adaptive Onboarding</h2>
          </div>

          <p className="text-[#6366F1] text-2xl font-extrabold mb-1">{analysisData.role}</p>
          <p className="text-gray-400 text-sm mb-6">Personalized Learning Roadmap</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-[#111111] p-4 rounded-xl text-center border border-[#222]">
              <div className="text-gray-500 text-xs font-bold uppercase mb-1">Skills</div>
              <div className="text-white text-2xl font-bold">{analysisData.extractedSkills?.length || 0}</div>
            </div>
            <div className="bg-[#111111] p-4 rounded-xl text-center border border-[#222]">
              <div className="text-gray-500 text-xs font-bold uppercase mb-1">Gaps</div>
              <div className="text-white text-2xl font-bold">{analysisData.missingSkills?.length || 0}</div>
            </div>
            <div className="bg-[#111111] p-4 rounded-xl text-center border border-[#222]">
              <div className="text-gray-500 text-xs font-bold uppercase mb-1">Match</div>
              <div className="text-[#6366F1] text-2xl font-bold">{matchScore}%</div>
            </div>
          </div>

          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            Roadmap: 8 weeks · {roadmapData?.roadmap?.length || 0} steps
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center text-sm">
              <span className="w-24 text-gray-300">Basics</span>
              <div className="flex-1 h-3 bg-[#222] rounded-full overflow-hidden">
                <div className="w-[40%] h-full bg-[#6366F1] rounded-full" />
              </div>
              <span className="w-24 text-right text-gray-500 text-xs">Week 1-2</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-24 text-gray-300">Intermediate</span>
              <div className="flex-1 h-3 bg-[#222] rounded-full overflow-hidden">
                <div className="w-[60%] h-full bg-[#F59E0B] rounded-full" />
              </div>
              <span className="w-24 text-right text-gray-500 text-xs">Week 3-5</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-24 text-gray-300">Advanced</span>
              <div className="flex-1 h-3 bg-[#222] rounded-full overflow-hidden">
                <div className="w-[30%] h-full bg-[#06B6D4] rounded-full" />
              </div>
              <span className="w-24 text-right text-gray-500 text-xs">Week 6-8</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-gray-500 uppercase font-bold mb-3">Skill Coverage</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={coverageData} layout="vertical" margin={{ left: 60, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} width={60} />
                <Bar dataKey="need" fill="#222222" radius={[0, 4, 4, 0]} barSize={12} style={{ transform: 'translateX(-4px)' }} />
                <Bar dataKey="have" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={12} style={{ transform: 'translateY(-12px)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-6 border-t border-[#222] text-center">
            <span className="text-[#4B5563] text-sm flex items-center justify-center gap-2">
              Generated by Adaptive Onboarding ✦
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
          <button onClick={handleDownload} className="btn-primary flex-1 py-3 text-sm">
            <Download className="w-4 h-4 mr-2" /> Download PNG
          </button>
          <button onClick={handleShare} className="btn-ghost flex-1 bg-[#111] hover:bg-[#222] py-3 text-sm border border-[#333]">
            <Share2 className="w-4 h-4 mr-2" /> Share Link
          </button>
        </div>
        
        <button onClick={onClose} className="mt-6 mb-12 text-gray-500 hover:text-white transition-colors flex items-center gap-2">
          <X className="w-5 h-5" /> Close
        </button>
      </div>
    </div>
  );
}
