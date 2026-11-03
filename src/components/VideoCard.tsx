import React from 'react';
import { Calendar, Clock, FileText, Play } from 'lucide-react';
import { VideoLecture } from '../types';

interface VideoCardProps {
  video: VideoLecture;
  index: number;
  onPlay: (video: VideoLecture) => void;
  onOpenPdf: (pdfUrl: string, title: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  index,
  onPlay,
  onOpenPdf,
}) => {
  // Format lecture number
  const lectureMatch = video.Title.match(/#(\d+)/);
  const lectureNum = lectureMatch ? `#${lectureMatch[1]}` : `#${index + 1}`;

  // Format duration (seconds to minutes or duration string)
  const formatDurationText = (sec?: number | string) => {
    if (!sec) return '60m';
    const num = typeof sec === 'string' ? parseInt(sec, 10) : sec;
    if (isNaN(num) || num <= 0) return '60m';
    if (num > 300) {
      // It's in seconds
      return `${Math.round(num / 60)}m`;
    }
    // Already in minutes
    return `${num}m`;
  };

  const durationStr = formatDurationText(video.duration_in_secs || video.duration);

  // Determine PDF link (check pdf_link2 first as teachx stores signed URLs there, then pdf_link)
  const pdfUrl = video.pdf_link2 || video.pdf_link;
  const hasPdf = Boolean(pdfUrl && pdfUrl.trim() !== '');

  // Thumbnail fallback
  const thumbUrl =
    video.thumbnail ||
    'https://appx-content-v2.classx.co.in/paid_course3/2026-09-16-0.6407783334322323.jpeg';

  return (
    <div className="premium-card rounded-[22px] p-3.5 sm:p-4.5 flex flex-col gap-3 group relative overflow-hidden">
      {/* Thumbnail Container */}
      <div
        onClick={() => onPlay(video)}
        className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#09050d] cursor-pointer border border-white/5 shadow-inner select-none"
      >
        <img
          src={thumbUrl}
          alt={video.Title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://appx-content-v2.classx.co.in/paid_course3/2026-09-16-0.6407783334322323.jpeg';
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Top-Left Lecture Badge: e.g. #1, #2, #4 matching screenshot */}
        <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md border border-white/20 text-purple-200 px-2.5 py-1 rounded-lg text-xs font-black tracking-wider shadow-md">
          {lectureNum}
        </div>

        {/* Bottom-Right Duration Badge: e.g. 🕒 94m */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur-md border border-white/15 text-stone-200 px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 shadow-lg">
          <Clock className="w-3 h-3 text-purple-400" />
          <span>{durationStr}</span>
        </div>

        {/* Center Hover Play Button Glow */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.8)] scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <h3
          onClick={() => onPlay(video)}
          className="text-stone-100 font-extrabold text-[14px] sm:text-[15px] leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors cursor-pointer"
          title={video.Title}
        >
          {video.Title}
        </h3>

        {/* Date and Time Line: e.g. 01-10-2026 at 08:00 am */}
        {video.date_and_time && (
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-medium">
            <Calendar className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            <span className="truncate">{video.date_and_time}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Row matching screenshots */}
      <div className="flex items-center gap-2.5 pt-1.5 border-t border-white/5">
        {/* PLAY VIDEO Button (Solid Purple Gradient) */}
        <button
          onClick={() => onPlay(video)}
          className="flex-1 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 px-3.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.35)] btn-click-effect transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-white flex-shrink-0" />
          <span>PLAY VIDEO</span>
        </button>

        {/* PDF Button (Amber/Gold border and icon) */}
        {hasPdf ? (
          <button
            onClick={() => onOpenPdf(pdfUrl!, video.Title)}
            title="View & Download PDF Notes"
            className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/35 hover:border-amber-400/60 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(250,204,21,0.15)] btn-click-effect transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>PDF</span>
          </button>
        ) : (
          <button
            disabled
            title="PDF Notes not uploaded yet"
            className="bg-white/5 text-stone-500 border border-white/10 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed"
          >
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            <span>PDF</span>
          </button>
        )}
      </div>
    </div>
  );
};
