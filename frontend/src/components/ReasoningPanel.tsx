import { useEffect, useState } from 'react';
import { MessageSquareWarning, Search, Zap } from 'lucide-react';

interface ReasoningPanelProps {
  reasoningTrace: string;
}

export default function ReasoningPanel({ reasoningTrace }: ReasoningPanelProps) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (index < reasoningTrace.length) {
        setDisplayedText(prev => prev + reasoningTrace.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 15); // Fast typewriter effect
    
    return () => clearInterval(interval);
  }, [reasoningTrace]);

  // Parse lines for the step list below
  const steps = reasoningTrace.split(/(?=\\d+\\.)/g).filter(s => s.trim().length > 0);

  return (
    <div className="space-y-6">
      <div className="card !bg-[#111111] !border-l-[4px] !border-l-[#6366F1]">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          AI Analysis Reasoning
        </h3>
        <p className="text-gray-200 text-sm leading-relaxed font-mono min-h-[100px]">
          {displayedText}
          <span className="animate-pulse ml-1 inline-block w-2 h-4 bg-indigo-500 translate-y-1"></span>
        </p>
      </div>

      <div className="space-y-3 mt-6">
        <h4 className="text-sm font-bold text-gray-400">DETECTION TRACE</h4>
        {steps.map((step, idx) => {
          let Icon = Search;
          let color = "text-indigo-400";
          if (step.toLowerCase().includes('missing') || step.toLowerCase().includes('lack')) {
            Icon = MessageSquareWarning;
            color = "text-amber-500";
          }

          return (
            <div key={idx} className="flex border border-[#222] bg-[#0A0A0A] p-3 rounded-lg text-sm transition-colors hover:bg-[#111]">
              <div className="mr-3 mt-0.5">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-gray-300 flex-1">{step.trim()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
