import React, { useEffect, useState } from 'react';
import { AnalysisStep, AnalysisStepStatus } from '../types';
import { CheckCircle2, Circle, Loader2, Terminal } from 'lucide-react';

interface AnalysisStepsProps {
  currentStepIndex: number;
}

const STEPS: Omit<AnalysisStep, 'status'>[] = [
  { id: 'ingestion', label: 'Design Ingestion', description: 'Parsing image structure and metadata...' },
  { id: 'layout', label: 'Layout & Component Detection', description: 'Identifying grid systems and element boundaries...' },
  { id: 'semantic', label: 'Semantic Classification', description: 'Analyzing color theory and typography hierarchy...' },
  { id: 'critique', label: 'Natural Language Critique', description: 'Generating professional feedback...' },
];

export const AnalysisSteps: React.FC<AnalysisStepsProps> = ({ currentStepIndex }) => {
  const [logs, setLogs] = useState<string[]>([]);

  // Simulate console logs for the active step
  useEffect(() => {
    if (currentStepIndex === 1) { // Layout phase logs
      setLogs([]);
      const timeouts = [
        setTimeout(() => setLogs(p => [...p, '> init_layout_engine(v2.4)']), 500),
        setTimeout(() => setLogs(p => [...p, '> scanning layer: "Hero_Section"']), 1200),
        setTimeout(() => setLogs(p => [...p, '> found: button.primary (confidence: 98%)']), 2000),
        setTimeout(() => setLogs(p => [...p, '> analyzing spacing tokens...']), 2800),
      ];
      return () => timeouts.forEach(clearTimeout);
    } else if (currentStepIndex === 2) { // Semantic phase logs
      setLogs([]);
      const timeouts = [
        setTimeout(() => setLogs(p => [...p, '> extracting_palette()']), 300),
        setTimeout(() => setLogs(p => [...p, '> contrast_ratio: 4.5:1 (PASS)']), 1100),
        setTimeout(() => setLogs(p => [...p, '> font_family: "Inter" detected']), 1800),
      ];
      return () => timeouts.forEach(clearTimeout);
    } else {
      setLogs([]);
    }
  }, [currentStepIndex]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 h-full">
      <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 font-display">
        Analysis Pipeline
      </h3>
      <div className="flex flex-col space-y-0">
        {STEPS.map((step, index) => {
          let status: AnalysisStepStatus = 'pending';
          if (index < currentStepIndex) status = 'completed';
          else if (index === currentStepIndex) status = 'active';

          const isLast = index === STEPS.length - 1;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Icon Column */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300
                  ${status === 'completed' ? 'bg-green-100 border-green-100 text-green-600' : ''}
                  ${status === 'active' ? 'bg-blue-50 border-blue-500 text-blue-600' : ''}
                  ${status === 'pending' ? 'bg-white border-gray-200 text-gray-300' : ''}
                `}>
                  {status === 'completed' && <CheckCircle2 size={16} />}
                  {status === 'active' && <Loader2 size={16} className="animate-spin" />}
                  {status === 'pending' && <Circle size={16} />}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[60px] my-1 transition-colors duration-500 ${
                    status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                  }`} />
                )}
              </div>

              {/* Content Column */}
              <div className={`flex-1 pb-8 pt-1 ${status === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-base font-semibold ${status === 'active' ? 'text-blue-600' : 'text-gray-900'}`}>
                    {step.label}
                  </h4>
                  {status === 'active' && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 animate-pulse">
                      In Progress
                    </span>
                  )}
                  {status === 'completed' && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{step.description}</p>
                
                {/* Console Output for Active Step */}
                {status === 'active' && logs.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-900 rounded-md shadow-inner overflow-hidden font-mono text-xs text-green-400">
                    <div className="flex flex-col gap-1">
                      {logs.map((log, i) => (
                        <span key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
                          {log}
                        </span>
                      ))}
                      <span className="animate-pulse opacity-50">_</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};