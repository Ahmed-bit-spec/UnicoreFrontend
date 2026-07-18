// QuickActions.jsx
// Six shortcuts to the things students do most often. Kept to icon + label
// + arrow — no decorative copy that would just be noise at this density.

import { Link } from "react-router-dom";
import { BookOpen, Armchair, BookCopy, BookmarkCheck, Users, UserCircle, ArrowUpRight } from "lucide-react";

const ACTIONS = [
  { icon: BookOpen,      label: "Browse library",      href: "/e-library" },
  { icon: Armchair,      label: "Reserve a seat",       href: "/seats" },
  { icon: BookCopy,      label: "My borrowed books",    href: "/e-library/my-borrows" },
  { icon: BookmarkCheck, label: "My reservations",      href: "/my-reservations" },
  { icon: Users,         label: "Community",            href: "/community" },
  { icon: UserCircle,    label: "Profile",              href: "/profile" },
];

const QuickActions = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    {ACTIONS.map(({ icon: Icon, label, href }) => (
      <Link
        key={href}
        to={href}
        className="group relative bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 pt-4 pb-3.5 flex flex-col gap-3 hover:border-green-300 dark:hover:border-green-700 hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/5 transition-all duration-150"
      >
        <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
          <Icon size={19} className="text-green-500" strokeWidth={2.2} />
        </div>
        <span className="text-[13px] font-bold text-gray-900 dark:text-white leading-snug">{label}</span>
        <ArrowUpRight
          size={13}
          className="absolute top-4 right-4 text-gray-300 dark:text-gray-700 group-hover:text-green-500 transition-colors"
        />
      </Link>
    ))}
  </div>
);

export default QuickActions;