import React from 'react';

interface SkeletonLoaderProps {
  type: 'folders' | 'videos';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 4 }) => {
  return (
    <div className="w-full flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) =>
        type === 'folders' ? (
          <div
            key={i}
            className="w-full h-18 sm:h-20 rounded-[20px] bg-[#120f18]/80 border border-amber-500/10 p-4 flex items-center justify-between gap-4 skeleton-shimmer"
          >
            <div className="flex items-center gap-3.5 flex-1">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 bg-amber-500/15 rounded w-2/3" />
                <div className="h-3 bg-amber-500/10 rounded w-1/3" />
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500/10" />
          </div>
        ) : (
          <div
            key={i}
            className="w-full rounded-[22px] bg-[#120f18]/80 border border-amber-500/10 p-4 flex flex-col gap-3 skeleton-shimmer"
          >
            <div className="w-full aspect-video rounded-xl bg-amber-500/10" />
            <div className="h-4 bg-amber-500/15 rounded w-3/4 mt-1" />
            <div className="h-3 bg-amber-500/10 rounded w-1/2" />
            <div className="pt-2 border-t border-amber-500/10">
              <div className="h-10 w-full bg-amber-500/15 rounded-xl" />
            </div>
          </div>
        )
      )}
    </div>
  );
};
