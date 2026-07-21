// pages/HomeScreen.jsx — Uniso E-Library
// The Duolingo-style landing screen from the UX storyboard: greeting, streak,
// daily goal ring, "continue reading" card, recommended books, and a single
// "today's challenge" card that chains into the quiz/reward loop.
//
// Design: green-500 (#58CC02) · black · white only, matching bookcard.jsx /
// LibraryHome.jsx. Reuses BookCard + PRIMARY_BTN from your existing
// components rather than introducing a second button style.

import { useNavigate } from "react-router-dom";
import { Flame, BookOpen, Target, Sparkles, ChevronRight, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useGamification } from "./UseGamifiction";
import BookCard, { PRIMARY_BTN } from "../DashboardComponents/bookcard";

// ── Greeting, time-of-day aware ───────────────────────────────────────────────
const useGreeting = (t) => {
  const hour = new Date().getHours();
  if (hour < 12) return t["home.morning"] ?? "Good Morning";
  if (hour < 18) return t["home.afternoon"] ?? "Good Afternoon";
  return t["home.evening"] ?? "Good Evening";
};

// ── Streak pill ────────────────────────────────────────────────────────────
const StreakPill = ({ streak }) => (
  <div
    className={`
      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border
      ${streak > 0 ? "bg-black border-black" : "bg-gray-50 border-gray-200"}
    `}
  >
    <Flame
      size={14}
      className={streak > 0 ? "text-green-500" : "text-gray-300"}
      style={{ fill: streak > 0 ? "currentColor" : "none" }}
    />
    <span className={`text-[13px] font-black ${streak > 0 ? "text-white" : "text-gray-400"}`}>
      {streak} {streak === 1 ? "Day" : "Days"}
    </span>
  </div>
);

// ── Circular-ish goal progress (bar, matches existing progress-bar language) ──
const GoalProgress = ({ pct, pagesRead, goalPages, t }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4">
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-1.5">
        <Target size={14} className="text-green-500" />
        <span className="text-[13px] font-bold text-black">
          {t["home.todaysGoal"] ?? "Today's Goal"}
        </span>
      </div>
      <span className="text-[12px] font-bold text-gray-400">
        {pagesRead}/{goalPages} {t["home.pages"] ?? "pages"}
      </span>
    </div>
    <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-500 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
    <p className="text-[11px] text-gray-400 mt-2 font-medium">
      {pct >= 100
        ? (t["home.goalDone"] ?? "Goal complete — nice work today.")
        : `${pct}% ${t["home.complete"] ?? "complete"}`}
    </p>
  </div>
);

// ── Continue Reading card ─────────────────────────────────────────────────────
const ContinueReadingCard = ({ book, t }) => {
  const navigate = useNavigate();
  if (!book) return null;

  const pct = book.totalPages ? Math.round((book.currentPage / book.totalPages) * 100) : 0;

  return (
    <button
      onClick={() => navigate(`/e-library/reader/${book._id}`)}
      className="w-full text-left bg-black rounded-2xl p-4 flex items-center gap-4 hover:opacity-95 transition-opacity duration-150"
    >
      <div className="w-14 h-[74px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={18} className="text-green-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-green-500 mb-1">
          {t["home.continueReading"] ?? "Continue Reading"}
        </p>
        <p className="text-[14px] font-bold text-white truncate" style={{ fontFamily: "'Georgia', serif" }}>
          {book.title}
        </p>
        <p className="text-[11.5px] text-white/50 mt-0.5">
          {book.chapterLabel ?? `${t["home.page"] ?? "Page"} ${book.currentPage}`}
        </p>
        <div className="h-1 w-full bg-white/15 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ChevronRight size={16} className="text-white/40 flex-shrink-0" />
    </button>
  );
};

// ── Today's Challenge card — the single CTA that starts the quiz/reward loop ──
const ChallengeCard = ({ goalPages, xpReward, onStart, t }) => (
  <div className="bg-white border-2 border-green-500 rounded-2xl p-4 flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
      <Zap size={18} className="text-green-500" style={{ fill: "currentColor" }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-black" style={{ fontFamily: "'Georgia', serif" }}>
        {t["home.challengeTitle"] ?? "Today's Challenge"}
      </p>
      <p className="text-[11.5px] text-gray-400 mt-0.5">
        {(t["home.challengeDesc"] ?? "Read {n} pages, finish the quiz").replace("{n}", goalPages)}
        {" · "}
        <span className="text-green-500 font-bold">+{xpReward} XP</span>
      </p>
    </div>
    <button onClick={onStart} className={`px-4 py-2 rounded-xl text-xs font-bold ${PRIMARY_BTN}`}>
      {t["home.start"] ?? "Start"}
    </button>
  </div>
);

// ── Main HomeScreen ────────────────────────────────────────────────────────────
// Props:
//   studentName        — display name for the greeting
//   continueBook        — { _id, title, author, coverImage, currentPage, totalPages, chapterLabel } | null
//   recommended          — array of book objects, same shape BookCard expects
//   savedBooks           — Set/array of saved book ids, passed straight to BookCard
//   onToggleSave(id)      — save/unsave handler, passed straight to BookCard
//   onStartChallenge()     — called when the user taps "Start" on the challenge card;
//                           wire this to open the last/current book at its next unread page
const HomeScreen = ({
  studentName = "",
  continueBook = null,
  recommended = [],
  savedBooks = [],
  onToggleSave = () => {},
  onStartChallenge = () => {},
}) => {
  const { t } = useLanguage();
  const greeting = useGreeting(t);
  const {
    streak, todayPagesRead, dailyGoalPages, goalPct,
  } = useGamification();

  return (
    <div className="min-h-screen bg-white pb-10">
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 20px" }} className="flex flex-col gap-5">

        {/* ── Header: greeting + streak ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-gray-400 font-medium">
              {greeting}{studentName ? "," : ""}
            </p>
            <h1
              className="text-[20px] font-black text-black tracking-tight m-0"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {studentName || (t["home.reader"] ?? "Reader")}
            </h1>
          </div>
          <StreakPill streak={streak} />
        </div>

        {/* ── Today's goal ── */}
        <GoalProgress pct={goalPct} pagesRead={todayPagesRead} goalPages={dailyGoalPages} t={t} />

        {/* ── Continue reading ── */}
        <ContinueReadingCard book={continueBook} t={t} />

        {/* ── Today's challenge ── */}
        <ChallengeCard
          goalPages={dailyGoalPages}
          xpReward={100}
          onStart={onStartChallenge}
          t={t}
        />

        {/* ── Recommended ── */}
        {recommended.length > 0 && (
          <section>
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={13} className="text-green-500" />
              <h2 className="text-[15px] font-black text-black tracking-tight m-0" style={{ fontFamily: "'Georgia', serif" }}>
                {t["home.recommended"] ?? "Recommended for You"}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {recommended.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  isSaved={savedBooks.includes ? savedBooks.includes(book._id) : savedBooks.has?.(book._id)}
                  onToggleSave={onToggleSave}
                  size="sm"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;