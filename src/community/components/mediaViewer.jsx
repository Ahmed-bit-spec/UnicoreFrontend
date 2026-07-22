// MediaViewer — fullscreen lightbox for post media (images + videos)
// Used by MediaGallery. Renders in a portal-style fixed overlay so it works
// the same whether triggered from the feed card or the post detail page.
//
// Features: prev/next buttons, keyboard nav (←/→/Esc/Space), swipe on
// mobile, click-to-zoom on images, play/pause on videos, download button,
// "n of total" index, and a dark backdrop that never navigates the app away
// from the feed.

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, Play, Pause } from "lucide-react";
import { resolveMediaUrl } from "../ui";

const MediaViewer = ({ media = [], startIndex = 0, onClose, canDownload = true }) => {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const current = media[index];
  const total = media.length;

  const goTo = useCallback(
    (i) => {
      setZoomed(false);
      setPlaying(true);
      setIndex((prev) => {
        const next = ((i % total) + total) % total;
        return next;
      });
    },
    [total]
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      else if (e.key === "ArrowLeft" && total > 1) goPrev();
      else if (e.key === "ArrowRight" && total > 1) goNext();
      else if (e.key === " " && current?.type === "video") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goPrev, goNext, current, onClose]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  // Swipe support (mobile)
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && total > 1) goPrev();
      else if (dx < 0 && total > 1) goNext();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!current) return null;
  const url = resolveMediaUrl(current.url);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3.5 text-white/90 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-[13px] font-semibold tabular-nums text-white/70">
          {total > 1 ? `${index + 1} of ${total}` : null}
        </span>
        <div className="flex items-center gap-1.5">
          {current.type === "image" && (
            <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              onClick={() => setZoomed((z) => !z)}
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 flex items-center justify-center transition-colors"
            >
              {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
            </button>
          )}
          {current.type === "video" && (
            <button
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
              className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
          {canDownload && (
            <a
              href={url}
              download={current.name || true}
              onClick={(e) => e.stopPropagation()}
              aria-label="Download"
              className="w-9 h-9 rounded-full bg-white dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 flex items-center justify-center transition-colors"
            >
              <Download size={16} />
            </a>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main stage */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-2 sm:px-4">
        {total > 1 && (
          <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Previous"
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 text-white items-center justify-center transition-colors z-10"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="w-full h-full flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {current.type === "image" ? (
            <img
              src={url}
              alt=""
              onDoubleClick={() => setZoomed((z) => !z)}
              className={`select-none transition-transform duration-200 ease-out cursor-zoom-in ${
                zoomed ? "max-w-none max-h-none scale-150 cursor-zoom-out" : "max-w-full max-h-[85vh] object-contain"
              }`}
              onClick={() => setZoomed((z) => !z)}
            />
          ) : (
            <video
              ref={videoRef}
              src={url}
              className="max-w-full max-h-[85vh]"
              controls
              autoPlay
              playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          )}
        </div>

        {total > 1 && (
          <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Next"
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-900/10 hover:bg-white dark:bg-gray-900/20 text-white items-center justify-center transition-colors z-10"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Mobile prev/next strip */}
      {total > 1 && (
        <div className="flex sm:hidden items-center justify-center gap-8 pb-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={goPrev} aria-label="Previous" className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goNext} aria-label="Next" className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group">
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Thumbnail strip */}
      {total > 1 && (
        <div
          className="hidden sm:flex items-center justify-center gap-2 pb-4 px-4 flex-shrink-0 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {media.map((m, i) => (
            <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              key={i}
              onClick={() => goTo(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                i === index ? "border-[#58CC02]" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {m.type === "image" ? (
                <img src={resolveMediaUrl(m.url)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white/70">
                  <Play size={14} />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaViewer;