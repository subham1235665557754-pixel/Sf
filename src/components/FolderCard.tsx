import React from 'react';
import { ArrowUpRight, ChevronRight, Folder } from 'lucide-react';

interface FolderCardProps {
  title: string;
  subtitle?: string;
  iconUrl?: string;
  itemCount?: string;
  onClick: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  title,
  subtitle = 'Tap to explore',
  iconUrl,
  itemCount,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="premium-card rounded-[20px] p-4 sm:p-4.5 cursor-pointer flex items-center justify-between gap-3.5 group select-none relative overflow-hidden"
    >
      {/* Ambient hover light */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Left: Icon */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-900/30 border border-purple-500/25 flex items-center justify-center flex-shrink-0 group-hover:border-purple-400/50 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all overflow-hidden p-1">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt=""
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                // Fallback to Folder icon if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 fill-purple-400/20 group-hover:text-purple-300 transition-colors" />
          )}
        </div>

        {/* Text */}
        <div className="min-w-0 flex flex-col justify-center">
          <h3 className="text-[14px] sm:text-[15px] font-bold text-stone-100 group-hover:text-purple-300 transition-colors truncate">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-stone-400 group-hover:text-purple-400 transition-colors mt-0.5">
            <span>{subtitle}</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            {itemCount && (
              <span className="ml-2 text-stone-500 text-[10px]">({itemCount})</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Round Top-Right Arrow button matching screenshot */}
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-all shadow-inner">
        <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-purple-300 transition-colors" />
      </div>
    </div>
  );
};
