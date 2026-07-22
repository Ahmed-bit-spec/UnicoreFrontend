import { motion } from "framer-motion";
import { Armchair, BookOpen, Users, TrendingUp } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const LibraryStatusPanel = ({ stats, loading }) => {
  const { isDark } = useTheme();

  const base = isDark
    ? "bg-black border-white/10"
    : "bg-white dark:bg-gray-900 border-black/8";

  const occupancyPct =
    stats?.totalSeats > 0
      ? Math.round(((stats?.occupiedSeats ?? 0) / stats.totalSeats) * 100)
      : 0;

  const rows = [
    {
      label: "Seats Occupied",
      value: loading ? "—" : String(stats?.occupiedSeats ?? 0),
      sub: `of ${stats?.totalSeats ?? 0} total`,
      icon: Armchair,
      color: "text-[#2C2DE0] dark:text-[#4F51FF]",
      bg: "bg-[#2C2DE0] dark:bg-[#1E1FAA]/10",
    },
    {
      label: "Available Seats",
      value: loading ? "—" : String(stats?.availableSeats ?? 0),
      sub: "right now",
      icon: Armchair,
      color: isDark ? "text-white/60" : "text-black/60",
      bg: isDark ? "bg-white dark:bg-gray-900/6" : "bg-black/5",
    },
    {
      label: "Books Borrowed",
      value: loading ? "—" : String(stats?.borrowedBooks ?? 0),
      sub: `${stats?.overdueBooks ?? 0} overdue`,
      icon: BookOpen,
      color: "text-[#2C2DE0] dark:text-[#4F51FF]",
      bg: "bg-[#2C2DE0] dark:bg-[#1E1FAA]/10",
    },
    {
      label: "Active Today",
      value: loading ? "—" : String(stats?.activeTodayUsers ?? 0),
      sub: "users logged in",
      icon: Users,
      color: isDark ? "text-white/60" : "text-black/60",
      bg: isDark ? "bg-white dark:bg-gray-900/6" : "bg-black/5",
    },
  ];

  return (
    <div className={cn("rounded-xl border p-5 h-full flex flex-col", base)}>
      <div className="flex items-center justify-between mb-4">
        <h3
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-white" : "text-black"
          )}
        >
          Library Status
        </h3>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isDark ? "text-white/30" : "text-black/30"
          )}
        >
          live
        </span>
      </div>

      {/* Occupancy bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-widest",
              isDark ? "text-white/35" : "text-black/40"
            )}
          >
            Seat Occupancy
          </span>
          <span className="text-[11px] font-bold text-[#2C2DE0] dark:text-[#4F51FF]">
            {loading ? "—" : `${occupancyPct}%`}
          </span>
        </div>
        <div
          className={cn(
            "h-1.5 rounded-full overflow-hidden",
            isDark ? "bg-white dark:bg-gray-900/8" : "bg-black/8"
          )}
        >
          {!loading && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPct}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-[#2C2DE0] dark:bg-[#1E1FAA]"
            />
          )}
        </div>
      </div>

      {/* Stat rows */}
      <div className="space-y-2.5 flex-1">
        {rows.map((row, i) => {
          const Icon = row.icon;
          return (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg",
                isDark ? "bg-white dark:bg-gray-900/[0.03]" : "bg-black/[0.02]"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                  row.bg
                )}
              >
                <Icon size={13} className={row.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-widest",
                    isDark ? "text-white/35" : "text-black/40"
                  )}
                >
                  {row.label}
                </p>
                <p
                  className={cn(
                    "text-xs font-bold",
                    isDark ? "text-white" : "text-black"
                  )}
                >
                  {loading ? (
                    <span
                      className={cn(
                        "inline-block h-3.5 w-8 rounded animate-pulse",
                        isDark ? "bg-white dark:bg-gray-900/10" : "bg-black/8"
                      )}
                    />
                  ) : (
                    row.value
                  )}
                </p>
              </div>
              <span
                className={cn(
                  "text-[10px] shrink-0",
                  isDark ? "text-white/25" : "text-black/30"
                )}
              >
                {row.sub}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryStatusPanel;