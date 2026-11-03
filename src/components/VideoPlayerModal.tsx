import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Settings,
  Tv,
} from 'lucide-react';
import { VideoLecture, DownloadLink } from '../types';

interface VideoPlayerModalProps {
  video: VideoLecture;
  allVideos: VideoLecture[];
  currentIndex: number;
  onClose: () => void;
  onSelectVideo: (video: VideoLecture, index: number) => void;
  onOpenPdf?: (pdfUrl: string, title: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  allVideos,
  currentIndex,
  onClose,
  onSelectVideo,
  onOpenPdf,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [selectedQuality, setSelectedQuality] = useState<string>('Auto');
  const [streamError, setStreamError] = useState<string | null>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);

  // Available stream options
  const downloadLinks: DownloadLink[] = video.download_links || [];
  const primaryStream =
    (downloadLinks.find((l: DownloadLink) => l.quality === '480p') ||
      downloadLinks[0] ||
      {}).path ||
    video.download_link ||
    video.file_link ||
    '';

  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>(primaryStream);

  // When video prop changes, re-initialize
  useEffect(() => {
    const defaultStream =
      (video.download_links && video.download_links.length > 0
        ? (video.download_links.find((l: DownloadLink) => l.quality === '480p') || video.download_links[0]).path
        : '') ||
      video.download_link ||
      video.file_link ||
      '';

    setCurrentStreamUrl(defaultStream);
    setStreamError(null);
  }, [video]);

  // HLS stream loader
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !currentStreamUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isM3u8 = currentStreamUrl.includes('.m3u8');

    if (isM3u8 && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(currentStreamUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStreamError(null);
        videoEl.play().catch(() => {
          // Autoplay policy prevented
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setStreamError('Playback error on this stream. Try switching quality or opening in StudyBee player.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl') || !isM3u8) {
      // Native iOS or direct MP4
      videoEl.src = currentStreamUrl;
      videoEl.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStreamUrl]);

  // Video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(duration || 99999, videoRef.current.currentTime + seconds)
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const handleQualitySelect = (quality: string, url: string) => {
    setSelectedQuality(quality);
    setCurrentStreamUrl(url);
    setShowQualityMenu(false);
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
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // StudyBee direct player link
  const studyBeePlayerUrl = `https://studybeepro.site/player.html?url=${encodeURIComponent(
    currentStreamUrl
  )}&title=${encodeURIComponent(video.Title)}`;

  const pdfUrl = video.pdf_link2 || video.pdf_link;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        ref={containerRef}
        className="w-full max-w-4xl bg-[#0e0716] border border-purple-500/20 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-950/60 to-black/60 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <h2 className="text-white font-extrabold text-sm sm:text-base truncate font-syne">
              {video.Title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Open in StudyBee Site Player */}
            <a
              href={studyBeePlayerUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open with StudyBee.site native player"
              className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">StudyBee Player</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Screen Area */}
        <div
          className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden"
          onMouseEnter={() => setShowControls(true)}
          onMouseMove={() => setShowControls(true)}
        >
          <video
            ref={videoRef}
            src={currentStreamUrl || '/sample-video.mp4'}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
            onError={(e) => {
              e.preventDefault();
              const target = e.currentTarget;
              if (target.src && !target.src.endsWith('/sample-video.mp4')) {
                target.src = '/sample-video.mp4';
                target.load();
                target.play().catch(() => {});
              } else {
                setStreamError('Unable to load video stream. You can open in StudyBee player.');
              }
            }}
            playsInline
          >
            <source src={currentStreamUrl || '/sample-video.mp4'} type="video/mp4" />
          </video>

          {/* Stream Error Alert */}
          {streamError && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20">
              <p className="text-amber-300 text-sm font-semibold mb-3 max-w-md">
                {streamError}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <a
                  href={studyBeePlayerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open in StudyBee Player
                </a>
                <button
                  onClick={() => {
                    setStreamError(null);
                    if (videoRef.current) videoRef.current.load();
                  }}
                  className="bg-white/10 hover:bg-white/20 text-stone-200 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Retry Stream
                </button>
              </div>
            </div>
          )}

          {/* Big Center Play/Pause button when paused */}
          {!isPlaying && !streamError && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.7)] hover:scale-110 transition-transform">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-1" />
              </div>
            </div>
          )}

          {/* Player Controls Bar */}
          <div
            className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-4 flex flex-col gap-2 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Progress Slider */}
            <div className="w-full flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-2 transition-all"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between text-xs sm:text-sm text-stone-200">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 flex items-center justify-center hover:text-purple-400 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                </button>

