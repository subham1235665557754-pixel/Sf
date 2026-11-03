import React from 'react';
import { BreadcrumbStep } from '../types';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  currentTitle: string;
  badgeText: string;
  historySteps: BreadcrumbStep[];
  onStepClick: (index: number) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentTitle,
  badgeText,
  historySteps,
  onStepClick,
}) => {
  return (
    <div className="w-full flex flex-col gap-2.5 mb-5">
      {/* Upper Navigation Trail (Clickable Breadcrumb History) */}
      {historySteps.length > 1 && (
        <nav className="flex items-center gap-1.5 overflow-x-auto hide-scroll py-1 text-xs text-stone-400 font-medium">
          {historySteps.map((step, idx) => {
            const isLast = idx === historySteps.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-600 flex-shrink-0" />}
                <button
                  onClick={() => onStepClick(idx)}
                  disabled={isLast}
                  className={`flex-shrink-0 truncate max-w-[180px] sm:max-w-xs transition-colors ${
                    isLast
                      ? 'text-purple-300 font-bold pointer-events-none drop-shadow-[0_0_6px_rgba(192,132,252,0.4)]'
                      : 'hover:text-white cursor-pointer'
                  }`}
                >
                  {step.title}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Section Header Banner (Exact design from screenshot) */}
      <div className="w-full rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#140b1e]/70 to-[#12081c]/80 border border-purple-500/20 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] backdrop-blur-md">
        {/* Left: Glowing purple dot + Section title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500 shadow-[0_0_8px_#c084fc]"></span>
          </span>
          <h2 className="text-[14px] sm:text-[16px] font-extrabold text-white truncate tracking-wide">
            {currentTitle}
          </h2>
        </div>

        {/* Right: Badge (e.g. 2 FOLDERS, 5 FOLDERS, 8 LECTURES) */}
        {badgeText && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-purple-900/40 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              {badgeText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
