import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  Zap,
  Clock,
  Loader2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  isPassActive,
  getPassRemainingSeconds,
  formatRemainingTime,
  generate24HourPassLink,
} from '../services/passService';

interface AccessPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassActivated?: () => void;
  reason?: 'video' | 'notes' | 'manual';
}

export const AccessPassModal: React.FC<AccessPassModalProps> = ({
  isOpen,
  onClose,
  reason = 'manual',
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [passActive, setPassActive] = useState(isPassActive());
  const [remainingSecs, setRemainingSecs] = useState(getPassRemainingSeconds());

  // Keep countdown updated every second if open
  useEffect(() => {
    if (!isOpen) return;

    setPassActive(isPassActive());
    setRemainingSecs(getPassRemainingSeconds());

    const interval = setInterval(() => {
      const active = isPassActive();
      setPassActive(active);
      setRemainingSecs(getPassRemainingSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleGenerateKey = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const shortUrl = await generate24HourPassLink();
      if (shortUrl) {
        // Redirect user to the shortened AROLinks verification URL
        window.location.href = shortUrl;
      } else {
        throw new Error('Could not generate verification link');
      }
    } catch (err: any) {
      console.error('Key generation error:', err);
      setErrorMsg('Failed to connect to AROLinks. Please try again in a moment.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-[26px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden border border-slate-200/90 z-10"
        >
          {/* Top Decorative Rainbow/Gradient Accent Line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 via-purple-500 to-amber-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer z-20"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          <div className="p-6 sm:p-8 pt-7 flex flex-col items-center text-center">
            {/* Center Logo with Overlapping Blue Key Badge */}
            <div className="relative mb-3.5">
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-lg shadow-amber-500/20 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="VOID MULTIVERSE"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/assets/aistudio/Screenshot_20261101-085341_667dd419.png';
                  }}
                />
              </div>

              {/* Blue Key Badge overlapping corner */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pill: VOIDMULTIVERSE PASS */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-black uppercase tracking-wider mb-2 shadow-xs">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>VOIDMULTIVERSE PASS</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight mb-2 font-syne">
              24-Hour Access Key
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-sm mb-5">
              {reason === 'video'
                ? 'Unlock full HD access to watch all video lectures and playlist content for 24 hours.'
                : reason === 'notes'
                ? 'Unlock instant viewing & downloading for all batch notes and study PDFs for 24 hours.'
                : 'Get instant, uninterrupted access to all video lectures, playlists, and study notes for 24 hours.'}
            </p>

            {/* Active Pass Status Notice (If currently active) */}
            {passActive ? (
              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 text-left flex items-start gap-3 shadow-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-extrabold text-emerald-900">
                    Your 24-Hour Pass is Active!
                  </div>
                  <div className="text-[12px] text-emerald-700 mt-0.5">
                    Time remaining:{' '}
                    <span className="font-black text-emerald-900 font-mono text-sm ml-1">
                      {formatRemainingTime(remainingSecs)}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-600 mt-1">
                    All lectures and notes are completely unlocked for you.
                  </p>
                </div>
              </div>
            ) : (
              /* 3 Simple Steps Container */
              <div className="w-full bg-blue-50/60 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-5 text-left">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>3 Simple Steps to Unlock:</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      1
                    </span>
                    <span className="leading-snug">
                      Click the <strong className="text-blue-900">‘Generate 24-Hour Key’</strong>{' '}
                      button below.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      2
                    </span>
                    <span className="leading-snug">
                      Complete the verification page on AROLinks (takes ~15 seconds).
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                      3
                    </span>
                    <span className="leading-snug">
                      You will be automatically redirected back with full 24-Hour unlocked access!
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium text-left">
                {errorMsg}
              </div>
            )}

            {/* Action Button: GENERATE 24-HOUR KEY */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateKey}
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(37,99,235,0.32)] transition-all cursor-pointer ${
                loading
                  ? 'bg-blue-400 text-white cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-[0_10px_28px_rgba(37,99,235,0.45)]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to AROLinks...</span>
                </>
              ) : passActive ? (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>RE-GENERATE 24-HOUR KEY</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>GENERATE 24-HOUR KEY</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                </>
              )}
            </motion.button>

            {/* Trust Footer Badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-5 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-1 text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure & Safe</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-amber-600">
                <Zap className="w-3.5 h-3.5" />
                <span>Instant 24h Unlock</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-blue-600">
                <Clock className="w-3.5 h-3.5" />
                <span>100% Free</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
