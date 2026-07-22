// student/components/DashboardComponents/MainContentArea.jsx
// The deeper dashboard content: recommended books, activity history,
// recently viewed books, and a "best VIP seats" teaser.
// All copy comes from t.mainContent — add the block at the bottom of
// this file to en.js / so.js.
//
// NOTE: This ships with placeholder queries commented out. Wire up
// `getRecommendedBooks`, `getRecentActivity`, `getRecentlyViewed`, and
// `getVipSeats` from your existing @/api modules — the shapes used
// below (title/author/cover, label/time, seatNumber/zone) match what
// SeatsGrid.jsx and the books pages already use, so this should slot
// straight in once those calls exist.

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock3, History, Crown, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const SectionHeader = ({ title, href, seeAll }) => (
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-black text-gray-900 dark:text-white">{title}</h3>
    {href && (
      <Link
        to={href}
        className="flex items-center gap-1 text-[11px] font-bold text-[#1E1FAA] dark:text-[#4F51FF] dark:text-[#4F51FF] hover:gap-1.5 transition-all"
      >
        {seeAll} <ArrowRight size={12} />
      </Link>
    )}
  </div>
);

const BookCard = ({ book }) => (
  <Link
    to={`/e-library/${book._id}`}
    className="flex-shrink-0 w-32 group"
  >
    <div className="w-32 h-44 rounded-xl bg-gray-100 dark:bg-gray-900 overflow-hidden border border-gray-100 dark:border-gray-800 group-hover:-translate-y-1 transition-transform duration-150">
      {book.cover ? (
        <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <BookOpen size={22} className="text-gray-300 dark:text-gray-700 dark:text-gray-300" />
        </div>
      )}
    </div>
    <p className="text-xs font-bold text-gray-800 dark:text-white mt-2 line-clamp-1">{book.title}</p>
    <p className="text-[10px] text-gray-400 line-clamp-1">{book.author}</p>
  </Link>
);

const ActivityRow = ({ item }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 dark:border-white/5 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-[#2C2DE0]/5 dark:bg-[#4F51FF]/10 dark:bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 flex items-center justify-center flex-shrink-0">
      <Clock3 size={14} className="text-[#2C2DE0] dark:text-[#4F51FF]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{item.label}</p>
      <p className="text-[10px] text-gray-400">{item.time}</p>
    </div>
  </div>
);

const VipSeatCard = ({ seat, t }) => (
  <Link
    to="/seats"
    className="flex items-center gap-3 rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 to-white dark:from-amber-500/10 dark:to-gray-950 px-4 py-3"
  >
    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0">
      <Crown size={16} className="text-amber-500" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-black text-gray-900 dark:text-white">
        {t.vipSeat} {seat.seatNumber}
      </p>
      <p className="text-[10px] text-amber-600 dark:text-amber-400">{t.vipHint}</p>
    </div>
  </Link>
);

const HorizontalSkeleton = () => (
  <div className="flex gap-3 overflow-hidden">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="w-32 h-44 rounded-xl bg-gray-100 dark:bg-gray-900 animate-pulse flex-shrink-0" />
    ))}
  </div>
);

const MainContentArea = () => {
  const { t } = useLanguage();
  const mc = t?.mainContent ?? {};

  // Wire these to your real endpoints — placeholders keep the layout
  // working (and gracefully empty) until then.
  const { data: recommended = [], isLoading: loadingRecommended } = useQuery({
    queryKey: ["dashboard", "recommendedBooks"],
    queryFn: async () => [],
  });
  const { data: activity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ["dashboard", "recentActivity"],
    queryFn: async () => [],
  });
  const { data: recentlyViewed = [], isLoading: loadingViewed } = useQuery({
    queryKey: ["dashboard", "recentlyViewed"],
    queryFn: async () => [],
  });
  const { data: vipSeats = [], isLoading: loadingVip } = useQuery({
    queryKey: ["dashboard", "vipSeats"],
    queryFn: async () => [],
  });

  return (
    <div className="flex flex-col gap-8">

      {/* Recommended books */}
      <section>
        <SectionHeader title={mc.recommended ?? "Recommended For You"} href="/e-library" seeAll={mc.seeAll ?? "See all"} />
        {loadingRecommended ? (
          <HorizontalSkeleton />
        ) : recommended.length === 0 ? (
          <p className="text-xs text-gray-400">{mc.emptyRecommended ?? "No recommendations yet — start reading to get suggestions."}</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recommended.map((b) => <BookCard key={b._id} book={b} />)}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Activity history */}
        <section>
          <SectionHeader title={mc.activity ?? "Activity History"} />
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4">
            {loadingActivity ? (
              <div className="py-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-100 dark:bg-gray-900 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="py-8 text-center">
                <History size={20} className="mx-auto text-gray-300 dark:text-gray-700 dark:text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">{mc.emptyActivity ?? "No recent activity yet."}</p>
              </div>
            ) : (
              activity.map((a, i) => <ActivityRow key={i} item={a} />)
            )}
          </div>
        </section>

        {/* Recently viewed */}
        <section>
          <SectionHeader title={mc.recentlyViewed ?? "Recently Viewed"} href="/e-library" seeAll={mc.seeAll ?? "See all"} />
          {loadingViewed ? (
            <HorizontalSkeleton />
          ) : recentlyViewed.length === 0 ? (
            <p className="text-xs text-gray-400">{mc.emptyViewed ?? "Books you open will show up here."}</p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {recentlyViewed.map((b) => <BookCard key={b._id} book={b} />)}
            </div>
          )}
        </section>
      </div>

      {/* VIP seats */}
      <section>
        <SectionHeader title={mc.vipSeats ?? "Best VIP Seats"} href="/seats" seeAll={mc.seeAll ?? "See all"} />
        {loadingVip ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : vipSeats.length === 0 ? (
          <p className="text-xs text-gray-400">{mc.emptyVip ?? "No VIP seats highlighted right now."}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {vipSeats.map((seat) => (
              <VipSeatCard key={seat._id} seat={seat} t={mc} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MainContentArea;

/*
  Add to en.js (top level):

  mainContent: {
    recommended: "Recommended For You",
    activity: "Activity History",
    recentlyViewed: "Recently Viewed",
    vipSeats: "Best VIP Seats",
    seeAll: "See all",
    emptyRecommended: "No recommendations yet — start reading to get suggestions.",
    emptyActivity: "No recent activity yet.",
    emptyViewed: "Books you open will show up here.",
    emptyVip: "No VIP seats highlighted right now.",
    vipSeat: "Seat",
    vipHint: "Premium quiet zone",
  },

  Add to so.js:

  mainContent: {
    recommended: "Kuu Talinaya",
    activity: "Taariikhda Dhaqdhaqaaqa",
    recentlyViewed: "Waxa Dhawaan Aad Eegtay",
    vipSeats: "Kursiyada VIP ee ugu Fiican",
    seeAll: "Dhammaan eeg",
    emptyRecommended: "Wali talooyin ma jiraan — bilow akhriska si aad u hesho soo jeedin.",
    emptyActivity: "Weli dhaqdhaqaaq dhawaan ah ma jiro.",
    emptyViewed: "Buugagta aad furto halkan ayay ka soo muuqan doonaan.",
    emptyVip: "Hadda kursiyo VIP ah lama muujin.",
    vipSeat: "Kursi",
    vipHint: "Aag xasilloon oo heer sare ah",
  },
*/