import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, User, Lock, Unlock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { isPassActive, getPassRemainingSeconds, formatRemainingTime } from '../services/passService';

interface SfNavbarProps {
  showBack?: boolean;
  onBack?: () => void;
  onGoHome?: () => void;
  onOpenLogin: () => void;
  onOpenAccessPass: () => void;
  wishlistCount: number;
  onToggleWishlistTab?: () => void;
  isWishlistActive?: boolean;
}

export const SfNavbar: React.FC<SfNavbarProps> = ({
  showBack,
  onBack,
  onGoHome,
  onOpenLogin,
  onOpenAccessPass,
  wishlistCount,
  onToggleWishlistTab,
  isWishlistActive,
}) => {
  const [passActive, setPassActive] = useState(isPassActive());
  const [remainingTime, setRemainingTime] = useState(
    formatRemainingTime(getPassRemainingSeconds())
  );

  // Poll remaining time for display
  useEffect(() => {
    const update = () => {
      const active = isPassActive();
      setPassActive(active);
      setRemainingTime(formatRemainingTime(getPassRemainingSeconds()));
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="w-full z-40 bg-white/95 backdrop-blur-md h-14 sm:h-[58px] sticky top-0 border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-[90rem] mx-auto px-3 sm:px-5 h-full flex items-center justify-between">
        {/* Left: Back button + Void Multiverse Logo + Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showBack && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              title="Go Back"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-800" />
            </motion.button>
          )}

          <div
            onClick={onGoHome}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
          >
            {/* Ornate Gold Void Multiverse Logo (Compact) */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[1px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 shadow-[0_1px_6px_rgba(245,158,11,0.25)] flex-shrink-0 overflow-hidden ring-1 ring-amber-400/30"
            >
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
            </motion.div>

            {/* Brand Title: VOID MULTIVERSE (Reduced, sleek size) */}
            <div className="flex flex-col justify-center">
              <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-slate-900 flex items-center gap-1 leading-none font-sans">
                <span className="tracking-wide">VOID</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 font-extrabold tracking-wide">
                  MULTIVERSE
                </span>
              </h1>
              <span className="text-[8px] sm:text-[9px] text-amber-700/80 font-medium tracking-wider uppercase mt-0.5 hidden xs:flex items-center gap-1">
                <Sparkles className="w-2 h-2 text-amber-500" />
                Knowledge & Study
              </span>
            </div>
          </div>
        </div>

        {/* Right: 24h Access Key Button (as in user screenshot), Enrolled Heart, Login */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* 24h Access Key Pill Button - compact matching screenshot */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenAccessPass}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-[13px] font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              passActive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'bg-blue-50/90 hover:bg-blue-100 border-blue-300 text-blue-600 hover:border-blue-400'
            }`}
            title="24-Hour Access Key System"
          >
            {passActive ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span className="font-bold text-[11px] sm:text-xs">Pass: {remainingTime}</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                <span className="font-bold text-[11px] sm:text-xs">24h Access Key</span>
              </>
            )}
          </motion.button>

          {/* Enrolled Batches Heart Button */}
          {onToggleWishlistTab && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onToggleWishlistTab}
              title="My Enrolled Batches"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 border rounded-lg text-xs font-semibold transition-all relative flex items-center gap-1.5 cursor-pointer ${
                isWishlistActive
                  ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
                  isWishlistActive || wishlistCount > 0
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-slate-400'
                }`}
              />
              <span className="hidden md:inline text-xs">Enrolled</span>
              {wishlistCount > 0 && (
                <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </motion.button>
          )}

          {/* Login Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenLogin}
            className="text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Login</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
};
