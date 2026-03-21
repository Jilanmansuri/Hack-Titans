import type { ReactNode } from 'react';
import { cn } from './SkillPill';
import { Code, Layout, Server, BarChart3 } from 'lucide-react';

interface RoleCardProps {
  role: string;
  selected: boolean;
  onClick: () => void;
  skills: string[];
}

const roleIcons: Record<string, ReactNode> = {
  'Full Stack Developer': <Code className="w-6 h-6 mb-3 text-indigo-400" />,
  'Frontend Developer': <Layout className="w-6 h-6 mb-3 text-pink-400" />,
  'Backend Developer': <Server className="w-6 h-6 mb-3 text-emerald-400" />,
  'Data Analyst': <BarChart3 className="w-6 h-6 mb-3 text-cyan-400" />
};

export default function RoleCard({ role, selected, onClick, skills }: RoleCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        'card cursor-pointer transition-all duration-150 hover:-translate-y-[2px]',
        selected ? 'border-indigo-500 border-l-[4px] bg-[#1a1a1a]' : 'hover:border-[#6366F1]/50'
      )}
    >
      {roleIcons[role] || <Code className="w-6 h-6 mb-3 text-indigo-400" />}
      <h3 className="text-lg font-bold mb-2">{role}</h3>
      <ul className="text-sm text-gray-400 space-y-1 mt-3">
        {skills.map(s => (
          <li key={s} className="flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#333] mr-2"></span>
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
