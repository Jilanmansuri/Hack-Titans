import { useState } from 'react';
import { cn } from './SkillPill';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

interface RoadmapStep {
  step: number;
  skill: string;
  phase: string;
  weekStart: number;
  weekEnd: number;
  description: string;
  whyLearnThis: string;
  resource: string;
  dependencies: string[];
}

export default function Timeline({ steps }: { steps: RoadmapStep[] }) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggleComplete = (stepId: number) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const toggleExpand = (stepId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const phases = [...new Set(steps.map(s => s.phase))];

  return (
    <div className="w-full relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Personalized Roadmap</h2>
        <div className="text-sm font-semibold text-indigo-400">
          {completed.size} of {steps.length} steps complete
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[#222] rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300" 
          style={{ width: `${(completed.size / steps.length) * 100}%` }}
        />
      </div>

      <div className="relative border-l border-[#333] ml-[15px] space-y-12 pb-8">
        {phases.map(phaseName => {
          const phaseSteps = steps.filter(s => s.phase === phaseName);
          const weeksList = phaseSteps.flatMap(s => [s.weekStart, s.weekEnd]);
          const minW = Math.min(...weeksList);
          const maxW = Math.max(...weeksList);
          
          return (
            <div key={phaseName} className="relative">
              <div className="absolute -left-[50px] bg-[#0A0A0A] px-2 py-1 flex items-center justify-center -top-6 w-full max-w-[calc(100%+50px)]">
                <div className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                  ━━━━━━━━ {phaseName} (Weeks {minW}-{maxW}) ━━━━━━━━
                </div>
              </div>

              <div className="space-y-6 mt-10">
                {phaseSteps.map((step) => {
                  const isDone = completed.has(step.step);
                  const isExpanded = expanded.has(step.step);

                  let circleColor = 'border-indigo-500 bg-[#0A0A0A]';
                  if (phaseName === 'Basics') circleColor = 'border-emerald-500 bg-[#0A0A0A]';
                  if (phaseName === 'Intermediate') circleColor = 'border-amber-500 bg-[#0A0A0A]';

                  return (
                    <div 
                      key={step.step}
                      className={cn(
                        "relative pl-8 transition-all duration-300",
                        isDone ? "opacity-40" : ""
                      )}
                    >
                      <div 
                        className={cn(
                          "absolute -left-[16px] top-1 w-[31px] h-[31px] rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10",
                          isDone ? "bg-emerald-500 border-emerald-500 scale-110" : circleColor
                        )}
                        onClick={() => toggleComplete(step.step)}
                      >
                        {isDone ? <Check className="w-4 h-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-current opacity-50 block" />}
                      </div>

                      <div 
                        className="card hover:border-l-[#6366F1] hover:border-l-[3px] transition-all duration-200 overflow-hidden"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                              Week {step.weekStart} - {step.weekEnd}
                            </span>
                            <h3 className={cn("text-lg font-bold mt-1", isDone ? "line-through" : "text-white")}>
                              {step.skill}
                            </h3>
                          </div>
                          <button 
                            onClick={() => toggleComplete(step.step)}
                            className="btn-ghost py-1.5 px-3 text-xs"
                          >
                            Mark as complete
                          </button>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                          {step.description}
                        </p>

                        <div className="bg-[#0A0A0A] -mx-6 -mb-6 px-6 py-3 border-t border-[#222]">
                          <button 
                            onClick={() => toggleExpand(step.step)}
                            className="flex items-center justify-between w-full text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                          >
                            Why learn this?
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="mt-3 text-sm text-gray-400 space-y-3 pb-3">
                              <p>{step.whyLearnThis}</p>
                              {step.dependencies.length > 0 && (
                                <p className="text-amber-500/80">
                                  <strong>Prerequisites:</strong> {step.dependencies.join(', ')}
                                </p>
                              )}
                              <a 
                                href="#" 
                                className="inline-block mt-2 px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded text-xs font-bold uppercase tracking-wide border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                              >
                                Recommended: {step.resource}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
