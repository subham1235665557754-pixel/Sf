import React from 'react';
import { ArrowRight, Heart, Sparkles, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { Batch } from '../types';

interface SfBatchCardProps {
  batch: Batch;
  isEnrolled: boolean;
  onToggleEnroll: (batchId: string | number) => void;
  onStudy: (batch: Batch) => void;
}

export const SfBatchCard: React.FC<SfBatchCardProps> = ({
  batch,
  isEnrolled,
  onToggleEnroll,
  onStudy,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-white rounded-[22px] overflow-hidden group flex flex-col relative select-none border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all"
    >
      {/* Thumbnail Area */}
      <div
        onClick={() => onStudy(batch)}
        className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={batch.thumbnail}
          alt={batch.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://appx-content-v2.classx.co.in/paid_course3/2025-10-25-0_14983521030015323.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

        {/* BATCH Tag on top left */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-slate-200 px-2.5 py-1 rounded-lg z-10 shadow-xs flex items-center gap-1.5">
          <Sparkles className="w-2.5 h-2.5 text-blue-600" />
          <span className="text-slate-800 text-[10px] font-black tracking-widest uppercase font-syne">
            BATCH
          </span>
        </div>

        {/* Heart Shape Enrollment Button in the Top-Right Corner */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleEnroll(batch.id);
          }}
          title={isEnrolled ? 'Enrolled (Click to remove)' : 'Click heart to Enroll'}
          className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shadow-md ${
            isEnrolled
              ? 'bg-rose-50 border border-rose-300 shadow-rose-200'
              : 'bg-white/90 border border-slate-200 hover:bg-white hover:border-rose-300'
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isEnrolled
                ? 'fill-rose-500 text-rose-500 drop-shadow-xs'
                : 'text-slate-400 hover:text-rose-500'
            }`}
          />
        </motion.button>
      </div>

      {/* Details & Full-Width START LEARNING Button */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <h3
            onClick={() => onStudy(batch)}
            className="text-slate-900 font-extrabold text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
            title={batch.title}
          >
            {batch.title}
          </h3>

          {/* Quick Enrolled status indicator if active */}
          {isEnrolled && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-rose-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>Enrolled in My Batches</span>
            </div>
          )}
        </div>

        {/* Full-width START LEARNING Button across the line as requested */}
        <div className="pt-2 border-t border-slate-100">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStudy(batch)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-[13px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all cursor-pointer font-syne"
          >
            <GraduationCap className="w-4 h-4 stroke-[2.5]" />
            <span>START LEARNING</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