                {/* Rewind 10s */}
                <button
                  onClick={() => seekRelative(-10)}
                  title="Rewind 10s"
                  className="hover:text-purple-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Forward 10s */}
                <button
                  onClick={() => seekRelative(10)}
                  title="Forward 10s"
                  className="hover:text-purple-400 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1.5">
                  <button onClick={toggleMute} className="hover:text-purple-400">
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      setIsMuted(v === 0);
                      if (videoRef.current) {
                        videoRef.current.volume = v;
                        videoRef.current.muted = v === 0;
                      }
                    }}
                    className="w-14 sm:w-18 h-1 bg-white/20 rounded-lg appearance-none accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Time Display */}
                <span className="text-[11px] sm:text-xs font-mono text-stone-400 select-none">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Settings (Speed, Quality, Fullscreen) */}
              <div className="flex items-center gap-2 sm:gap-3 relative">
                {/* Speed Menu Toggle */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSpeedMenu(!showSpeedMenu);
                      setShowQualityMenu(false);
                    }}
                    className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
                  >
                    {playbackRate}x
                  </button>
                  {showSpeedMenu && (
                    <div className="absolute bottom-9 right-0 bg-[#160c22] border border-purple-500/30 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 min-w-[70px] z-30">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedChange(s)}
                          className={`px-2 py-1 text-xs rounded text-left ${
                            playbackRate === s
                              ? 'bg-purple-600 text-white font-bold'
                              : 'text-stone-300 hover:bg-white/10'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quality Menu Toggle */}
                {downloadLinks.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowQualityMenu(!showQualityMenu);
                        setShowSpeedMenu(false);
                      }}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      <span>{selectedQuality}</span>
                    </button>
                    {showQualityMenu && (
                      <div className="absolute bottom-9 right-0 bg-[#160c22] border border-purple-500/30 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 min-w-[90px] z-30">
                        {downloadLinks.map((link: DownloadLink, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleQualitySelect(link.quality, link.path)}
                            className={`px-2 py-1 text-xs rounded text-left ${
                              selectedQuality === link.quality
                                ? 'bg-purple-600 text-white font-bold'
                                : 'text-stone-300 hover:bg-white/10'
                            }`}
                          >
                            {link.quality}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 flex items-center justify-center hover:text-purple-400 transition-colors"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details & Lecture Switcher */}
        <div className="p-3.5 sm:p-5 bg-[#0a0410] flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-purple-500/15">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Prev Video Button */}
            <button
              disabled={currentIndex <= 0}
              onClick={() => {
                if (currentIndex > 0) {
                  onSelectVideo(allVideos[currentIndex - 1], currentIndex - 1);
                }
              }}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-stone-200 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Next Video Button */}
            <button
              disabled={currentIndex >= allVideos.length - 1}
              onClick={() => {
                if (currentIndex < allVideos.length - 1) {
                  onSelectVideo(allVideos[currentIndex + 1], currentIndex + 1);
                }
              }}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-200 hover:bg-purple-600/50 hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick PDF Button if available */}
          {pdfUrl && onOpenPdf && (
            <button
              onClick={() => onOpenPdf(pdfUrl, video.Title)}
              className="w-full sm:w-auto bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 px-4 py-2 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all"
            >
              <span>View Lecture PDF Notes</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
