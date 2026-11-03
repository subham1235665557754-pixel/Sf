import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Batch, BreadcrumbNav, FolderItem } from './types';
import { fetchBatches, fetchStudyBeeFolderContents, fetchStudyBeeVideoDetails } from './services/api';
import {
  isPassActive,
  verifyPassOnLoad,
} from './services/passService';
import {
  COURSE_141_ROOT_ITEMS,
  COURSE_141_HOME_ITEMS,
  COURSE_141_ENGLISH_ITEMS,
  COURSE_141_BIRTH_ITEMS,
} from './services/courseData';
import { SfNavbar } from './components/SfNavbar';
import { SfBatchCard } from './components/SfBatchCard';
import { SfFolderCard } from './components/SfFolderCard';
import { SfVideoCard } from './components/SfVideoCard';
import { SfPlayerScreen } from './components/SfPlayerScreen';
import { SfLoginModal } from './components/SfLoginModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { AccessPassModal } from './components/AccessPassModal';
import { SkeletonLoader } from './components/SkeletonLoader';
import {
  Sparkles,
  Heart,
  Search,
  Share2,
  Check,
  FolderOpen,
  ChevronRight,
  RefreshCw,
  X,
  Lock,
} from 'lucide-react';

export default function App() {
  // App views: 'batches' (homepage) | 'content' (course folder explorer) | 'player' (full video screen)
  const [currentPage, setCurrentPage] = useState<'batches' | 'content' | 'player'>('batches');

  // Batches state
  const [batches, setBatches] = useState<Batch[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'wishlist'>('new');
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('studybee_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  // Current selected batch
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Folder navigation hierarchy (starts with parent_id: '-1' matching StudyBee API)
  const [navStack, setNavStack] = useState<BreadcrumbNav[]>([
    { id: '-1', title: 'Batch Content' },
  ]);

  // Dynamically fetched folder contents from StudyBee API
  const [liveFolderItems, setLiveFolderItems] = useState<FolderItem[]>([]);
  const [isFolderLoading, setIsFolderLoading] = useState<boolean>(false);

  // Current video playing
  const [activeVideo, setActiveVideo] = useState<FolderItem | null>(null);

  // PDF modal state
  const [activePdf, setActivePdf] = useState<{ url: string; title: string } | null>(null);

  // 24-Hour Access Pass Modal State
  const [showPassModal, setShowPassModal] = useState<boolean>(false);
  const [passModalReason, setPassModalReason] = useState<'video' | 'notes' | 'manual'>('manual');

  // Auth modal
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [, setCurrentUser] = useState<{ name: string; phone: string; token: string } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('studybee_user') || 'null');
    } catch {
      return null;
    }
  });

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Loading
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Verify 24-hour pass token on page load if returning from AROLinks shortlink
  useEffect(() => {
    const res = verifyPassOnLoad();
    if (res.verified) {
      showToast(res.message);
    } else if (res.message) {
      showToast(res.message);
    }
  }, []);

  // 2. Auto-lock interval: monitor pass expiration
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // If currently in player or viewing PDF and pass expired, close and require pass
      if ((currentPage === 'player' || activePdf) && !isPassActive()) {
        if (currentPage === 'player') setCurrentPage('content');
        if (activePdf) setActivePdf(null);
        setPassModalReason('video');
        setShowPassModal(true);
        showToast('Your 24-Hour Access Pass has expired. Please regenerate your key.');
      }
    }, 15000);

    return () => clearInterval(checkInterval);
  }, [currentPage, activePdf]);

  // 3. Fetch live batches from /api/batches
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await fetchBatches();
        if (list && list.length > 0) {
          setBatches(list);
        }
      } catch (err) {
        console.warn('Error loading batches:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Toggle Enrollment / Wishlist via Heart button
  const handleToggleEnroll = (batchId: string | number) => {
    const sId = String(batchId);
    let updated: string[];
    if (wishlist.includes(sId)) {
      updated = wishlist.filter((id) => id !== sId);
      showToast('Removed from your enrolled batches');
    } else {
      updated = [...wishlist, sId];
      showToast('Added to your enrolled batches! ❤️');
    }
    setWishlist(updated);
    localStorage.setItem('studybee_wishlist', JSON.stringify(updated));
  };

  // Click on "START LEARNING" button on batch card
  const handleStudyBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setNavStack([{ id: '-1', title: batch.title || 'Batch Content' }]);
    setSearchQuery('');
    setCurrentPage('content');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Fetch live folder contents dynamically from StudyBee API
  const loadFolderContents = useCallback(async (courseId: string | number, parentId: string | number) => {
    setIsFolderLoading(true);
    try {
      const items = await fetchStudyBeeFolderContents(courseId, parentId);
      if (items && items.length > 0) {
        setLiveFolderItems(items);
        setIsFolderLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Live folder fetch error:', err);
    }

    // Fallback logic for Course 141 or offline cached data
    const sParent = String(parentId);
    if (sParent === '-1' || sParent === 'root') {
      setLiveFolderItems(COURSE_141_ROOT_ITEMS);
    } else if (sParent === '33937' || sParent === 'folder_home') {
      setLiveFolderItems(COURSE_141_HOME_ITEMS);
    } else if (sParent === '73675' || sParent === 'folder_english') {
      setLiveFolderItems(COURSE_141_ENGLISH_ITEMS);
    } else if (sParent === '75414' || sParent === 'folder_birth') {
      setLiveFolderItems(COURSE_141_BIRTH_ITEMS);
    } else {
      setLiveFolderItems([]);
    }
    setIsFolderLoading(false);
  }, []);

  useEffect(() => {
    if (currentPage === 'content' && selectedBatch) {
      const currentFolder = navStack[navStack.length - 1];
      const parentId = currentFolder ? currentFolder.id : '-1';
      loadFolderContents(selectedBatch.id, parentId);
    }
  }, [currentPage, selectedBatch, navStack, loadFolderContents]);

  // Folder navigation click
  const handleFolderClick = (item: FolderItem) => {
    setNavStack((prev) => [...prev, { id: item.id, title: item.Title || item.title || 'Folder' }]);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Jump directly to a breadcrumb
  const handleJumpBreadcrumb = (index: number) => {
    setNavStack((prev) => prev.slice(0, index + 1));
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back button handling
  const handleGoBack = () => {
    if (currentPage === 'player') {
      setCurrentPage('content');
      return;
    }

    if (currentPage === 'content') {
      if (navStack.length > 1) {
        setNavStack((prev) => prev.slice(0, prev.length - 1));
      } else {
        setCurrentPage('batches');
      }
    }
  };

  // Play Video click with 24-Hour Access Pass verification
  const handlePlayVideo = async (item: FolderItem) => {
    // Check if pass active
    if (!isPassActive()) {
      setPassModalReason('video');
      setShowPassModal(true);
      return;
    }

    setActiveVideo(item);
    setCurrentPage('player');
    if (selectedBatch) {
      fetchStudyBeeVideoDetails(selectedBatch.id, item.id).catch(() => {});
    }
  };

  // PDF Notes click with 24-Hour Access Pass verification
  const handleOpenPdf = (url: string, title: string) => {
    // Check if pass active
    if (!isPassActive()) {
      setPassModalReason('notes');
      setShowPassModal(true);
      return;
    }

    setActivePdf({ url, title });
  };

  // Share batch link
  const handleShareBatch = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Course link copied to clipboard!');
  };

  // Filtered batches for homepage
  const displayedBatches = useMemo(() => {
    let list = batches;
    if (activeTab === 'wishlist') {
      list = batches.filter((b) => wishlist.includes(String(b.id)));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || String(b.id).includes(q));
    }
    return list;
  }, [batches, activeTab, wishlist, searchQuery]);

  // Filtered current folder items
  const displayedFolderItems = useMemo(() => {
    if (!searchQuery.trim()) return liveFolderItems;
    const q = searchQuery.toLowerCase().trim();
    return liveFolderItems.filter((item) =>
      (item.Title || item.title || '').toLowerCase().includes(q)
    );
  }, [liveFolderItems, searchQuery]);

  return (
    <div className="min-h-screen relative flex flex-col font-sans page-bg select-none">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm border backdrop-blur-xl shadow-2xl bg-slate-900/95 border-slate-800 text-white"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAVBAR (White Theme with 24h Access Key) */}
      {currentPage !== 'player' && (
        <SfNavbar
          showBack={currentPage === 'content'}
          onBack={handleGoBack}
          onGoHome={() => setCurrentPage('batches')}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenAccessPass={() => {
            setPassModalReason('manual');
            setShowPassModal(true);
          }}
          wishlistCount={wishlist.length}
          onToggleWishlistTab={() => {
            if (currentPage !== 'batches') setCurrentPage('batches');
            setActiveTab(activeTab === 'wishlist' ? 'new' : 'wishlist');
          }}
          isWishlistActive={currentPage === 'batches' && activeTab === 'wishlist'}
        />
      )}

      {/* PAGE 1: BATCHES HOMEPAGE */}
      {currentPage === 'batches' && (
        <main className="flex-1 w-full max-w-[90rem] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 relative z-10 pb-16">
          {/* Header & Controls Tabs with White Theme */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto hide-scroll w-full md:w-auto p-1 bg-slate-200/70 backdrop-blur-md rounded-2xl border border-slate-300/60 shadow-xs">
              {/* Latest Batches Tab */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab('new');
                  setSearchQuery('');
                }}
                className={`tab-btn shrink-0 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                  activeTab === 'new'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200 font-extrabold'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Latest Batches</span>
                <span className="bg-blue-50 text-blue-600 ml-1 px-2 py-0.5 rounded-md text-[10px] font-black border border-blue-200">
                  {batches.length || 46}
                </span>
              </motion.button>

              {/* Enrolled Tab with Heart Icon */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActiveTab('wishlist');
                  setSearchQuery('');
                }}
                className={`tab-btn shrink-0 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                  activeTab === 'wishlist'
                    ? 'bg-white text-rose-600 shadow-sm border border-slate-200 font-extrabold'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                  }`}
                />
                <span>Enrolled Batches</span>
                {wishlist.length > 0 && (
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                    {wishlist.length}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Access Pass banner / quick unlock teaser */}
            <div
              onClick={() => {
                setPassModalReason('manual');
                setShowPassModal(true);
              }}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold cursor-pointer hover:bg-blue-100 transition-all shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>24-Hour Access Pass System (AROLinks API Connected)</span>
            </div>
          </div>

          {/* Search Batches Input */}
          <div className="relative mb-7 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search batches by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400/30 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Batches Grid with Full-Width START LEARNING Button & Top-Right Heart Icon */}
          {isLoading ? (
            <SkeletonLoader type="videos" count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedBatches.map((batch) => (
                <SfBatchCard
                  key={batch.id}
                  batch={batch}
                  isEnrolled={wishlist.includes(String(batch.id))}
                  onToggleEnroll={handleToggleEnroll}
                  onStudy={handleStudyBatch}
                />
              ))}

              {displayedBatches.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center bg-white rounded-3xl border border-slate-200 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-3">
                    <FolderOpen className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-slate-800 font-bold text-base font-syne">
                    {activeTab === 'wishlist' ? 'No enrolled batches yet' : 'No batches found'}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {activeTab === 'wishlist'
                      ? 'Click the heart icon on any batch to add it here!'
                      : 'Try another search keyword'}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* PAGE 2: BATCH CONTENT VIEW */}
      {currentPage === 'content' && selectedBatch && (
        <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-7 relative z-10 pb-20 flex flex-col gap-5">
          {/* Hero Card for Batch in White Theme */}
          <div className="w-full rounded-[24px] bg-white border border-slate-200 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
              <div className="w-20 sm:w-28 aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-xs">
                <img
                  src={selectedBatch.thumbnail}
                  alt={selectedBatch.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-md font-syne flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                    BATCH
                  </span>
                </div>
                <h2 className="text-slate-900 font-black text-sm sm:text-lg leading-snug line-clamp-2 font-syne">
                  {selectedBatch.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={handleShareBatch}
                    className="w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => {
                      const currentFolder = navStack[navStack.length - 1];
                      loadFolderContents(selectedBatch.id, currentFolder?.id || '-1');
                      showToast('Content synced with API');
                    }}
                    className="w-fit flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition-all cursor-pointer"
                    title="Refresh latest folders and lectures"
                  >
                    <RefreshCw className="w-3 h-3 text-blue-600" />
                    <span>Sync</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Heart toggle on header */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => handleToggleEnroll(selectedBatch.id)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                wishlist.includes(String(selectedBatch.id))
                  ? 'bg-rose-50 border border-rose-300 text-rose-500 shadow-sm'
                  : 'bg-slate-100 border border-slate-200 text-slate-400 hover:text-rose-500'
              }`}
              title="Toggle Enrollment"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlist.includes(String(selectedBatch.id)) ? 'fill-rose-500' : ''
                }`}
              />
            </motion.button>
          </div>

          {/* Dynamic Breadcrumbs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll py-1 text-xs sm:text-sm font-bold text-slate-500 whitespace-nowrap">
            {navStack.map((crumb, idx) => {
              const isLast = idx === navStack.length - 1;
              return (
                <div key={crumb.id + '_' + idx} className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleJumpBreadcrumb(idx)}
                    className={`transition-colors cursor-pointer truncate max-w-[200px] sm:max-w-[280px] ${
                      isLast
                        ? 'text-blue-600 font-black pointer-events-none'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {idx === 0 ? selectedBatch.title : crumb.title}
                  </button>
                  {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Search bar inside content */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search folders or lectures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-xs"
            />
          </div>

          {/* Folder & Lecture List */}
          {isFolderLoading ? (
            <SkeletonLoader type="folders" count={5} />
          ) : (
            <div className="flex flex-col gap-3.5">
              {displayedFolderItems.map((item) =>
                item.material_type === 'VIDEO' ? (
                  <SfVideoCard
                    key={item.id}
                    video={item}
                    onWatch={handlePlayVideo}
                    onOpenPdf={(url, title) => handleOpenPdf(url, title)}
                  />
                ) : (
                  <SfFolderCard
                    key={item.id}
                    item={item}
                    onClick={() => handleFolderClick(item)}
                  />
                )
              )}

              {displayedFolderItems.length === 0 && (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center bg-white rounded-2xl border border-slate-200">
                  <FolderOpen className="w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 font-syne">This folder is empty</p>
                  <p className="text-xs text-slate-400 mt-1">No lectures or sub-folders found here.</p>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* PAGE 3: FULLSCREEN VIDEO PLAYER */}
      {currentPage === 'player' && activeVideo && (
        <SfPlayerScreen
          video={activeVideo}
          courseId={selectedBatch?.id || 141}
          onBack={handleGoBack}
          onOpenPdf={(url, title) => handleOpenPdf(url, title)}
        />
      )}

      {/* 24-HOUR ACCESS PASS MODAL (Matches user screenshot) */}
      <AccessPassModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        reason={passModalReason}
        onPassActivated={() => {
          setShowPassModal(false);
          showToast('Aapka 24-Ghante ka Pass activate ho gaya hai!');
        }}
      />

      {/* PDF Notes Viewer Modal */}
      <AnimatePresence>
        {activePdf && (
          <PdfViewerModal
            pdfUrl={activePdf.url}
            title={activePdf.title}
            onClose={() => setActivePdf(null)}
          />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <SfLoginModal
            onClose={() => setShowLoginModal(false)}
            onSuccess={(u) => {
              setCurrentUser(u);
              showToast(`Welcome back, ${u.name || 'Scholar'}!`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
