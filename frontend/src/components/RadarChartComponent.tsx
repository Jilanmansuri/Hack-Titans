import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarDataPoint {
  subject: string;
  A: number; // Your score (0-100)
  B: number; // Required score (0-100)
  fullMark: number;
}

export default function RadarChartComponent({ data }: { data: RadarDataPoint[] }) {
  // Add animation prop on mount by using key which forces re-render if data changes
  return (
    <div className="w-full h-[300px] bg-[#0A0A0A] rounded-xl relative p-4 border border-[#222]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          {/* No grid lines requested, but PolarGrid without radials looks clean, we set stroke transparent */}
          <PolarGrid stroke="#222" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }} 
            itemStyle={{ color: '#fff' }}
          />
          <Radar name="Required" dataKey="B" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.15} isAnimationActive={true} />
          <Radar name="Your Skills" dataKey="A" stroke="#6366F1" fill="#6366F1" fillOpacity={0.4} isAnimationActive={true} />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#6366F1] rounded opacity-80" />
          <span className="text-xs text-gray-400 font-semibold">Your Skills</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-[#06B6D4] rounded bg-[#06B6D4]/20" />
          <span className="text-xs text-gray-400 font-semibold">Required</span>
        </div>
      </div>
    </div>
  );
}
