import React, { useState } from 'react';
import { X, Search, Check, Layers, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Batch } from '../types';

interface BatchSelectorModalProps {
  batches: Batch[];
  selectedBatchId: string | number;
  onSelectBatch: (batch: Batch) => void;
  onClose: () => void;
}

export const BatchSelectorModal: React.FC<BatchSelectorModalProps> = ({
  batches,
  selectedBatchId,
  onSelectBatch,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customCourseId, setCustomCourseId] = useState('');

  const filtered = batches.filter((b) =>
    (b.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = customCourseId.trim();
    if (id) {
      onSelectBatch({
        id,
        title: `Course Batch #${id}`,
        thumbnail:
          'https://appx-content-v2.classx.co.in/paid_course3/2026-09-16-0.6407783334322323.jpeg',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#0e0b14] border border-amber-500/25 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between gap-3 bg-gradient-to-r from-stone-950 via-[#16121f] to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center overflow-hidden flex-shrink-0">
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
            <div>
              <h2 className="text-white font-extrabold text-base sm:text-lg font-syne">
                Select Study Batch
              </h2>
              <p className="text-amber-400/80 text-xs font-medium">VOID MULTIVERSE • Course Hub</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-amber-500/10">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-900/90 border border-amber-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Batch List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {filtered.map((b) => {
            const isSelected = String(b.id) === String(selectedBatchId);
            return (
              <div
                key={b.id}
                onClick={() => {
                  onSelectBatch(b);
                  onClose();
                }}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400/60 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-stone-900/60 border-white/5 hover:border-amber-500/30 text-stone-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-8 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                    <img src={b.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold truncate">{b.title}</p>
                    <p className="text-[10px] text-amber-400/80 font-mono">ID: {b.id}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Direct ID Switcher */}
        <form onSubmit={handleCustomSubmit} className="p-4 border-t border-amber-500/10 bg-stone-950/80 flex gap-2">
          <input
            type="text"
            placeholder="Or enter any Course ID (e.g. 141, 364)..."
            value={customCourseId}
            onChange={(e) => setCustomCourseId(e.target.value)}
            className="flex-1 bg-stone-900 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer font-syne"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
