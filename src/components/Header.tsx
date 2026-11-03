import React from 'react';
import { ArrowLeft, Home, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  courseTitle: string;
  canGoBack: boolean;
  onGoBack: () => void;
  onGoHome: () => void;
  onOpenBatchPicker: () => void;
  onSync: () => void;
  isSyncing: boolean;
  apiConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  courseTitle,
  canGoBack,
  onGoBack,
  onGoHome,
  onOpenBatchPicker,
  onSync,
  isSyncing,
  apiConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full nav-glass shadow-xl">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-16 sm:h-[74px] flex items-center justify-between gap-2.5">
        {/* Left: Back button + Logo + Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {canGoBack && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onGoBack}
              title="Go Back"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900/80 border border-amber-500/20 text-stone-200 hover:text-white hover:bg-amber-500/10 hover:border-amber-500/50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </motion.button>
          )}

          {/* Void Multiverse Seal Logo */}
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={onOpenBatchPicker}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.35)] flex-shrink-0 cursor-pointer overflow-hidden"
            title="Switch Batch / Courses"
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src="/logo.png"
                alt="VOID MULTIVERSE"
                className="w-full h-full object-cover scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    '/assets/aistudio/Screenshot_20261101-085341_667dd419.png';
                }}
              />
            </div>
          </motion.div>

          {/* Titles: VOIDMULTIVERSE PORTAL / Course Name */}
          <div
            onClick={onOpenBatchPicker}
            className="min-w-0 flex flex-col cursor-pointer group"
            title="Click to view batches"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 font-syne uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400 inline" />
                VOIDMULTIVERSE PORTAL
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
                title={apiConnected ? 'Connected to live StudyBee API' : 'Cached mode'}
              />
            </div>
            <h1 className="text-[14px] sm:text-[17px] font-black text-white font-syne truncate group-hover:text-amber-300 transition-colors tracking-tight">
              {courseTitle || 'Batch Course Lectures'}
            </h1>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Batches Switcher Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenBatchPicker}
            title="All Batches"
            className="h-9 px-2.5 sm:px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 hover:bg-amber-500/20 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Batches</span>
          </motion.button>

          {/* Sync / Refresh Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSync}
            disabled={isSyncing}
            title="Sync with live studybeepro API"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900/80 border border-amber-500/20 text-stone-300 hover:text-white hover:bg-amber-500/10 hover:border-amber-500/50 flex items-center justify-center transition-all cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-300 ${
                isSyncing ? 'animate-spin text-amber-400' : ''
              }`}
            />
          </motion.button>

          {/* Home Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onGoHome}
            title="Go to Batches Home"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900/80 border border-amber-500/20 text-stone-300 hover:text-white hover:bg-amber-500/10 hover:border-amber-500/50 flex items-center justify-center transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-stone-300 hover:text-amber-300" />
          </motion.button>
        </div>
      </div>
    </header>
  );
};
