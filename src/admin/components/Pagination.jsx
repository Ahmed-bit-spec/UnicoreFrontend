import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const Pagination = ({
  page = 1,
  totalPages = 1,
  onPageChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  totalItems = 0,
}) => {
  const { t } = useLanguage();
  const ap = t.adminPanel;

  const rowOptions = [10, 25, 50];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 dark:border-white/10">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span>{ap.common.rowsPerPage}</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
          className="rounded-lg border border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0] dark:ring-[#4F51FF]/30"
        >
          {rowOptions.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span className="hidden sm:inline">
          · {totalItems} {ap.common.status.toLowerCase()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
          {ap.common.page} {page} {ap.common.of} {totalPages}
        </span>
        <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 dark:border-white/10",
            "text-gray-600 dark:text-gray-300 hover:bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 hover:text-[#1E1FAA] dark:text-[#4F51FF] disabled:opacity-40 disabled:pointer-events-none transition-all"
          )}
          aria-label={ap.common.previous}
        >
          <ChevronLeft size={16} />
        </button>
        <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200/80 dark:border-white/10",
            "text-gray-600 dark:text-gray-300 hover:bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 hover:text-[#1E1FAA] dark:text-[#4F51FF] disabled:opacity-40 disabled:pointer-events-none transition-all"
          )}
          aria-label={ap.common.next}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
