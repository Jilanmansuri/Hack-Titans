import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isOpen: boolean;
  stage: number; // 0 to 3 corresponding to the 4 stages
}

const stages = [
  "📄 Parsing your resume...",
  "🧠 Extracting skills with AI...",
  "🎯 Analyzing skill gaps...",
  "🗺️ Building your roadmap..."
];

export default function LoadingOverlay({ isOpen, stage }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/95 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-[400px] card flex flex-col items-center py-8"
          >
            <div className="relative mb-8">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>

            <div className="w-full px-6 space-y-4">
              {stages.map((text, index) => {
                const isActive = stage === index;
                const isComplete = stage > index;
                
                return (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      {isComplete ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check className="w-5 h-5 text-emerald-500" />
                        </motion.div>
                      ) : isActive ? (
                        <motion.div 
                          animate={{ opacity: [0.5, 1, 0.5] }} 
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-2 h-2 rounded-full bg-indigo-500"
                        />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#333]" />
                      )}
                    </div>
                    <span 
                      className={`text-sm font-medium ${isComplete ? 'text-emerald-500' : isActive ? 'text-white' : 'text-gray-600'}`}
                    >
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full px-6 mt-8">
              <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((stage + 1) / stages.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
