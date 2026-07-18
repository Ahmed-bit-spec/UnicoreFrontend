// components/bookcard.jsx — UniLibrary design system
// Design: green-500 · black · white only (Tailwind)
// All strings via useLanguage hook
// Supports _reason / _reasonLabel metadata from smart recommendations
// Primary CTA now uses the shared "pill-button" 3D style (bg-[#58CC02])

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Heart, Star, Eye, Sparkles, UserCheck, Layers } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

// ── Shared primary-action style ────────────────────────────────────────────────
// Use this exact class string anywhere a "primary" action button appears.
export const PRIMARY_BTN =
  "bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:translate-y-0.5 hover:shadow-[0_2px_0_#46A302] active:translate-y-1 active:shadow-none transition-all duration-150";

// ── Cover gradient fallback ────────────────────────────────────────────────────
const GRADIENTS = [
  ["#000000", "#1a1a1a"],
  ["#052e16", "#14532d"],
  ["#0a0a0a", "#166534"],
  ["#111827", "#064e3b"],
  ["#1c1917", "#14532d"],
  ["#0c0a09", "#052e16"],
  ["#18181b", "#166534"],
  ["#0f172a", "#052e16"],
];

const hashTitle = (title = "") =>
  title.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

// ── Cover image / gradient fallback ───────────────────────────────────────────
const CoverImage = ({ src, title, format }) => {
  const { t } = useLanguage();
  const [error, setError] = useState(false);
  const idx = hashTitle(title) % GRADIENTS.length;
  const [c1, c2] = GRADIENTS[idx];
  const initial = (title || "?")[0].toUpperCase();

  const formatLabel =
    format === "ebook"
      ? (t["book.digital"] ?? "Digital")
      : format === "both"
      ? (t["book.both"] ?? "Digital + Print")
      : (t["book.print"] ?? "Print");

  if (!src || error) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center select-none"
        style={{ background: `linear-gradient(160deg, ${c1}, ${c2})` }}
      >
        <span
          className="text-4xl font-black text-white/90"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.02em" }}
        >
          {initial}
        </span>
        <span className="text-[9px] font-bold mt-2 uppercase tracking-[0.15em] text-green-500/80">
          {formatLabel}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src.startsWith("http") ? src : `${import.meta.env.VITE_API_BASE_URL ?? ""}/${src.replace(/^\//, "")}`}
      alt={title}
      onError={() => setError(true)}
      className="w-full h-full object-cover"
    />
  );
};

// ── Format badge ───────────────────────────────────────────────────────────────
const FormatBadge = ({ format }) => {
  const { t } = useLanguage();

  const cfg = {
    ebook: {
      label: t["book.digital"] ?? "Digital",
      className: "border border-green-500 text-green-500 bg-white",
    },
    physical: {
      label: t["book.print"] ?? "Print",
      className: "border border-black text-black bg-white",
    },
    both: {
      label: t["book.both"] ?? "Digital + Print",
      className: "border border-green-500 text-green-500 bg-white",
    },
  }[format] ?? {
    label: t["book.print"] ?? "Print",
    className: "border border-black text-black bg-white",
  };

  return (
    <span className={`text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// ── Reason badge (why this was recommended) ───────────────────────────────────
const ReasonBadge = ({ reason, reasonLabel }) => {
  if (!reason || reason === "popular") return null;

  const configs = {
    new_arrival: {
      icon: Sparkles,
      className: "bg-green-500 text-white",
    },
    same_author: {
      icon: UserCheck,
      className: "bg-black text-white",
    },
    related_topic: {
      icon: Layers,
      className: "bg-black text-white",
    },
  };

  const cfg = configs[reason];
  if (!cfg) return null;
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${cfg.className}`}>
      <Icon size={8} />
      {reasonLabel}
    </span>
  );
};

