import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SkillStrength = 'strong' | 'weak' | 'missing' | 'neutral';

interface SkillPillProps {
  skill: string;
  strength?: SkillStrength;
  className?: string;
}

export default function SkillPill({ skill, strength = 'neutral', className }: SkillPillProps) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full label-tag transition-all duration-150 hover:scale-105';
  
  const strengthClasses = {
    strong: 'bg-[#10B981]/15 text-[#10B981]',
    weak: 'bg-[#F59E0B]/15 text-[#F59E0B]',
    missing: 'bg-[#EF4444]/15 text-[#EF4444]',
    neutral: 'bg-[#222222] text-[#F9FAFB]',
  };

  return (
    <span 
      className={cn(baseClasses, strengthClasses[strength], className)}
      title={skill}
    >
      {skill}
    </span>
  );
}
