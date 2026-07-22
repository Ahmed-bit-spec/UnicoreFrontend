// components/bookgrid.jsx — UniLibrary design system
// Responsive dynamic grid for displaying book catalogs
// Design: green-500 · black · white only (Tailwind)
// Supports optional section grouping by recommendation reason

import BookCard from "./bookcard";
import { useLanguage } from "@/hooks/useLanguage";
import { Sparkles, UserCheck, Layers, TrendingUp } from "lucide-react";

// ── Reason section label shown above a group of recommended books ─────────────
const REASON_META = {
  new_arrival:   { icon: Sparkles,   labelKey: "rec.newArrivals",   fallback: "New Arrivals" },
  same_author:   { icon: UserCheck,  labelKey: "rec.sameAuthor",    fallback: "Authors You Like" },
  related_topic: { icon: Layers,     labelKey: "rec.relatedTopics", fallback: "Related Topics" },
  popular:       { icon: TrendingUp, labelKey: "rec.popular",       fallback: "Popular Now" },
};

const SectionLabel = ({ reason }) => {
  const { t } = useLanguage();
  const meta = REASON_META[reason];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="w-5 h-5 rounded-md bg-[#2C2DE0] dark:bg-[#1E1FAA] flex items-center justify-center shrink-0">
        <Icon size={11} className="text-white" />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-black">
        {t[meta.labelKey] ?? meta.fallback}
      </span>
      <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
    </div>
  );
};

// ── Main grid ─────────────────────────────────────────────────────────────────
const BookGrid = ({
  books = [],
  savedBooks = [],
  onToggleSave,
  size = "md",
  cols = "default",
  // If true, group books by their _reason field and show section labels
  groupByReason = false,
}) => {
  const gridClass =
    cols === "recommended"
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
      : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4";

  // If grouping is enabled and books have _reason fields, render by sections
  if (groupByReason && books.some((b) => b._reason)) {
    // Preserve order, group into sections while maintaining first-occurrence order
    const sectionOrder = [];
    const sectionMap = {};

    books.forEach((book) => {
      const key = book._reason ?? "popular";
      if (!sectionMap[key]) {
        sectionMap[key] = [];
        sectionOrder.push(key);
      }
      sectionMap[key].push(book);
    });

    return (
      <div className="flex flex-col gap-6">
        {sectionOrder.map((reason) => (
          <div key={reason}>
            <SectionLabel reason={reason} />
            <div className={gridClass}>
              {sectionMap[reason].map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  isSaved={savedBooks.includes(book._id)}
                  onToggleSave={onToggleSave}
                  size={size}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: flat grid
  return (
    <div className={gridClass}>
      {books.map((book) => (
        <BookCard
          key={book._id}
          book={book}
          isSaved={savedBooks.includes(book._id)}
          onToggleSave={onToggleSave}
          size={size}
        />
      ))}
    </div>
  );
};

export default BookGrid;