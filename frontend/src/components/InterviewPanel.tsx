import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Target, Loader2, Play } from 'lucide-react';
import { cn } from './SkillPill';

interface InterviewPanelProps {
  role: string;
  missingSkills: string[];
  weakSkills: string[];
  extractedSkills: string[];
}

export default function InterviewPanel({ role, missingSkills, weakSkills, extractedSkills }: InterviewPanelProps) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'questioning' | 'evaluating' | 'results'>('idle');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [results, setResults] = useState<any>(null);

  const startInterview = async () => {
    setPhase('loading');
    try {
      const res = await fetch('http://localhost:5000/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, missingSkills, weakSkills, extractedSkills }),
      });
      const data = await res.json();
      setQuestions(data.questions);
      setAnswers([]);
      setCurrentQ(0);
      setCurrentAnswer('');
      setPhase('questioning');
    } catch (e) {
      console.error(e);
      setPhase('idle');
      alert('Failed to start interview.');
    }
  };

  const submitAnswer = async () => {
    if (!currentAnswer.trim()) return;
    
    const newAnswers = [...answers, currentAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQ + 1 < questions.length) {
      setCurrentQ(curr => curr + 1);
    } else {
      setPhase('evaluating');
      try {
        const res = await fetch('http://localhost:5000/api/interview/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, questions, answers: newAnswers }),
        });
        const data = await res.json();
        setResults(data);
        setPhase('results');
      } catch (e) {
        console.error(e);
        setPhase('idle');
        alert('Failed to evaluate interview.');
      }
    }
  };

  let radarData: any[] = [];
  if (results) {
    radarData = [
      { subject: 'Technical', score: results.technicalScore },
      { subject: 'Communication', score: results.communicationScore },
      { subject: 'Confidence', score: results.confidenceScore },
      { subject: 'Problem Solving', score: results.problemSolvingScore },
      { subject: 'Role Fit', score: results.roleFitScore },
    ];
  }

  const renderContent = () => {
    if (phase === 'idle') {
      return (
        <div className="flex flex-col md:flex-row items-center justify-between p-8">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-indigo-500" />
              AI Mock Interview 
            </h3>
            <p className="text-gray-400">Practice role-specific questions based on YOUR skill gaps.</p>
          </div>
          <button onClick={startInterview} className="btn-primary mt-6 md:mt-0 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            Start Interview <Play className="w-4 h-4 ml-2" />
          </button>
        </div>
      );
    }

    if (phase === 'loading' || phase === 'evaluating') {
      return (
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">
            {phase === 'loading' ? 'Generating targeted questions...' : 'Evaluating your answers...'}
          </h3>
          <p className="text-sm text-gray-500">Claude AI is assessing your profile gaps.</p>
        </div>
      );
    }

    if (phase === 'questioning') {
      const q = questions[currentQ];
      return (
        <div className="p-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Question {currentQ + 1} of {questions.length}
            </h3>
            <div className="flex gap-2">
              {questions.map((_, i) => (
                <div key={i} className={cn("w-3 h-3 rounded-full transition-colors", i <= currentQ ? "bg-indigo-500" : "bg-[#222]")} />
              ))}
            </div>
          </div>

          <div className="border-l-[4px] border-indigo-500 pl-6 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              "{q.question}"
            </h2>
            <div className="mt-4 flex gap-2">
              <span className="text-xs bg-[#222] text-gray-400 px-2 py-1 rounded font-bold uppercase tracking-wide">
                Target: {q.targetSkill}
              </span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded font-bold uppercase tracking-wide">
                {q.difficulty}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              className="w-full h-32 bg-[#111] border border-[#222] rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={e => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  submitAnswer();
                }
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 font-medium">Press Cmd/Ctrl + Enter to submit</span>
              <button 
                onClick={submitAnswer} 
                className="btn-primary"
                disabled={!currentAnswer.trim()}
              >
                {currentQ + 1 === questions.length ? 'Finish Interview' : 'Next Question'} →
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'results') {
      return (
        <div className="p-8 animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-8 border-b border-[#222] pb-6">
            <div className="w-10 h-10 bg-emerald-500/15 rounded flex items-center justify-center text-emerald-500">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-white">Interview Complete</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <div className="flex justify-between items-end mb-3">
                  <h3 className="font-bold text-gray-400 uppercase tracking-widest text-sm">Overall Score</h3>
                  <span className="text-4xl font-extrabold text-indigo-400">{results.overallScore}%</span>
                </div>
                <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${results.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Smaller score cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">Technical</div>
                  <div className="text-2xl font-bold text-white">{results.technicalScore}%</div>
                </div>
                <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">Comms</div>
                  <div className="text-2xl font-bold text-white">{results.communicationScore}%</div>
                </div>
                <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">Confidence</div>
                  <div className="text-2xl font-bold text-white">{results.confidenceScore}%</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center">
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {results.strengths.map((str: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center">
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {results.improvements.map((imp: string, i: number) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-red-500 font-bold mt-0.5">✗</span> {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-[#222]">
                <button onClick={() => setPhase('idle')} className="btn-ghost flex-1">Try Again</button>
                <button className="btn-primary flex-1">Add to Roadmap →</button>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 h-full flex flex-col justify-center">
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#222222" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Radar dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="mt-8">
      <div className="card w-full overflow-hidden transition-all duration-300">
        {renderContent()}
      </div>
    </div>
  );
}
