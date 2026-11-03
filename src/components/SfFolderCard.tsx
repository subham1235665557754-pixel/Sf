import React from 'react';
import { ChevronRight, Folder, BookOpen, Calculator, FlaskConical, Languages, Atom } from 'lucide-react';
import { motion } from 'motion/react';
import { FolderItem } from '../types';

interface SfFolderCardProps {
  item: FolderItem;
  onClick: () => void;
}

export const SfFolderCard: React.FC<SfFolderCardProps> = ({ item, onClick }) => {
  // Format count text
  const counts: string[] = [];
  const vCount = Number(item.videos_count || 0);
  const fCount = Number(item.files_count || 0);
  const tCount = Number(item.tests_count || 0);

  if (vCount > 0) counts.push(`${vCount} Video${vCount > 1 ? 's' : ''}`);
  if (fCount > 0) counts.push(`${fCount} PDF${fCount > 1 ? 's' : ''}`);
  if (tCount > 0) counts.push(`${tCount} Test${tCount > 1 ? 's' : ''}`);

  const countText = counts.length > 0 ? counts.join(' • ') : 'Open folder';

  // Render subject icon or standard folder
  const renderIcon = () => {
    switch (item.icon) {
      case 'ebooks':
        return (
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 p-2 text-rose-600 shadow-xs">
            <BookOpen className="w-5 h-5 fill-rose-600/20" />
          </div>
        );
      case 'maths':
        return (
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 p-2 text-amber-600 shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
        );
      case 'chemistry':
        return (
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 p-2 text-emerald-600 shadow-xs">
            <FlaskConical className="w-5 h-5" />
          </div>
        );
      case 'english':
        return (
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0 p-2 text-indigo-600 shadow-xs">
            <Languages className="w-5 h-5" />
          </div>
        );
      case 'physics':
        return (
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center flex-shrink-0 p-2 text-sky-600 shadow-xs">
            <Atom className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 shadow-xs group-hover:border-blue-400 transition-all">
            <Folder className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 fill-blue-600/20 group-hover:text-blue-700 transition-colors" />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="bg-white rounded-[20px] p-3.5 sm:p-4.5 cursor-pointer flex items-center justify-between gap-3.5 group select-none relative border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        {renderIcon()}

        <div className="min-w-0 flex flex-col justify-center">
          <h3 className="text-[14px] sm:text-[16px] font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
            {item.Title || item.title}
          </h3>
          <p className="text-[11px] sm:text-[12px] font-medium text-slate-500 mt-0.5 tracking-wide">
            {countText}
          </p>
        </div>
      </div>

      {/* Right Circular Arrow Button */}
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 group-hover:border-blue-300 transition-all shadow-xs">
        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
      </div>
    </motion.div>
  );
};
