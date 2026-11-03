import React, { useState } from 'react';
import { X, Download, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface PdfViewerModalProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  pdfUrl,
  title,
  onClose,
}) => {
  const [viewerType, setViewerType] = useState<'proxy' | 'classx' | 'google'>('proxy');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. In-App Backend Proxy (Bypasses CORS restrictions)
  const proxyUrl = `/api/proxy-pdf?url=${encodeURIComponent(pdfUrl)}`;

  // 2. ClassX / TeachX native web PDF viewer
  const classxViewerUrl = `https://pdfweb.classx.co.in/pdfjs-latest/web/viewer.html?file=${encodeURIComponent(
    pdfUrl
  )}`;

  // 3. Google Docs Embed Viewer
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    pdfUrl
  )}&embedded=true`;

  const getEffectiveSrc = () => {
    switch (viewerType) {
      case 'proxy':
        return proxyUrl;
      case 'classx':
        return classxViewerUrl;
      case 'google':
        return googleViewerUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-[92vh] bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full p-[1px] bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
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
            </div>
            <div className="min-w-0">
              <h3 className="text-slate-900 font-extrabold text-sm sm:text-base truncate font-syne">
                {title || 'Lecture PDF Notes'}
              </h3>
              <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                VOID MULTIVERSE • Notes Document
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Viewer Engine Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 text-xs">
              <button
                onClick={() => {
                  setViewerType('proxy');
                  setIsLoading(true);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  viewerType === 'proxy'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                In-App
              </button>
              <button
                onClick={() => {
                  setViewerType('classx');
                  setIsLoading(true);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  viewerType === 'classx'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Web Viewer
              </button>
              <button
                onClick={() => {
                  setViewerType('google');
                  setIsLoading(true);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  viewerType === 'google'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Google Docs
              </button>
            </div>

            {/* Download / Open External Link */}
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Frame Body */}
        <div className="relative flex-1 w-full bg-slate-100 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/90">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
              <p className="text-slate-800 text-sm font-bold">Loading PDF Document...</p>
              <p className="text-slate-500 text-xs mt-1">Connecting to Study Server</p>
            </div>
          )}

          <iframe
            src={getEffectiveSrc()}
            className="w-full h-full border-0 bg-white"
            onLoad={() => setIsLoading(false)}
            title={title}
          />
        </div>

        {/* Footer info & Fallback */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-sm">Void Multiverse Document Hub</span>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">Not loading?</span>
            <button
              onClick={() => {
                setViewerType(viewerType === 'proxy' ? 'classx' : 'proxy');
                setIsLoading(true);
              }}
              className="text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer text-xs flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Switch Engine</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
