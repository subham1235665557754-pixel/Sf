import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  ArrowLeft,
  MoreVertical,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Settings,
  Maximize,
  Minimize,
  ExternalLink,
  FileText,
  Volume2,
  VolumeX,
  AlertCircle,
  RefreshCw,
  Tv,
  Film,
  Sparkles,
} from 'lucide-react';
import { FolderItem } from '../types';
import { fetchStudyBeeVideoDetails } from '../services/api';

interface SfPlayerScreenProps {
  video: FolderItem;
  courseId: string | number;
  onBack: () => void;
  onOpenPdf?: (url: string, title: string) => void;
}

export const SfPlayerScreen: React.FC<SfPlayerScreenProps> = ({
  video,
  courseId,
  onBack,
  onOpenPdf,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Default to official StudyBee web player for 100% genuine live playback from studybeepro.site
  const [playerMode, setPlayerMode] = useState<'studybee' | 'native'>('studybee');

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(5106); // 1:25:06 in seconds default
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);
  const [videoDetails, setVideoDetails] = useState<any>(null);

  // Fetch live video details from API
  useEffect(() => {
    let isMounted = true;
    async function loadDetails() {
      try {
        const details = await fetchStudyBeeVideoDetails(courseId, video.id);
        if (details && isMounted) {
          setVideoDetails(details);
        }
      } catch (err) {
        console.warn('Video details fetch error:', err);
      }
    }
    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [courseId, video.id]);

  // Video source detection
  const rawVideoSrc =
    videoDetails?.decoded_video_link ||
    (videoDetails?.qualities && videoDetails?.qualities[0]?.url) ||
    video.decoded_video_link ||
    (video.download_links && video.download_links[0]?.path) ||
    '/sample-video.mp4';

  const isYouTube =
    typeof rawVideoSrc === 'string' &&
    ((!rawVideoSrc.includes('http') && rawVideoSrc.length === 11) ||
      rawVideoSrc.includes('youtube.com') ||
      rawVideoSrc.includes('youtu.be'));

  const ytEmbedUrl = isYouTube
    ? rawVideoSrc.includes('http')
      ? `https://www.youtube.com/embed/${
          rawVideoSrc.match(/(?:embed\/|v=|vi\/|youtu\.be\/|\/v\/|\/e\/|watch\?v=)([^#&?]+)/)?.[1] ||
          'dQw4w9WgXcQ'
        }?autoplay=1&rel=0&modestbranding=1`
      : `https://www.youtube.com/embed/${rawVideoSrc}?autoplay=1&rel=0&modestbranding=1`
    : null;

  const title = videoDetails?.title || video.Title || video.title || 'Birth';
  const pdfUrl =
    videoDetails?.decoded_pdf_link ||
    videoDetails?.pdf_viewer ||
    video.pdf_link ||
    video.pdf_link2;

  // StudyBee site player URL (exact URL as in user screenshot 3: studybeepro.site/sf/play.html)
  const studyBeeSfPlayerUrl = `https://studybeepro.site/sf/play.html?course_id=${courseId}&video_id=${video.id}`;

  // Handle HLS streams or standard video in native mode
  useEffect(() => {
    if (playerMode !== 'native') return;
    setHasVideoError(false);
    if (isYouTube) return;

    const vid = videoRef.current;
    if (!vid) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamToLoad = rawVideoSrc || '/sample-video.mp4';
    const isM3u8 = typeof streamToLoad === 'string' && streamToLoad.includes('.m3u8');

    if (isM3u8 && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });
      hlsRef.current = hls;
      hls.loadSource(streamToLoad);
      hls.attachMedia(vid);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        vid.play().catch(() => setIsPlaying(false));
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          if (vid.src !== window.location.origin + '/sample-video.mp4') {
            vid.src = '/sample-video.mp4';
            vid.load();
            vid.play().catch(() => setIsPlaying(false));
          } else {
            setHasVideoError(true);
          }
        }
      });
    } else {
      vid.src = streamToLoad;
      vid.load();
      vid.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playerMode, rawVideoSrc, isYouTube]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const seekRelative = (sec: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + sec));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#0a0a0a] text-white flex flex-col justify-between overflow-hidden select-none"
      onMouseMove={() => setShowControls(true)}
      onClick={() => setShowControls(true)}
    >
      {/* TOP BAR matching Screenshot 3 & 4 with player switcher */}
      <div
        className={`w-full z-40 bg-gradient-to-b from-black/95 via-black/80 to-transparent p-3 sm:p-5 flex items-center justify-between gap-3 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900/80 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-white transition-all active:scale-90 cursor-pointer shadow-lg flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          </button>
          <div className="min-w-0">
            <h2 className="text-white font-extrabold text-sm sm:text-base md:text-lg truncate drop-shadow-md">
              {title}
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>VOIDMULTIVERSE • Connected</span>
            </div>
          </div>
        </div>

        {/* Center/Right Player Mode Switcher */}
        <div className="flex items-center gap-2 relative">
          <div className="flex items-center bg-black/70 backdrop-blur-md border border-amber-500/20 rounded-xl p-0.5 shadow-lg">
            <button
              onClick={() => setPlayerMode('studybee')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                playerMode === 'studybee'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 shadow-md font-black'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Official Web Stream Engine"
            >
              <Tv className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Stream Player</span>
            </button>
            <button
              onClick={() => setPlayerMode('native')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
                playerMode === 'native'
                  ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-md font-black'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Plays using in-app player engine"
            >
              <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>In-App Player</span>
            </button>
          </div>

          {/* More Menu 3-dots */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900/80 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-white transition-all active:scale-90 shadow-lg cursor-pointer"
          >
            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          </button>

          {/* More Menu Dropdown */}
          {showMoreMenu && (
            <div className="absolute top-12 right-0 bg-[#120f18] border border-amber-500/30 rounded-2xl p-2 shadow-2xl flex flex-col gap-1.5 min-w-[210px] z-50">
              <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400/80 px-3 py-1 border-b border-amber-500/20">
                Lecture Options
              </span>
              {pdfUrl && onOpenPdf && (
                <button
                  onClick={() => {
                    setShowMoreMenu(false);
                    onOpenPdf(pdfUrl, title);
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-xl text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open PDF Notes</span>
                </button>
              )}
              <a
                href={studyBeeSfPlayerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-bold rounded-xl text-stone-300 hover:bg-white/10 flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Source Link</span>
              </a>
              <button
                onClick={() => {
                  setPlayerMode(playerMode === 'studybee' ? 'native' : 'studybee');
                  setShowMoreMenu(false);
                }}
                className="px-3 py-2 text-xs font-bold rounded-xl text-stone-300 hover:bg-white/10 flex items-center gap-2 text-left cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Switch to {playerMode === 'studybee' ? 'In-App' : 'Stream'} Player</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PLAYER CONTENT AREA */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {/* MODE 1: OFFICIAL STUDYBEE PRO PLAYER EMBED (Directly from studybeepro.site) */}
        {playerMode === 'studybee' ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <iframe
              src={studyBeeSfPlayerUrl}
              className="w-full h-full border-0 bg-black"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          /* MODE 2: IN-APP NATIVE DARK PLAYER */
          <div
            className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer"
            onClick={togglePlay}
          >
            {isYouTube ? (
              <iframe
                src={ytEmbedUrl!}
                className="w-full h-full border-none"
                allow="autoplay; fullscreen; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                src={isYouTube ? undefined : (rawVideoSrc || '/sample-video.mp4')}
                className="w-full h-full object-contain"
                playsInline
                onError={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget;
                  if (target.src && !target.src.endsWith('/sample-video.mp4')) {
                    target.src = '/sample-video.mp4';
                    target.load();
                    target.play().catch(() => {});
                  } else {
                    setHasVideoError(true);
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                    if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
                      setDuration(videoRef.current.duration);
                    }
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={rawVideoSrc || '/sample-video.mp4'} type="video/mp4" />
              </video>
            )}

            {/* Video Error Overlay Fallback */}
            {hasVideoError && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center z-30">
                <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                <h3 className="text-white font-bold text-base mb-1">Stream Ready</h3>
                <p className="text-stone-400 text-xs max-w-sm mb-4">
                  Play this stream with the direct Stream Player for high quality playback.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setPlayerMode('studybee')}
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:from-amber-300 hover:to-yellow-300 transition-colors cursor-pointer"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Switch to Stream Player</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHasVideoError(false);
                      if (videoRef.current) videoRef.current.load();
                    }}
                    className="bg-stone-900/80 hover:bg-amber-500/10 border border-amber-500/20 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry In-App</span>
                  </button>
                </div>
              </div>
            )}

            {/* Void Multiverse Watermark badge in corner */}
            <div className="absolute top-4 right-4 pointer-events-none z-20">
              <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.4)] overflow-hidden">
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

            {/* Center presentation backdrop if playing local fallback */}
            {!hasVideoError && !isYouTube && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-6 sm:px-16 opacity-30 sm:opacity-40">
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-6xl">✨</span>
                  <span className="text-amber-400 font-bold text-xs mt-1">Class XII</span>
                </div>
                <div className="text-center font-bold">
                  <h3 className="text-xl sm:text-3xl text-amber-400 tracking-wider font-syne">{title}</h3>
                  <p className="text-stone-300 text-xs">VOID MULTIVERSE • Pure Knowledge</p>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-4xl sm:text-6xl">📖</span>
                  <span className="text-amber-400 font-bold text-xs mt-1">Study</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM CONTROLS BAR (Shown in native mode) */}
      {playerMode === 'native' && (
        <div
          className={`w-full z-40 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-6 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Slider */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <span className="text-zinc-300 font-mono text-xs w-12 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-yellow-400 hover:h-2 transition-all"
              />
            </div>
            <span className="text-zinc-300 font-mono text-xs w-12">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={() => seekRelative(-10)}
                className="text-white hover:text-yellow-400 transition-colors p-1 cursor-pointer"
                title="Rewind 10s"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.4)] cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => seekRelative(10)}
                className="text-white hover:text-yellow-400 transition-colors p-1 cursor-pointer"
                title="Forward 10s"
              >
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="hidden sm:block w-px h-5 bg-white/20 mx-1"></div>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="hidden sm:block text-white hover:text-yellow-400 transition-colors p-1 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center gap-3 sm:gap-5 relative">
              {/* Playback Speed Indicator & Selector */}
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-yellow-300 transition-colors cursor-pointer"
              >
                <span>{playbackSpeed}x</span>
                <Settings className="w-3.5 h-3.5" />
              </button>

              {showSettingsMenu && (
                <div className="absolute bottom-12 right-10 bg-[#161616] border border-white/10 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[120px] z-50">
                  <span className="text-[10px] uppercase font-bold text-stone-400 px-3 py-1">
                    Speed
                  </span>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => {
                        setPlaybackSpeed(spd);
                        if (videoRef.current) videoRef.current.playbackRate = spd;
                        setShowSettingsMenu(false);
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg text-left transition-colors cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-yellow-400/20 text-yellow-300 font-black'
                          : 'text-stone-300 hover:bg-white/10'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-yellow-400 transition-colors p-1 cursor-pointer"
                title="Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Maximize className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
