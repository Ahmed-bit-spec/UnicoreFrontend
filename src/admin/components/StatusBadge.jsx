import { cn } from "@/lib/utils";

const variants = {
  green: "bg-green-500/10 text-green-700 ring-green-500/20 dark:text-green-400",
  yellow: "bg-yellow-500/10 text-yellow-700 ring-yellow-500/20 dark:text-yellow-300",
  orange: "bg-orange-500/10 text-orange-700 ring-orange-500/20 dark:text-orange-300",
  red: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-400",
  gray: "bg-gray-500/10 text-gray-700 ring-gray-500/20 dark:text-gray-300",
};

const StatusBadge = ({ label, tone = "gray", className }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ring-1 transition-colors",
      variants[tone] || variants.gray,
      className
    )}
  >
    {label}
  </span>
);

export default StatusBadge;