// ── Main BookCard ──────────────────────────────────────────────────────────────
const BookCard = ({ book, isSaved, onToggleSave, size = "md" }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [favAnim, setFavAnim] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleFav = (e) => {
    e.stopPropagation();
    setFavAnim(true);
    onToggleSave(book._id);
    setTimeout(() => setFavAnim(false), 500);
  };

  const handleRead = (e) => {
    e.stopPropagation();
    navigate(`/e-library/reader/${book._id}`);
  };

  const canRead = book.format === "ebook" || book.format === "both";
  const coverH = size === "sm" ? "160px" : "190px";
  const isTrending = book.borrowCount > 10;

  return (
    <div
      onClick={() => navigate(`/e-library/reader/${book._id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex flex-col rounded-xl overflow-hidden cursor-pointer bg-white
        transition-all duration-200 ease-out
        ${hovered
          ? "border-2 border-green-500 shadow-lg shadow-green-500/10 -translate-y-0.5"
          : "border border-gray-200 shadow-sm"
        }
      `}
    >
      {/* ── Cover ── */}
      <div style={{ position: "relative", height: coverH, flexShrink: 0, overflow: "hidden" }}>
        <CoverImage src={book.coverImage} title={book.title} format={book.format} />

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
            hovered ? "bg-black/30" : "bg-transparent pointer-events-none"
          }`}
        >
          {hovered && canRead && (
            <div className="flex items-center gap-1.5 bg-white text-green-500 px-3 py-2 rounded-full text-xs font-bold shadow-lg scale-105 border border-green-500">
              <Eye size={13} />
              {t["book.read"] ?? "Read Now"}
            </div>
          )}
        </div>

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <FormatBadge format={book.format} />
          {isTrending && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black text-white uppercase tracking-wide">
              {t["book.trending"] ?? "Trending"}
            </span>
          )}
          {book._reason && (
            <ReasonBadge reason={book._reason} reasonLabel={book._reasonLabel} />
          )}
        </div>

        {/* Floating save button */}
        <button
          onClick={handleFav}
          className={`
            absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center z-10
            border transition-all duration-200 outline-none
            ${isSaved
              ? "bg-green-500 border-green-500 text-white"
              : "bg-white border-gray-200 text-gray-400"
            }
            ${favAnim ? "scale-125" : "scale-100"}
            ${isSaved || hovered ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
        >
          <Heart size={12} style={{ fill: isSaved ? "currentColor" : "none" }} />
        </button>
      </div>

      {/* ── Metadata ── */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <p
          className={`text-[13px] font-bold leading-snug line-clamp-2 transition-colors duration-150 ${
            hovered ? "text-green-500" : "text-black"
          }`}
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.01em" }}
        >
          {book.title}
        </p>
        <p className="text-[11px] text-gray-400 font-medium truncate">
          {book.author}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-gray-100">
          <div className="flex items-center gap-1">
            <Star size={10} className="text-green-500 fill-green-500" />
            <span className="text-[11px] font-bold text-black">
              {book.rating?.toFixed(1) ?? "—"}
            </span>
          </div>
          {book.category && (
            <span className="text-[10px] text-gray-400 font-medium truncate max-w-[95px]">
              {book.category}
            </span>
          )}
        </div>
      </div>

      {/* ── Action row ── */}
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={handleRead}
          disabled={!canRead}
          className={`
            flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
            text-xs font-bold outline-none
            ${canRead
              ? `${PRIMARY_BTN} cursor-pointer`
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          <BookOpen size={11} />
          {canRead
            ? (t["book.read"] ?? "Read Online")
            : (t["book.physical"] ?? "Print Only")}
        </button>

        <button
          onClick={handleFav}
          className={`
            w-8 rounded-xl flex items-center justify-center transition-all duration-150 outline-none border
            ${isSaved
              ? "bg-green-500 border-green-500 text-white"
              : "bg-white border-gray-200 text-gray-400 hover:border-green-500 hover:text-green-500"
            }
          `}
        >
          <Heart size={12} style={{ fill: isSaved ? "currentColor" : "none" }} />
        </button>
      </div>
    </div>
  );
};

export default BookCard;