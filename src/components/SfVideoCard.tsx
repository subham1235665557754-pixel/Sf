import React from 'react';
import { Calendar, Play, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { FolderItem } from '../types';

interface SfVideoCardProps {
  video: FolderItem;
  onWatch: (video: FolderItem) => void;
  onOpenPdf?: (pdfUrl: string, title: string) => void;
}

export const SfVideoCard: React.FC<SfVideoCardProps> = ({ video, onWatch, onOpenPdf }) => {
  const durationText = video.duration || '01:25:00';
  const pdfUrl = video.pdf_link || video.pdf_link2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-[22px] p-3.5 sm:p-5 flex flex-col gap-3.5 group select-none relative border border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md transition-all"
    >
      {/* Video Thumbnail Area */}
      <div
        onClick={() => onWatch(video)}
        className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900 cursor-pointer border border-slate-200 shadow-inner"
      >
        <img
          src={
            video.thumbnail ||
            'https://appx-content-v2.classx.co.in/paid_course3/2025-10-25-0_14983521030015323.jpg'
          }
          alt={video.Title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://appx-content-v2.classx.co.in/paid_course3/2025-10-25-0_14983521030015323.jpg';
          }}
        />

        {/* Center Outline Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full border-2 border-white bg-blue-600/90 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-blue-600 transition-all shadow-[0_4px_16px_rgba(37,99,235,0.4)]"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </motion.div>
        </div>

        {/* Bottom Right Duration Badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[11px] font-mono font-bold shadow-md">
          {durationText}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5">
        <h3
          onClick={() => onWatch(video)}
          className="text-slate-900 font-extrabold text-sm sm:text-[16px] leading-snug group-hover:text-blue-600 transition-colors cursor-pointer"
        >
          {video.Title || video.title}
        </h3>

        {video.date_and_time && (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{video.date_and_time}</span>
          </div>
        )}
      </div>

      {/* Action Row: WATCH button and PDF Notes button */}
      <div className="flex items-center gap-3 pt-2.5 border-t border-slate-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onWatch(video)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_14px_rgba(37,99,235,0.25)] cursor-pointer font-syne"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>WATCH</span>
        </motion.button>

        {pdfUrl && onOpenPdf && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onOpenPdf(pdfUrl, video.Title || video.title || 'Notes')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>PDF Notes</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
